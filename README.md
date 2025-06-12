# @noves/intent-ethers-provider

A high-performance TypeScript library for intent-based interactions, designed to be compatible with ethers.js v6.


## Installation

```bash
pnpm add @noves/intent-ethers-provider
```

## Quick Start

```typescript
import { IntentProvider } from '@noves/intent-ethers-provider';

// Initialize the provider
const provider = new IntentProvider();

// Get recent transactions for a wallet
const txs = await provider.getRecentTxs('ethereum', '0x28c6c06298d514db089934071355e5743bf21d60');
console.log(txs[0].classificationData.description);

// Get a human-readable descripcion of a transaction
const tx = await provider.getTranslatedTx('ethereum', '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f');
console.log(`Transaction description: ${tx.classificationData.description}`);

// Get current token price
const currentPrice = await provider.getTokenPrice({
  chain: 'ethereum',
  token_address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
});
console.log(`Current price: ${currentPrice.price.amount} ${currentPrice.price.currency}`);

// Get historical token price
const historicalPrice = await provider.getTokenPrice({
  chain: 'ethereum',
  token_address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // USDT
  timestamp: '1749685977'
});
console.log(`Historical price: ${historicalPrice.price.amount} ${historicalPrice.price.currency}`);

// Get real-time price updates
const priceStream = await provider.getTokenPriceTicks({
  chain: 'polygon',
  token_address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619' // WETH on Polygon
});

// Handle price updates
for await (const priceTick of priceStream) {
  console.log(`Current price: ${priceTick.price.amount} ${priceTick.price.currency}`);
}

// Get stream of new transactions on a chain
const txStream = await provider.getChainNewTxs({
  chain: 'ethereum'
});

// Handle new transactions as they arrive
for await (const tx of txStream) {
  console.log(`New transaction: ${tx.classificationData.description}`);
}
```

## API Reference

### `getRecentTxs(chain: string, wallet: string)`
Retrieves recent transactions for a wallet with full translation and classification.

```typescript
const txs = await provider.getRecentTxs('ethereum', '0x28c6c06298d514db089934071355e5743bf21d60');
// Returns: Promise<TranslatedTx[]>
```

### `getTranslatedTx(chain: string, txHash: string)`
Gets detailed information about a specific transaction, including human-readable descriptions and classification data.

```typescript
const tx = await provider.getTranslatedTx('ethereum', '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f');
// Returns: Promise<TranslatedTx>
```

### `getTokenPrice(params: TokenPriceParams)`
Retrieves the current or historical price of a token at a specific timestamp. Returns detailed price information including exchange and liquidity data.

```typescript
// Get current token price
const currentPrice = await provider.getTokenPrice({
  chain: 'ethereum',
  token_address: '0xA0b86a33E6441d8f8C7d8c8E8E8E8E8E8E8E8E8E' // USDT
});

// Get historical token price
const historicalPrice = await provider.getTokenPrice({
  chain: 'ethereum',
  token_address: '0xA0b86a33E6441d8f8C7d8c8E8E8E8E8E8E8E8E8E', // USDT
  timestamp: '1640995200' // Unix timestamp
});
// Returns: Promise<TokenPrice>
```

### `getTokenPriceTicks(params: TokenPriceTicksParams)`
Streams real-time price updates for a token. Returns an async iterable that yields price ticks as they arrive.

```typescript
const priceStream = await provider.getTokenPriceTicks({
  chain: 'polygon',
  token_address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619' // WETH on Polygon
});
// Returns: AsyncIterable<TokenPriceTick>
```

### `getHistoricalTokenPrices(params: HistoricalTokenPricesParams)`
Streams historical price data for a token with customizable time ranges and intervals.

```typescript
const historicalPrices = await provider.getHistoricalTokenPrices({
  chain: 'polygon',
  token_address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', // WETH on Polygon
  days: 2,
  hour_interval: 12
});
// Returns: AsyncIterable<HistoricalTokenPrice>
```

### `getChainNewTxs(params: ChainNewTxsParams)`
Streams new transactions as they are classified on a given chain. Returns an async iterable that yields translated transactions with full classification data.

```typescript
const txStream = await provider.getChainNewTxs({
  chain: 'ethereum'
});
// Returns: AsyncIterable<TranslatedTx>
```

## Error Handling

The library uses a custom error type `IntentProviderError` with specific error codes:
- `NETWORK_ERROR`: Connection or network-related issues
- `INVALID_RESPONSE`: Malformed or invalid responses
- `UNAUTHORIZED`: Authentication failures
- `RATE_LIMITED`: Rate limit exceeded

## License

MIT