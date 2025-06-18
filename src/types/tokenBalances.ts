/**
 * Represents a token's basic information for balance data
 * Contains essential metadata about the token
 */
export interface BalanceToken {
  /** Token symbol (e.g., "ETH", "USDC") */
  symbol: string;
  /** Full token name */
  name: string;
  /** Number of decimal places for the token */
  decimals: number;
  /** Token contract address or native token identifier */
  address: string;
  /** Current token price in USD as string, null if unavailable */
  price: string | null;
}

/**
 * Represents a token balance entry for a wallet
 * Contains the balance amount and USD value along with token information
 */
export interface TokenBalance {
  /** Token balance as a string representation of a decimal number */
  balance: string;
  /** USD value of the token balance, null if price unavailable */
  usdValue: string | null;
  /** Token information */
  token: BalanceToken;
}

/**
 * Parameters for requesting token balances
 * Used to specify which wallet's balances to retrieve on a specific chain
 */
export interface TokenBalancesParams {
  /** Chain identifier (e.g., 'ethereum', 'polygon') */
  chain: string;
  /** Wallet address to fetch balances for */
  wallet: string;
}

/**
 * Response type for token balances request
 * Array of token balance objects for the specified wallet
 */
export type TokenBalancesResponse = TokenBalance[]; 