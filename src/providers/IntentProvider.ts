import { AbstractProvider } from 'ethers';
import { HttpSubprovider } from '../internal/transport/HttpSubprovider';
import { WebSocketSubprovider } from '../internal/transport/WebSocketSubprovider';
import { IntentProviderExtended } from '../types/provider';
import { createNetworkError, createInvalidResponseError } from '../types/errors';
import { RecentTxsResponse, TranslatedTx } from '../types/recentTxs';
import { TokenPriceTick, TokenPriceTicksParams, TokenPrice, TokenPriceParams } from '../types/tokenPrice';
import { HistoricalTokenPrice, HistoricalTokenPricesParams } from '../types/historicalTokenPrice';
import { ChainNewTxsParams } from '../types/chainNewTxs';
import { TokenBalance, TokenBalancesParams } from '../types/tokenBalances';

/**
 * IntentProvider is a custom provider implementation that extends ethers.js AbstractProvider.
 * It provides intent-specific functionality while maintaining compatibility with ethers.js.
 * 
 * @example
 * ```typescript
 * // Using default configuration
 * const provider = new IntentProvider();
 * 
 * // Get recent transactions
 * const txs = await provider.getRecentTxs('ethereum', '0x1234...');
 * 
 * // Get translated transaction
 * const tx = await provider.getTranslatedTx('ethereum', '0x5678...');
 * 
 * // Get token price ticks with streaming
 * const priceStream = await provider.getTokenPriceTicks({
 *   chain: 'polygon',
 *   token_address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619'
 * });
 * 
 * for await (const priceTick of priceStream) {
 *   console.log(`Current price: ${priceTick.price.amount} ${priceTick.price.currency}`);
 * }
 * ```
 */
export class IntentProvider extends AbstractProvider implements IntentProviderExtended {
  private readonly httpProvider: HttpSubprovider;
  private readonly wsProvider: WebSocketSubprovider;

  /**
   * Creates a new instance of IntentProvider
   */
  constructor() {
    super();
    this.httpProvider = new HttpSubprovider(
      HttpSubprovider.DEFAULT_URL
    );
    this.wsProvider = new WebSocketSubprovider(
      WebSocketSubprovider.DEFAULT_URL
    );
  }

  /**
   * Normalizes chain names to their API-compatible format
   * @param chain - The chain identifier provided by the user
   * @returns The normalized chain identifier
   * @private
   */
  private normalizeChainName(chain: string): string {
    const chainMap: Record<string, string> = {
      'ethereum': 'eth',
      // Add more mappings as needed
    };
    return chainMap[chain.toLowerCase()] || chain.toLowerCase();
  }

  /**
   * Retrieves recent transactions for a specific wallet on a given chain
   * @param chain - The chain identifier (e.g., 'ethereum', 'polygon')
   * @param wallet - The wallet address to fetch transactions for
   * @returns Promise resolving to an array of translated transactions
   * @throws {IntentProviderError} If the request fails or response is invalid
   */
  async getRecentTxs(chain: string, wallet: string): Promise<TranslatedTx[]> {
    try {
      const normalizedChain = this.normalizeChainName(chain);
      const response = await this.httpProvider.post<RecentTxsResponse>('/intents', {
        id: 'recent-txs',
        params: {
          chain: normalizedChain,
          wallet
        },
        cusRateLimit: -1
      });

      if (!response || !Array.isArray(response.items)) {
        throw createInvalidResponseError('Invalid response format from intents endpoint');
      }

      return response.items;
    } catch (error) {
      if (error instanceof Error) {
        throw createNetworkError(`Failed to fetch recent transactions: ${error.message}`);
      }
      throw createInvalidResponseError('Failed to fetch recent transactions');
    }
  }

