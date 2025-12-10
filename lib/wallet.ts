import { ethers } from 'ethers'

export class WalletService {
  private wallet: ethers.Wallet | null = null
  private address: string | null = null

  /**
   * Initialize wallet from private key
   */
  async initFromPrivateKey(privateKey: string): Promise<string> {
    try {
      // Remove '0x' prefix if present
      const cleanKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey
      
      // Create wallet from private key
      this.wallet = new ethers.Wallet(cleanKey)
      this.address = this.wallet.address
      
      return this.address
    } catch (error) {
      console.error('Failed to initialize wallet:', error)
      throw new Error('Invalid private key')
    }
  }

  /**
   * Get wallet address
   */
  getAddress(): string | null {
    return this.address
  }

  /**
   * Get wallet instance
   */
  getWallet(): ethers.Wallet | null {
    return this.wallet
  }

  /**
   * Sign message
   */
  async signMessage(message: string): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet not initialized')
    }
    return await this.wallet.signMessage(message)
  }

  /**
   * Sign transaction data for Hyperliquid
   */
  async signTransaction(txData: any): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet not initialized')
    }

    // Hyperliquid uses EIP-712 typed data signing
    // This is a simplified version - adjust based on Hyperliquid's actual requirements
    const messageHash = ethers.hashMessage(JSON.stringify(txData))
    return await this.wallet.signMessage(messageHash)
  }

  /**
   * Sign typed data (EIP-712)
   */
  async signTypedData(
    domain: ethers.TypedDataDomain,
    types: Record<string, Array<ethers.TypedDataField>>,
    value: Record<string, any>
  ): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet not initialized')
    }
    return await this.wallet.signTypedData(domain, types, value)
  }

  /**
   * Format address for display
   */
  formatAddress(address?: string): string {
    const addr = address || this.address
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  /**
   * Check if wallet is connected
   */
  isConnected(): boolean {
    return this.wallet !== null && this.address !== null
  }

  /**
   * Disconnect wallet
   */
  disconnect(): void {
    this.wallet = null
    this.address = null
  }
}

// Singleton instance
export const walletService = new WalletService()

// Auto-initialize from environment variable if available
if (typeof window !== 'undefined') {
  const privateKey = process.env.NEXT_PUBLIC_WALLET_PRIVATE_KEY
  if (privateKey && privateKey !== 'your_private_key_here') {
    walletService.initFromPrivateKey(privateKey).catch((error) => {
      console.error('Failed to auto-initialize wallet:', error)
    })
  }
}
