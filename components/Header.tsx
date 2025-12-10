'use client'

import { useState } from 'react'
import { useTradingStore } from '@/lib/store'
import { useWallet } from '@/hooks/useWallet'
import { formatUSD, getChangeColor } from '@/utils/formatters'

export default function Header() {
  const [showImportModal, setShowImportModal] = useState(false)
  const [privateKeyInput, setPrivateKeyInput] = useState('')
  
  const isConnected = useTradingStore((state) => state.isConnected)
  const account = useTradingStore((state) => state.account)
  
  const {
    address,
    isConnected: walletConnected,
    isLoading,
    error,
    connectWallet,
    disconnectWallet,
    formatAddress,
  } = useWallet()

  const handleImportWallet = async () => {
    try {
      await connectWallet(privateKeyInput)
      setShowImportModal(false)
      setPrivateKeyInput('')
    } catch (err) {
      console.error('Failed to import wallet:', err)
    }
  }

  const handleConnectFromEnv = async () => {
    try {
      await connectWallet()
    } catch (err) {
      console.error('Failed to connect wallet:', err)
    }
  }

  return (
    <>
      <header className="bg-slate-900 border-b border-slate-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold">Hydromancer</h1>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm text-gray-400">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {account && (
                <>
                  <div>
                    <div className="text-xs text-gray-400">Balance</div>
                    <div className="font-semibold">{formatUSD(account.balance)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Available Margin</div>
                    <div className="font-semibold">{formatUSD(account.marginAvailable)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Total PnL</div>
                    <div className={`font-semibold ${getChangeColor(account.totalPnl)}`}>
                      {formatUSD(account.totalPnl)}
                    </div>
                  </div>
                </>
              )}
              
              {walletConnected ? (
                <div className="flex items-center gap-3">
                  <div className="bg-slate-800 px-4 py-2 rounded-lg">
                    <div className="text-xs text-gray-400">Wallet</div>
                    <div className="font-mono font-semibold">{formatAddress()}</div>
                  </div>
                  <button
                    onClick={disconnectWallet}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded font-medium"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleConnectFromEnv}
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium disabled:opacity-50"
                  >
                    {isLoading ? 'Connecting...' : 'Connect Wallet'}
                  </button>
                  <button
                    onClick={() => setShowImportModal(true)}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded font-medium"
                  >
                    Import Key
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {error && (
            <div className="mt-2 text-sm text-red-500">
              {error}
            </div>
          )}
        </div>
      </header>

      {/* Import Private Key Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Import Private Key</h2>
            
            <div className="bg-yellow-500 bg-opacity-10 border border-yellow-500 rounded p-3 mb-4 text-sm">
              ⚠️ <strong>Warning:</strong> Never share your private key with anyone. Make sure you're in a secure environment.
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">
                Private Key
              </label>
              <input
                type="password"
                value={privateKeyInput}
                onChange={(e) => setPrivateKeyInput(e.target.value)}
                placeholder="Enter your private key (with or without 0x)"
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-blue-500 font-mono text-sm"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleImportWallet}
                disabled={!privateKeyInput || isLoading}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium disabled:opacity-50"
              >
                {isLoading ? 'Importing...' : 'Import'}
              </button>
              <button
                onClick={() => {
                  setShowImportModal(false)
                  setPrivateKeyInput('')
                }}
                className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 rounded font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