  /**
   * Retrieves a translated transaction by its hash
   * @param chain - The chain identifier (e.g., 'ethereum', 'polygon')
   * @param txHash - The transaction hash to fetch
   * @returns Promise resolving to a translated transaction
   * @throws {IntentProviderError} If the request fails or response is invalid
   */
  async getTranslatedTx(chain: string, txHash: string): Promise<TranslatedTx> {
    try {
      const normalizedChain = this.normalizeChainName(chain);
      return await this.httpProvider.post<TranslatedTx>('/intents', {
        id: 'translated-tx',
        params: {
          chain: normalizedChain,
          tx: txHash
        },
        cusRateLimit: -1
      });
    } catch (error) {
      if (error instanceof Error) {
        throw createNetworkError(`Failed to fetch translated transaction: ${error.message}`);
      }
      throw createInvalidResponseError('Failed to fetch translated transaction');
    }
  }

  /**
   * Retrieves real-time price ticks for a specific token on a given chain
   * @param params - The parameters for the token price ticks request
   * @returns AsyncIterable that yields token price ticks as they arrive
   * @throws {IntentProviderError} If the request fails or response is invalid
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
  async *getTokenPriceTicks(params: TokenPriceTicksParams): AsyncIterable<TokenPriceTick> {
    try {
      const normalizedChain = this.normalizeChainName(params.chain);
      yield* this.wsProvider.stream<TokenPriceTick>('/intents', {
        id: 'token-price-ticks',
        params: {
          chain: normalizedChain,
          token_address: params.token_address
        },
        cusRateLimit: -1
      });
    } catch (error) {
      if (error instanceof Error) {
        throw createNetworkError(`Failed to fetch token price ticks: ${error.message}`);
      }
      throw createInvalidResponseError('Failed to fetch token price ticks');
    }
  }

  /**
   * Retrieves historical token prices for a specific token on a given chain
   * @param params - The parameters for the historical token prices request
   * @returns AsyncIterable that yields historical token prices as they arrive
   * @throws {IntentProviderError} If the request fails or response is invalid
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
  async *getHistoricalTokenPrices(params: HistoricalTokenPricesParams): AsyncIterable<HistoricalTokenPrice> {
    try {
      const normalizedChain = this.normalizeChainName(params.chain);
      yield* this.wsProvider.stream<HistoricalTokenPrice>('/intents', {
        id: 'historical-token-prices',
        params: {
          chain: normalizedChain,
          token_address: params.token_address,
          days: params.days,
          hour_interval: params.hour_interval
        },
        cusRateLimit: -1
      });
    } catch (error) {
      if (error instanceof Error) {
        throw createNetworkError(`Failed to fetch historical token prices: ${error.message}`);
      }
      throw createInvalidResponseError('Failed to fetch historical token prices');
    }
  }

  /**
   * Retrieves a stream of new classified transactions on a given chain
   * @param params - The parameters for the chain-new-txs request
   * @returns AsyncIterable that yields translated transactions as they arrive
   * @throws {IntentProviderError} If the request fails or response is invalid
   * 
   * @remarks
   * This method establishes a WebSocket connection to stream new transactions
   * as they are classified on the specified chain. The stream will continue
   * until the consumer stops iterating or the connection is closed.
   * 
   * @example
   * ```typescript
   * // Get stream of new transactions
   * const txStream = await provider.getChainNewTxs({
   *   chain: 'ethereum'
   * });
   * 
   * // Handle each new transaction
   * for await (const tx of txStream) {
   *   console.log(`New transaction: ${tx.classificationData.description}`);
   * }
   * ```
   */
  async *getChainNewTxs(params: ChainNewTxsParams): AsyncIterable<TranslatedTx> {
    try {
      const normalizedChain = this.normalizeChainName(params.chain);
      yield* this.wsProvider.stream<TranslatedTx>('/intents', {
        id: 'chain-new-txs',
        params: {
          chain: normalizedChain
        },
        cusRateLimit: -1
      });
    } catch (error) {
      if (error instanceof Error) {
        throw createNetworkError(`Failed to fetch chain new transactions: ${error.message}`);
      }
      throw createInvalidResponseError('Failed to fetch chain new transactions');
    }
  }

