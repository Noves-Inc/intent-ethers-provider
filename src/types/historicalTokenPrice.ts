/**
 * Parameters for requesting historical token prices
 * Used to specify the time range and interval for historical price data
 */
export interface HistoricalTokenPricesParams {
  /** Chain identifier */
  chain: string;
  /** Token contract address */
  token_address: string;
  /** Number of days to look back */
  days: number;
  /** Interval between price points in hours */
  hour_interval: number;
}

/**
 * Represents a historical token price response
 * Contains price data for a specific point in time, including metadata about the price source
 * 
 * @remarks
 * This type reuses the same structure as TokenPriceTick with an additional timestamp field
 * to indicate when the price was recorded
 */
export type HistoricalTokenPrice = {
  /** Chain identifier */
  chain: string;
  /** Block number or hash where the price was recorded */
  block: string;
  /** Token information */
  token: {
    /** Token contract address */
    address: string;
    /** Token symbol */
    symbol: string;
    /** Full token name */
    name: string;
  };
  /** Price information */
  price: {
    /** Price amount as a string to preserve precision */
    amount: string;
    /** Currency symbol for the price */
    currency: string;
    /** Current status of the price quote */
    status: 'resolved' | 'pending' | 'failed';
  };
  /** Pricing source information */
  pricedBy: {
    /** Address of the liquidity pool used for pricing */
    poolAddress: string;
    /** Exchange information */
    exchange: {
      /** Name of the exchange or liquidity source */
      name: string;
    };
    /** Available liquidity in the pool */
    liquidity: number;
    /** Base token used for pricing */
    baseToken: {
      /** Token contract address */
      address: string;
      /** Token symbol */
      symbol: string;
      /** Full token name */
      name: string;
    };
  };
  /** Type of price quote */
  priceType: string;
  /** Current status of the price quote */
  priceStatus: string;
  /** Unix timestamp in seconds when the price was recorded */
  timestamp: number;
}; 