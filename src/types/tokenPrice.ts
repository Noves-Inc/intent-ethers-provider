/**
 * Represents a token's basic information for price data
 * Contains essential metadata about the token being priced
 */
export interface PriceToken {
  /** Token contract address */
  address: string;
  /** Token symbol (e.g., "ETH", "USDC") */
  symbol: string;
  /** Full token name */
  name: string;
}

/**
 * Represents a price with its currency and status
 * Used to track the current state of a price quote
 */
export interface Price {
  /** Price amount as a string to preserve precision */
  amount: string;
  /** Currency symbol for the price (e.g., "USD") */
  currency: string;
  /** Current status of the price quote */
  status: 'resolved' | 'pending' | 'failed';
}

/**
 * Represents the exchange information that provided the price
 * Contains metadata about the source of the price data
 */
export interface Exchange {
  /** Name of the exchange or liquidity source */
  name: string;
}

/**
 * Represents the pricing source information
 * Contains detailed information about how the price was determined
 */
export interface PricedBy {
  /** Address of the liquidity pool used for pricing */
  poolAddress: string;
  /** Exchange information */
  exchange: Exchange;
  /** Available liquidity in the pool */
  liquidity: number;
  /** Base token used for pricing */
  baseToken: PriceToken;
}

/**
 * Represents a single token price tick response
 * Contains complete price information for a specific point in time
 */
export interface TokenPriceTick {
  /** Chain identifier */
  chain: string;
  /** Block number or hash where the price was recorded */
  block: string;
  /** Token information */
  token: PriceToken;
  /** Current price information */
  price: Price;
  /** Pricing source information */
  pricedBy: PricedBy;
  /** Type of price quote */
  priceType: string;
  /** Current status of the price quote */
  priceStatus: string;
}

/**
 * Parameters for requesting token price ticks
 * Used to specify which token's price data to retrieve
 */
export interface TokenPriceTicksParams {
  /** Chain identifier */
  chain: string;
  /** Token contract address */
  token_address: string;
}

/**
 * Represents a detailed token price response from the token-price intent
 * Contains complete price information including exchange and liquidity data
 */
export interface TokenPrice {
  /** The blockchain network identifier */
  chain: string;
  /** Block number where the price was recorded */
  block: string;
  /** Token information */
  token: PriceToken;
  /** Current price information */
  price: Price;
  /** Pricing source information */
  pricedBy: PricedBy;
  /** Method used to determine the price */
  priceType: string;
  /** Current status of the price data */
  priceStatus: string;
  /** Unix timestamp when the price was recorded */
  timestamp: number;
}

/**
 * Parameters for requesting a single token price
 * Used to specify which token's price to retrieve at a specific time
 */
export interface TokenPriceParams {
  /** Chain identifier */
  chain: string;
  /** Token contract address */
  token_address: string;
  /** Timestamp for historical price (optional - defaults to current time if not provided) */
  timestamp?: string;
} 