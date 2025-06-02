/**
 * Types for the chain-new-txs intent
 */

/**
 * Parameters for the chain-new-txs intent request
 */
export interface ChainNewTxsParams {
  /** The chain identifier (e.g., 'ethereum', 'polygon') */
  chain: string;
}

/**
 * Represents a token in a transaction
 */
export interface Token {
  /** Token symbol */
  symbol: string;
  /** Token name */
  name: string;
  /** Number of decimals */
  decimals: number;
  /** Token contract address */
  address: string;
}

/**
 * Represents an address with name and address fields
 */
export interface Address {
  /** Name of the address */
  name: string;
  /** Address value */
  address: string;
}

/**
 * Represents a transaction action (sent or received)
 */
export interface TransactionAction {
  /** Type of action performed */
  action: string;
  /** Sender information */
  from: Address;
  /** Recipient information */
  to?: {
    /** Name of the recipient */
    name: string | null;
    /** Address of the recipient */
    address: string | null;
  };
  /** Amount of tokens */
  amount: string;
  /** Token information */
  token: Token;
}

/**
 * Represents the classification data for a transaction
 */
export interface ClassificationData {
  /** Type of transaction */
  type: string;
  /** Source of the classification */
  source: {
    /** Type of source */
    type: string;
  };
  /** Human readable description of the transaction */
  description: string;
  /** Protocol information */
  protocol: {
    /** Name of the protocol */
    name: string | null;
  };
  /** Sent actions */
  sent: TransactionAction[];
  /** Received actions */
  received: TransactionAction[];
}

/**
 * Represents the raw transaction data
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
  /** Gas limit */
  gas: number;
  /** Actual gas used */
  gasUsed: number;
  /** Gas price in wei */
  gasPrice: number;
  /** Transaction fee */
  transactionFee: {
    /** Transaction fee amount */
    amount: string;
    /** Token information */
    token: Token;
  };
  /** Unix timestamp of the transaction */
  timestamp: number;
}

/**
 * Represents a translated transaction from the chain-new-txs intent
 */
export interface TranslatedTx {
  /** Version of the transaction type classification */
  txTypeVersion: number;
  /** Chain identifier */
  chain: string;
  /** The account address being analyzed */
  accountAddress: string;
  /** Classification data */
  classificationData: ClassificationData;
  /** Raw transaction data */
  rawTransactionData: RawTransactionData;
} 