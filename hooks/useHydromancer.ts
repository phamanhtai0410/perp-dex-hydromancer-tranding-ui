import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { HydromancerAPI } from '@/lib/hydromancer'
import { useTradingStore } from '@/lib/store'
import { walletService } from '@/lib/wallet'
import { useEffect, useRef } from 'react'

// Create API instance
let apiInstance: HydromancerAPI | null = null

function getAPI() {
  if (!apiInstance) {
    apiInstance = new HydromancerAPI(
      process.env.NEXT_PUBLIC_HYDROMANCER_API_KEY || '',
      process.env.NEXT_PUBLIC_HYDROMANCER_API_URL
    )
  }
  return apiInstance
}

// Hook to update API when wallet connects
export function useAPIWalletSync() {
  const walletAddress = walletService.getAddress()
  
  useEffect(() => {
    if (walletAddress && apiInstance) {
      apiInstance.setWalletAddress(walletAddress)
    }
  }, [walletAddress])
}

export function useMarkets() {
  const setMarkets = useTradingStore((state) => state.setMarkets)

  return useQuery({
    queryKey: ['markets'],
    queryFn: async () => {
      const api = getAPI()
      const symbols = await api.getSymbols()
      // Limit to top symbols for performance
      const topSymbols = symbols.slice(0, 20)
      const markets = await Promise.all(
        topSymbols.map(symbol => api.getMarketData(symbol))
      )
      setMarkets(markets)
      return markets
    },
    refetchInterval: 30000,
    staleTime: 10000,
  })
}

export function useMarketData(symbol: string) {
  const setCurrentMarket = useTradingStore((state) => state.setCurrentMarket)

  return useQuery({
    queryKey: ['market', symbol],
    queryFn: async () => {
      const api = getAPI()
      const market = await api.getMarketData(symbol)
      setCurrentMarket(market)
      return market
    },
    refetchInterval: 5000,
    enabled: !!symbol,
  })
}

export function useCandles(symbol: string, interval: string = '1h') {
  return useQuery({
    queryKey: ['candles', symbol, interval],
    queryFn: () => getAPI().getCandles(symbol, interval),
    refetchInterval: 60000,
    enabled: !!symbol,
    retry: 2,
  })
}

export function useOrderBook(symbol: string) {
  return useQuery({
    queryKey: ['orderbook', symbol],
    queryFn: () => getAPI().getOrderBook(symbol),
    refetchInterval: 2000,
    enabled: !!symbol,
    retry: 2,
  })
}

export function usePositions() {
  const setPositions = useTradingStore((state) => state.setPositions)
  const walletAddress = walletService.getAddress()

  return useQuery({
    queryKey: ['positions', walletAddress],
    queryFn: async () => {
      const api = getAPI()
      const positions = await api.getPositions()
      setPositions(positions)
      return positions
    },
    refetchInterval: 5000,
    enabled: !!walletAddress,
    retry: 2,
  })
}

export function useAccount() {
  const setAccount = useTradingStore((state) => state.setAccount)
  const walletAddress = walletService.getAddress()

  return useQuery({
    queryKey: ['account', walletAddress],
    queryFn: async () => {
      const api = getAPI()
      const account = await api.getAccountInfo()
      setAccount(account)
      return account
    },
    refetchInterval: 5000,
    enabled: !!walletAddress,
    retry: 2,
  })
}

export function usePlaceOrder() {
  const queryClient = useQueryClient()
  const addOrder = useTradingStore((state) => state.addOrder)

  return useMutation({
    mutationFn: (params: {
      symbol: string
      side: 'long' | 'short'
      type: 'market' | 'limit'
      size: number
      price?: number
      leverage?: number
    }) => getAPI().placeOrder(params),
    onSuccess: (data) => {
      addOrder(data)
      queryClient.invalidateQueries({ queryKey: ['positions'] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['account'] })
    },
  })
}

export function useCancelOrder() {
  const queryClient = useQueryClient()
  const removeOrder = useTradingStore((state) => state.removeOrder)

  return useMutation({
    mutationFn: (params: { orderId: string; symbol: string }) => 
      getAPI().cancelOrder(params.orderId, params.symbol),
    onSuccess: (_, params) => {
      removeOrder(params.orderId)
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}

export function useModifyOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: {
      orderId: string
      symbol: string
      size?: number
      price?: number
    }) => getAPI().modifyOrder(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['positions'] })
    },
  })
}
