/**
 * Format a number as currency with appropriate decimal places
 */
export function formatCurrency(value: number, decimals: number = 2): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '0.' + '0'.repeat(decimals)
  }
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/**
 * Format a number as USD currency
 */
export function formatUSD(value: number): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '$0.00'
  }
  return `$${formatCurrency(value, 2)}`
}

/**
 * Format a price with appropriate decimal places based on value
 */
export function formatPrice(price: number): string {
  if (price === undefined || price === null || isNaN(price)) {
    return '0.00'
  }
  if (price >= 1000) return formatCurrency(price, 2)
  if (price >= 1) return formatCurrency(price, 4)
  if (price >= 0.01) return formatCurrency(price, 6)
  return formatCurrency(price, 8)
}

/**
 * Format percentage with sign and color
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '0.00%'
  }
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(decimals)}%`
}

/**
 * Get color class for positive/negative values
 */
export function getChangeColor(value: number): string {
  if (value === undefined || value === null || isNaN(value)) {
    return 'text-gray-400'
  }
  if (value > 0) return 'text-green-500'
  if (value < 0) return 'text-red-500'
  return 'text-gray-400'
}

/**
 * Format large numbers with K, M, B suffixes
 */
export function formatCompactNumber(value: number): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '0.00'
  }
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)}B`
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(2)}K`
  }
  return formatCurrency(value, 2)
}

/**
 * Format timestamp to readable date/time
 */
export function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Format timestamp to time only
 */
export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

/**
 * Calculate PnL percentage
 */
export function calculatePnlPercentage(
  entryPrice: number,
  currentPrice: number,
  side: 'long' | 'short'
): number {
  if (side === 'long') {
    return ((currentPrice - entryPrice) / entryPrice) * 100
  } else {
    return ((entryPrice - currentPrice) / entryPrice) * 100
  }
}

/**
 * Calculate liquidation price for a position
 */
export function calculateLiquidationPrice(
  entryPrice: number,
  leverage: number,
  side: 'long' | 'short'
): number {
  const maintenanceMarginRate = 0.005 // 0.5%
  const liquidationBuffer = 1 - (1 / leverage) - maintenanceMarginRate

  if (side === 'long') {
    return entryPrice * liquidationBuffer
  } else {
    return entryPrice * (2 - liquidationBuffer)
  }
}

/**
 * Validate order size against available balance
 */
export function validateOrderSize(
  size: number,
  price: number,
  leverage: number,
  availableBalance: number
): { valid: boolean; message?: string } {
  const requiredMargin = (size * price) / leverage

  if (requiredMargin > availableBalance) {
    return {
      valid: false,
      message: `Insufficient balance. Required: $${formatCurrency(requiredMargin)}`,
    }
  }

  if (size <= 0) {
    return {
      valid: false,
      message: 'Size must be greater than 0',
    }
  }

  return { valid: true }
}

/**
 * Debounce function for input handling
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }

    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Get side color class
 */
export function getSideColor(side: 'long' | 'short'): string {
  return side === 'long' ? 'text-green-500' : 'text-red-500'
}

/**
 * Get side background color class
 */
export function getSideBgColor(side: 'long' | 'short'): string {
  return side === 'long' ? 'bg-green-500' : 'bg-red-500'
}
