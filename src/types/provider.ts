import { Provider } from 'ethers';
import { TranslatedTx } from './recentTxs';
import { TokenPriceTick, TokenPriceTicksParams } from './tokenPrice';
import { HistoricalTokenPrice, HistoricalTokenPricesParams } from './historicalTokenPrice';

/**
 * Extended provider interface that adds intent-specific functionality
 * while maintaining full compatibility with ethers.js Provider
 * 
 * @remarks
 * This interface extends the standard ethers.js Provider to add intent-based functionality
 * for transaction translation, price tracking, and historical data. It maintains full
 * compatibility with ethers.js while adding these additional features.
 */
export interface IntentProviderExtended extends Provider {
  /**
   * Retrieves recent transactions for a specific wallet on a given chain
   * @param chain - The chain identifier (e.g., 'ethereum', 'polygon')
   * @param wallet - The wallet address to fetch transactions for
   * @returns Promise resolving to an array of translated transactions
   * @throws {IntentProviderError} If the request fails or response is invalid
   * 
   * @remarks
   * This method fetches and translates recent transactions for a wallet, providing
   * both raw blockchain data and interpreted classification data for each transaction.
   * 
   * @example
   * ```typescript
   * const txs = await provider.getRecentTxs('ethereum', '0x1234...');
   * console.log(txs[0].classificationData.description);
   * ```
   */
  getRecentTxs(chain: string, wallet: string): Promise<TranslatedTx[]>;

  /**
   * Retrieves a translated transaction by its hash
   * @param chain - The chain identifier (e.g., 'ethereum', 'polygon')
   * @param txHash - The transaction hash to fetch
   * @returns Promise resolving to a translated transaction
   * @throws {IntentProviderError} If the request fails or response is invalid
   * 
   * @remarks
   * This method fetches and translates a single transaction by its hash, providing
   * both raw blockchain data and interpreted classification data.
   * 
   * @example
   * ```typescript
   * const tx = await provider.getTranslatedTx('ethereum', '0x1234...');
   * console.log(tx.classificationData.description);
   * ```
   */
  getTranslatedTx(chain: string, txHash: string): Promise<TranslatedTx>;

  /**
   * Retrieves real-time price ticks for a specific token on a given chain
   * @param params - The parameters for the token price ticks request
   * @returns AsyncIterable that yields token price ticks as they arrive
   * @throws {IntentProviderError} If the request fails or response is invalid
   * 
   * @remarks
   * This method establishes a WebSocket connection to stream real-time price updates
   * for a specific token. The stream will continue until the consumer stops iterating
   * or the connection is closed.
   * 
   * @example
   * ```typescript
   * // Get continuous price updates
   * const priceStream = await provider.getTokenPriceTicks({
   *   chain: 'polygon',
   *   token_address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619'
   * });
   * 
   * // Handle each price update
   * for await (const priceTick of priceStream) {
   *   console.log(`Current price: ${priceTick.price.amount} ${priceTick.price.currency}`);
   * }
   * ```
   */
  getTokenPriceTicks(params: TokenPriceTicksParams): AsyncIterable<TokenPriceTick>;

  /**
   * Retrieves historical token prices for a specific token on a given chain
   * @param params - The parameters for the historical token prices request
   * @returns AsyncIterable that yields historical token prices as they arrive
   * @throws {IntentProviderError} If the request fails or response is invalid
   * 
   * @remarks
   * This method streams historical price data for a token over a specified time period.
   * The data is streamed in chronological order, with prices at the specified hour intervals.
   * 
   * @example
   * ```typescript
   * // Get historical price data
   * const priceStream = await provider.getHistoricalTokenPrices({
   *   chain: 'polygon',
   *   token_address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
   *   days: 2,
   *   hour_interval: 12
   * });
   * 
   * // Handle each historical price point
   * for await (const pricePoint of priceStream) {
   *   console.log(`Price at ${new Date(pricePoint.timestamp * 1000)}: ${pricePoint.price.amount} ${pricePoint.price.currency}`);
   * }
   * ```
   */
  getHistoricalTokenPrices(params: HistoricalTokenPricesParams): AsyncIterable<HistoricalTokenPrice>;
} 