import { useState, useEffect } from 'react'
import { walletService } from '@/lib/wallet'
import { useTradingStore } from '@/lib/store'

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize wallet on mount
  useEffect(() => {
    const initWallet = async () => {
      if (walletService.isConnected()) {
        setAddress(walletService.getAddress())
        setIsConnected(true)
      }
    }
    initWallet()
  }, [])

  /**
   * Connect wallet using private key
   */
  const connectWallet = async (privateKey?: string) => {
    setIsLoading(true)
    setError(null)

    try {
      // Use provided private key or get from environment
      const key = privateKey || process.env.NEXT_PUBLIC_WALLET_PRIVATE_KEY

      if (!key || key === 'your_private_key_here') {
        throw new Error('Private key not configured')
      }

      const walletAddress = await walletService.initFromPrivateKey(key)
      setAddress(walletAddress)
      setIsConnected(true)
      
      return walletAddress
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to connect wallet'
      setError(errorMsg)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Disconnect wallet
   */
  const disconnectWallet = () => {
    walletService.disconnect()
    setAddress(null)
    setIsConnected(false)
    setError(null)
  }

  /**
   * Sign a message
   */
  const signMessage = async (message: string) => {
    if (!isConnected) {
      throw new Error('Wallet not connected')
    }
    return await walletService.signMessage(message)
  }

  /**
   * Sign transaction data
   */
  const signTransaction = async (txData: any) => {
    if (!isConnected) {
      throw new Error('Wallet not connected')
    }
    return await walletService.signTransaction(txData)
  }

  /**
   * Format address for display
   */
  const formatAddress = (addr?: string) => {
    return walletService.formatAddress(addr || address || undefined)
  }

  return {
    address,
    isConnected,
    isLoading,
    error,
    connectWallet,
    disconnectWallet,
    signMessage,
    signTransaction,
    formatAddress,
  }
}
