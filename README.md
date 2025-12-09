# Hydromancer Trading UI

MVP trading interface using Hydromancer API to simulate Hyperliquid features

## Tech Stack

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **Axios** - HTTP client
- **Lightweight Charts** - Trading charts
- **React Query** - Data fetching

## Project Structure

```
├── app/                 # Next.js app directory
├── components/          # React components
├── lib/                 # API clients and utilities
│   ├── hydromancer.ts  # Hydromancer REST API client
│   └── websocket.ts    # WebSocket client
├── types/              # TypeScript type definitions
├── hooks/              # Custom React hooks
└── utils/              # Utility functions
```

## Getting Started

1. Install dependencies:
```bash
yarn install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Add your Hydromancer API key to `.env`:
```
NEXT_PUBLIC_HYDROMANCER_API_KEY=your_api_key_here
```

3. Run development server:
```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000)

## Features Roadmap

### MVP Phase (Current)
- [ ] Market selection & search
- [ ] Real-time price charts (TradingView-style)
- [ ] Live orderbook
- [ ] Basic order placement (market/limit)
- [ ] Position monitoring
- [ ] Wallet integration
- [ ] Risk indicators

### Future Enhancements
- [ ] Advanced order types (stop-loss, take-profit)
- [ ] Portfolio analytics
- [ ] Trade history
- [ ] Copy trading features
- [ ] Mobile responsive design

## API Integration

This project uses:
- **Hydromancer API** for market data, orderbook, and trading
- **Hyperliquid SDK** (optional) for wallet operations and on-chain interactions

## License

ISC
