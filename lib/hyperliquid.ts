import axios, { AxiosInstance } from 'axios'
import { ethers } from 'ethers'
import { walletService } from '@/lib/wallet'

/**
 * Hyperliquid client for trading operations (place, update, cancel orders)
 */
export class HyperliquidClient {
  private client: AxiosInstance
  private wallet: ethers.Wallet | null = null

  constructor(baseURL: string = 'https://api.hyperliquid-testnet.xyz') {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Get wallet from wallet service
    this.wallet = walletService.getWallet()
  }

  /**
   * Sign action with wallet using EIP-712
   */
  private async signAction(action: any, nonce: number): Promise<{ r: string; s: string; v: number }> {
    if (!this.wallet) {
      throw new Error('Wallet not initialized')
    }

    const domain = {
      name: 'Exchange',
      version: '1',
      chainId: 421614, // Arbitrum testnet
      verifyingContract: '0x0000000000000000000000000000000000000000',
    }

    const types = {
      Agent: [
        { name: 'source', type: 'string' },
        { name: 'connectionId', type: 'bytes32' },
      ],
    }

    // Sign the action
    const signature = await this.wallet.signTypedData(domain, types, {
      source: 'a',
      connectionId: ethers.hexlify(ethers.randomBytes(32)),
    })

    const sig = ethers.Signature.from(signature)
    return {
      r: sig.r,
      s: sig.s,
      v: sig.v,
    }
  }

  /**
   * Get user address
   */
  private getUserAddress(): string {
    if (!this.wallet) {
      throw new Error('Wallet not connected')
    }
    return this.wallet.address
  }

  /**
   * Place an order on Hyperliquid
   */
  async placeOrder(params: {
    symbol: string
    side: 'long' | 'short'
    type: 'market' | 'limit'
    size: number
    price?: number
    leverage?: number
  }) {
    if (!this.wallet) {
      throw new Error('Wallet not connected')
    }

    const isBuy = params.side === 'long'
    const isLimit = params.type === 'limit'

    // For market orders, use a price that will execute immediately
    let limitPx = params.price
    if (!isLimit) {
      // Get current market price from info endpoint
      const metaResponse = await this.client.post('/info', {
        type: 'allMids',
      })
      const currentPrice = parseFloat(metaResponse.data[params.symbol] || '0')
      // Set aggressive price for market order
      limitPx = isBuy ? currentPrice * 1.05 : currentPrice * 0.95
    }

    const orderRequest = {
      coin: params.symbol,
      is_buy: isBuy,
      sz: params.size,
      limit_px: limitPx,
      order_type: isLimit
        ? { limit: { tif: 'Gtc' } }
        : { limit: { tif: 'Ioc' } }, // Immediate or Cancel for market orders
      reduce_only: false,
    }

    // Get nonce
    const nonce = Date.now()

    // Sign the order
    const signature = await this.signAction(orderRequest, nonce)

    // Submit order
    const response = await this.client.post('/exchange', {
      action: {
        type: 'order',
        orders: [orderRequest],
        grouping: 'na',
      },
      nonce,
      signature,
      vaultAddress: null,
    })

    if (response.data.status === 'ok') {
      const result = response.data.response.data.statuses[0]
      return {
        id: result.resting?.oid?.toString() || `${Date.now()}`,
        symbol: params.symbol,
        side: params.side,
        type: params.type,
        size: params.size,
        price: limitPx,
        leverage: params.leverage || 1,
        status: 'open' as const,
        timestamp: Date.now(),
      }
    }

    throw new Error(response.data.response?.data?.statuses[0]?.error || 'Failed to place order')
  }

  /**
   * Cancel an order by order ID
   */
  async cancelOrder(orderId: string, symbol: string) {
    if (!this.wallet) {
      throw new Error('Wallet not connected')
    }

    const cancelRequest = {
      coin: symbol,
      oid: parseInt(orderId),
    }

    const nonce = Date.now()
    const signature = await this.signAction(cancelRequest, nonce)

    const response = await this.client.post('/exchange', {
      action: {
        type: 'cancel',
        cancels: [cancelRequest],
      },
      nonce,
      signature,
      vaultAddress: null,
    })

    if (response.data.status === 'ok') {
      return {
        success: true,
        orderId,
      }
    }

    throw new Error('Failed to cancel order')
  }

  /**
   * Cancel an order by client order ID (cloid)
   */
  async cancelOrderByCloid(symbol: string, cloid: string) {
    if (!this.wallet) {
      throw new Error('Wallet not connected')
    }

    const cancelRequest = {
      coin: symbol,
      cloid,
    }

    const nonce = Date.now()
    const signature = await this.signAction(cancelRequest, nonce)

    const response = await this.client.post('/exchange', {
      action: {
        type: 'cancelByCloid',
        cancels: [cancelRequest],
      },
      nonce,
      signature,
      vaultAddress: null,
    })

    if (response.data.status === 'ok') {
      return {
        success: true,
        cloid,
      }
    }

    throw new Error('Failed to cancel order by cloid')
  }

  /**
   * Modify an existing order
   */
  async modifyOrder(params: {
    orderId: string
    symbol: string
    size?: number
    price?: number
  }) {
    if (!this.wallet) {
      throw new Error('Wallet not connected')
    }

    const modifyRequest = {
      oid: parseInt(params.orderId),
      order: {
        coin: params.symbol,
        is_buy: true, // Will be determined by existing order
        sz: params.size,
        limit_px: params.price,
        order_type: { limit: { tif: 'Gtc' } },
        reduce_only: false,
      },
    }

    const nonce = Date.now()
    const signature = await this.signAction(modifyRequest, nonce)

    const response = await this.client.post('/exchange', {
      action: {
        type: 'modify',
        modifies: [modifyRequest],
      },
      nonce,
      signature,
      vaultAddress: null,
    })

    if (response.data.status === 'ok') {
      return {
        success: true,
        orderId: params.orderId,
      }
    }

    throw new Error('Failed to modify order')
  }
}