  /**
   * Retrieves the current or historical price of a token at a specific timestamp
   * @param params - The parameters for the token price request
   * @returns Promise resolving to detailed token price information
   * @throws {IntentProviderError} If the request fails or response is invalid
   * 
   * @remarks
   * This method fetches the price of a token at the given timestamp, or the current price
   * if no timestamp is provided. The response includes detailed information about the
   * pricing source, exchange, and liquidity data.
   * 
   * @example
   * ```typescript
   * // Get current token price
   * const currentPrice = await provider.getTokenPrice({
   *   chain: 'ethereum',
   *   token_address: '0xA0b86a33E6441d8f8C7d8c8E8E8E8E8E8E8E8E8E'
   * });
   * console.log(`Current price: ${currentPrice.price.amount} ${currentPrice.price.currency}`);
   * 
   * // Get historical token price
   * const historicalPrice = await provider.getTokenPrice({
   *   chain: 'ethereum', 
   *   token_address: '0xA0b86a33E6441d8f8C7d8c8E8E8E8E8E8E8E8E8E',
   *   timestamp: '1640995200'
   * });
   * console.log(`Price at timestamp: ${historicalPrice.price.amount} ${historicalPrice.price.currency}`);
   * ```
   */
  async getTokenPrice(params: TokenPriceParams): Promise<TokenPrice> {
    try {
      const normalizedChain = this.normalizeChainName(params.chain);
      const requestParams: any = {
        chain: normalizedChain,
        token_address: params.token_address,
        // Use provided timestamp or current timestamp if not provided
        timestamp: params.timestamp || Math.floor(Date.now() / 1000).toString()
      };

      return await this.httpProvider.post<TokenPrice>('/intents', {
        id: 'token-price',
        params: requestParams,
        cusRateLimit: -1
      });
    } catch (error) {
      if (error instanceof Error) {
        throw createNetworkError(`Failed to fetch token price: ${error.message}`);
      }
      throw createInvalidResponseError('Failed to fetch token price');
    }
  }

  /**
   * Retrieves the current token balances for a specific wallet on a given chain
   * @param params - The parameters for the token balances request
   * @returns Promise resolving to an array of token balance objects
   * @throws {IntentProviderError} If the request fails or response is invalid
   * 
   * @remarks
   * This method fetches all token balances for a wallet on the specified chain,
   * including native tokens and ERC-20 tokens. Each balance includes the token
   * information, balance amount, and USD value when available.
   * 
   * @example
   * ```typescript
   * // Get token balances for a wallet
   * const balances = await provider.getTokensBalances({
   *   chain: 'ethereum',
   *   wallet: '0x9b1054d24dc31a54739b6d8950af5a7dbaa56815'
   * });
   * 
   * // Display balances with USD values
   * balances.forEach(balance => {
   *   const usdDisplay = balance.usdValue ? `$${balance.usdValue}` : 'N/A';
   *   console.log(`${balance.token.symbol}: ${balance.balance} (${usdDisplay})`);
   * });
   * 
   * // Filter tokens with significant balances
   * const significantBalances = balances.filter(balance => 
   *   balance.usdValue && parseFloat(balance.usdValue) > 1
   * );
   * ```
   */
  async getTokensBalances(params: TokenBalancesParams): Promise<TokenBalance[]> {
    try {
      const normalizedChain = this.normalizeChainName(params.chain);
      return await this.httpProvider.post<TokenBalance[]>('/intents', {
        id: 'token-balances',
        params: {
          chain: normalizedChain,
          wallet: params.wallet
        },
        cusRateLimit: -1
      });
    } catch (error) {
      if (error instanceof Error) {
        throw createNetworkError(`Failed to fetch token balances: ${error.message}`);
      }
      throw createInvalidResponseError('Failed to fetch token balances');
    }
  }
} 