export class HydromancerWebSocket {
  private ws: WebSocket | null = null
  private url: string
  private apiKey: string
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private handlers: Map<string, Set<Function>> = new Map()

  constructor(apiKey: string, wsUrl: string = 'wss://ws.hydromancer.xyz') {
    this.apiKey = apiKey
    this.url = wsUrl
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return

    this.ws = new WebSocket(this.url)

    this.ws.onopen = () => {
      console.log('WebSocket connected')
      this.reconnectAttempts = 0
      // Authenticate
      this.send({ type: 'auth', apiKey: this.apiKey })
    }

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        this.emit(data.type, data)
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    this.ws.onclose = () => {
      console.log('WebSocket disconnected')
      this.handleReconnect()
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)
      console.log(`Reconnecting in ${delay}ms...`)
      setTimeout(() => this.connect(), delay)
    }
  }

  subscribe(channel: string, symbol?: string) {
    this.send({ type: 'subscribe', channel, symbol })
  }

  unsubscribe(channel: string, symbol?: string) {
    this.send({ type: 'unsubscribe', channel, symbol })
  }

  on(event: string, handler: Function) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set())
    }
    this.handlers.get(event)?.add(handler)
  }

  off(event: string, handler: Function) {
    this.handlers.get(event)?.delete(handler)
  }

  private emit(event: string, data: any) {
    this.handlers.get(event)?.forEach(handler => handler(data))
  }

  private send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    }
  }

  disconnect() {
    this.ws?.close()
    this.ws = null
  }
}

export default HydromancerWebSocket
