/**
 * Represents a token in a transaction
 * Contains essential metadata about tokens involved in transfers
 */
export interface Token {
  /** Token symbol (e.g. "ETH", "USDC") */
  symbol: string;
  /** Full token name */
  name: string;
  /** Number of decimals for the token */
  decimals: number;
  /** Token contract address */
  address: string;
}

/**
 * Represents an address with optional name
 * Used for both sender and recipient addresses in transactions
 */
export interface AddressWithName {
  /** Name of the address (if available) */
  name: string | null;
  /** Address string */
  address: string | null;
}

/**
 * Represents a transfer action in a transaction
 * Contains detailed information about token transfers
 */
export interface TransferAction {
  /** Type of action performed (e.g., "transfer", "swap") */
  action: string;
  /** Sender information */
  from: {
    /** Name of the sender (if available) */
    name: string;
    /** Sender's address */
    address: string;
  };
  /** Recipient information */
  to: AddressWithName;
  /** Amount of tokens transferred as a string to preserve precision */
  amount: string;
  /** Token information */
  token: Token;
}

/**
 * Represents the classification data for a transaction
 * Contains interpreted and categorized information about the transaction
 */
export interface ClassificationData {
  /** Type of transaction (e.g., "transfer", "swap", "liquidity") */
  type: string;
  /** Source of the classification */
  source: {
    /** Type of classification source */
    type: string;
  };
  /** Human readable description of the transaction */
  description: string;
  /** Protocol information if the transaction involves a DeFi protocol */
  protocol: {
    /** Name of the protocol */
    name: string | null;
  };
  /** Array of sent transfers */
  sent: TransferAction[];
  /** Array of received transfers */
  received: TransferAction[];
}

/**
 * Represents the raw blockchain transaction data
 * Contains the original transaction data from the blockchain
 */
export interface RawTransactionData {
  /** Hash of the transaction */
  transactionHash: string;
  /** Sender's address */
  fromAddress: string;
  /** Recipient's address */
  toAddress: string;
  /** Block number containing the transaction */
  blockNumber: number;
  /** Gas limit for the transaction */
  gas: number;
  /** Actual gas used by the transaction */
  gasUsed: number;
  /** Gas price in wei */
  gasPrice: number;
  /** Transaction fee information */
  transactionFee: {
    /** Fee amount as a string to preserve precision */
    amount: string;
    /** Token used for the fee */
    token: Token;
  };
  /** Unix timestamp of the transaction */
  timestamp: number;
}

/**
 * Represents a single translated transaction
 * Combines raw blockchain data with interpreted classification data
 */
export interface TranslatedTx {
  /** Version of the transaction type classification */
  txTypeVersion: number;
  /** Chain identifier */
  chain: string;
  /** The account address being analyzed */
  accountAddress: string;
  /** Classification data for the transaction */
  classificationData: ClassificationData;
  /** Raw blockchain transaction data */
  rawTransactionData: RawTransactionData;
}

/**
 * Root response type for recent transactions
 * Contains an array of translated transactions
 */
export interface RecentTxsResponse {
  /** Array of translated transactions */
  items: TranslatedTx[];
} 