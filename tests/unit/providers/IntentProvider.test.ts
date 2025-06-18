import { describe, it, expect, vi, beforeEach } from 'vitest'
import { IntentProvider } from '../../../src/providers/IntentProvider'
import { TokenPriceTick, TokenPrice } from '../../../src/types/tokenPrice'
import { HistoricalTokenPrice } from '../../../src/types/historicalTokenPrice'
import { TranslatedTx } from '../../../src/types/chainNewTxs'
import { TokenBalance } from '../../../src/types/tokenBalances'

vi.mock('../../../src/internal/transport/HttpSubprovider', () => {
  return {
    HttpSubprovider: vi.fn().mockImplementation(() => {
      return {
        post: vi.fn()
      }
    })
  }
})

vi.mock('../../../src/internal/transport/WebSocketSubprovider', () => {
  return {
    WebSocketSubprovider: vi.fn().mockImplementation(() => {
      return {
        stream: vi.fn()
      }
    })
  }
})

describe('IntentProvider', () => {
  let provider: IntentProvider

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks()
    
    // Create new provider instance
    provider = new IntentProvider()
  })

  describe('getRecentTxs', () => {
    it('should fetch recent transactions for a wallet', async () => {
      const mockResponse = {
        items: [
          {
            hash: '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f',
            classificationData: {
              description: 'Test transaction'
            }
          }
        ]
      }

      // Get the actual HttpSubprovider instance used by IntentProvider
      const httpProvider = (provider as any).httpProvider
      
      // Mock the post method on the actual instance
      vi.mocked(httpProvider.post).mockResolvedValue(mockResponse)

      const result = await provider.getRecentTxs('ethereum', '0x28c6c06298d514db089934071355e5743bf21d60')

      expect(result).toEqual(mockResponse.items)
      expect(httpProvider.post).toHaveBeenCalledWith('/intents', {
        id: 'recent-txs',
        params: {
          chain: 'eth',
          wallet: '0x28c6c06298d514db089934071355e5743bf21d60'
        },
        cusRateLimit: -1
      })
    })
  })

  describe('getTranslatedTx', () => {
    it('should fetch a translated transaction', async () => {
      const mockResponse = {
        hash: '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f',
        classificationData: {
          description: 'Test transaction'
        }
      }

      // Get the actual HttpSubprovider instance used by IntentProvider
      const httpProvider = (provider as any).httpProvider
      
      // Mock the post method on the actual instance
      vi.mocked(httpProvider.post).mockResolvedValue(mockResponse)

      const result = await provider.getTranslatedTx('ethereum', '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f')

      expect(result).toEqual(mockResponse)
      expect(httpProvider.post).toHaveBeenCalledWith('/intents', {
        id: 'translated-tx',
        params: {
          chain: 'eth',
          tx: '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f'
        },
        cusRateLimit: -1
      })
    })
  })

  describe('getTokenPriceTicks', () => {
    it('should stream token price updates', async () => {
      const mockPriceTicks: TokenPriceTick[] = [
        {
          chain: 'polygon',
          block: '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f',
          token: {
            address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
            symbol: 'WETH',
            name: 'Wrapped Ether'
          },
          price: {
            amount: '1000',
            currency: 'USD',
            status: 'resolved'
          },
          pricedBy: {
            poolAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
            exchange: {
              name: 'Uniswap V3'
            },
            liquidity: 1000000,
            baseToken: {
              address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
              symbol: 'USDC',
              name: 'USD Coin'
            }
          },
          priceType: 'spot',
          priceStatus: 'resolved'
        }
      ]

      // Get the actual WebSocketSubprovider instance used by IntentProvider
      const wsProvider = (provider as any).wsProvider
      
      // Mock the stream method on the actual instance
      const mockStream = async function* () {
        for (const tick of mockPriceTicks) {
          yield tick
        }
      }
      vi.mocked(wsProvider.stream).mockImplementation(mockStream)

      const priceStream = provider.getTokenPriceTicks({
        chain: 'polygon',
        token_address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619'
      })

      const results: TokenPriceTick[] = []
      for await (const tick of priceStream) {
        results.push(tick)
      }

      expect(results).toEqual(mockPriceTicks)
      expect(wsProvider.stream).toHaveBeenCalledWith('/intents', {
        id: 'token-price-ticks',
        params: {
          chain: 'polygon',
          token_address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619'
        },
        cusRateLimit: -1
      })
    })
  })

  describe('getHistoricalTokenPrices', () => {
    it('should stream historical token prices', async () => {
      const mockHistoricalPrices: HistoricalTokenPrice[] = [
        {
          chain: 'polygon',
          block: '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f',
          token: {
            address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
            symbol: 'WETH',
            name: 'Wrapped Ether'
          },
          price: {
            amount: '1000',
            currency: 'USD',
            status: 'resolved'
          },
          pricedBy: {
            poolAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
            exchange: {
              name: 'Uniswap V3'
            },
            liquidity: 1000000,
            baseToken: {
              address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
              symbol: 'USDC',
              name: 'USD Coin'
            }
          },
          priceType: 'spot',
          priceStatus: 'resolved',
          timestamp: 1234567890
        }
      ]

      // Get the actual WebSocketSubprovider instance used by IntentProvider
      const wsProvider = (provider as any).wsProvider
      
      // Mock the stream method on the actual instance
      const mockStream = async function* () {
        for (const price of mockHistoricalPrices) {
          yield price
        }
      }
      vi.mocked(wsProvider.stream).mockImplementation(mockStream)

      const historicalStream = provider.getHistoricalTokenPrices({
        chain: 'polygon',
        token_address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
        days: 2,
        hour_interval: 12
      })

      const results: HistoricalTokenPrice[] = []
      for await (const price of historicalStream) {
        results.push(price)
      }

      expect(results).toEqual(mockHistoricalPrices)
      expect(wsProvider.stream).toHaveBeenCalledWith('/intents', {
        id: 'historical-token-prices',
        params: {
          chain: 'polygon',
          token_address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
          days: 2,
          hour_interval: 12
        },
        cusRateLimit: -1
      })
    })
  })

  describe('getChainNewTxs', () => {
    it('should stream new transactions on a chain', async () => {
      const mockTransactions: TranslatedTx[] = [
        {
          txTypeVersion: 1,
          chain: 'ethereum',
          accountAddress: '0x1234567890123456789012345678901234567890',
          classificationData: {
            type: 'transfer',
            source: {
              type: 'onchain'
            },
            description: 'Test transaction',
            protocol: {
              name: null
            },
            sent: [],
            received: []
          },
          rawTransactionData: {
            transactionHash: '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f',
            fromAddress: '0x1234567890123456789012345678901234567890',
            toAddress: '0x0987654321098765432109876543210987654321',
            blockNumber: 12345678,
            gas: 21000,
            gasUsed: 21000,
            gasPrice: 20000000000,
            transactionFee: {
              amount: '420000000000000',
              token: {
                symbol: 'ETH',
                name: 'Ethereum',
                decimals: 18,
                address: '0x0000000000000000000000000000000000000000'
              }
            },
            timestamp: 1234567890
          }
        }
      ]

      // Get the actual WebSocketSubprovider instance used by IntentProvider
      const wsProvider = (provider as any).wsProvider
      
      // Mock the stream method on the actual instance
      const mockStream = async function* () {
        for (const tx of mockTransactions) {
          yield tx
        }
      }
      vi.mocked(wsProvider.stream).mockImplementation(mockStream)

      const txStream = provider.getChainNewTxs({
        chain: 'ethereum'
      })

      const results: TranslatedTx[] = []
      for await (const tx of txStream) {
        results.push(tx)
      }

      expect(results).toEqual(mockTransactions)
      expect(wsProvider.stream).toHaveBeenCalledWith('/intents', {
        id: 'chain-new-txs',
        params: {
          chain: 'eth'
        },
        cusRateLimit: -1
      })
    })
  })

  describe('getTokenPrice', () => {
    it('should fetch current token price', async () => {
      const mockResponse: TokenPrice = {
        chain: 'ethereum',
        block: '18500000',
        token: {
          address: '0xA0b86a33E6441d8f8C7d8c8E8E8E8E8E8E8E8E8E',
          symbol: 'USDT',
          name: 'Tether USD'
        },
        price: {
          amount: '1.0001',
          currency: 'USD',
          status: 'resolved'
        },
        pricedBy: {
          poolAddress: '0x11b815efB8f581194ae79006d24E0d814B7697F6',
          exchange: {
            name: 'Uniswap V3'
          },
          liquidity: 5000000,
          baseToken: {
            address: '0xA0b86a33E6441d8f8C7d8c8E8E8E8E8E8E8E8E8E',
            symbol: 'USDC',
            name: 'USD Coin'
          }
        },
        priceType: 'spot',
        priceStatus: 'resolved',
        timestamp: 1700000000
      }

      // Get the actual HttpSubprovider instance used by IntentProvider
      const httpProvider = (provider as any).httpProvider
      
      // Mock the post method on the actual instance
      vi.mocked(httpProvider.post).mockResolvedValue(mockResponse)

      const result = await provider.getTokenPrice({
        chain: 'ethereum',
        token_address: '0xA0b86a33E6441d8f8C7d8c8E8E8E8E8E8E8E8E8E'
      })

      expect(result).toEqual(mockResponse)
      expect(httpProvider.post).toHaveBeenCalledWith('/intents', {
        id: 'token-price',
        params: {
          chain: 'eth',
          token_address: '0xA0b86a33E6441d8f8C7d8c8E8E8E8E8E8E8E8E8E',
          timestamp: expect.any(String)
        },
        cusRateLimit: -1
      })

      const calledParams = vi.mocked(httpProvider.post).mock.calls[0][1].params
      const timestamp = parseInt(calledParams.timestamp)
      expect(timestamp).toBeGreaterThan(1600000000)
      expect(timestamp).toBeLessThanOrEqual(Math.floor(Date.now() / 1000))
    })

    it('should fetch historical token price with timestamp', async () => {
      const mockResponse: TokenPrice = {
        chain: 'ethereum',
        block: '18400000',
        token: {
          address: '0xA0b86a33E6441d8f8C7d8c8E8E8E8E8E8E8E8E8E',
          symbol: 'USDT',
          name: 'Tether USD'
        },
        price: {
          amount: '0.9999',
          currency: 'USD',
          status: 'resolved'
        },
        pricedBy: {
          poolAddress: '0x11b815efB8f581194ae79006d24E0d814B7697F6',
          exchange: {
            name: 'Uniswap V3'
          },
          liquidity: 4800000,
          baseToken: {
            address: '0xA0b86a33E6441d8f8C7d8c8E8E8E8E8E8E8E8E8E',
            symbol: 'USDC',
            name: 'USD Coin'
          }
        },
        priceType: 'spot',
        priceStatus: 'resolved',
        timestamp: 1640995200
      }

      // Get the actual HttpSubprovider instance used by IntentProvider
      const httpProvider = (provider as any).httpProvider
      
      // Mock the post method on the actual instance
      vi.mocked(httpProvider.post).mockResolvedValue(mockResponse)

      const result = await provider.getTokenPrice({
        chain: 'ethereum',
        token_address: '0xA0b86a33E6441d8f8C7d8c8E8E8E8E8E8E8E8E8E',
        timestamp: '1640995200'
      })

      expect(result).toEqual(mockResponse)
      expect(httpProvider.post).toHaveBeenCalledWith('/intents', {
        id: 'token-price',
        params: {
          chain: 'eth',
          token_address: '0xA0b86a33E6441d8f8C7d8c8E8E8E8E8E8E8E8E8E',
          timestamp: '1640995200'
        },
        cusRateLimit: -1
      })
    })

    it('should handle network errors', async () => {
      // Get the actual HttpSubprovider instance used by IntentProvider
      const httpProvider = (provider as any).httpProvider
      
      // Mock the post method to throw an error
      vi.mocked(httpProvider.post).mockRejectedValue(new Error('Network error'))

      await expect(provider.getTokenPrice({
        chain: 'ethereum',
        token_address: '0xA0b86a33E6441d8f8C7d8c8E8E8E8E8E8E8E8E8E'
      })).rejects.toThrow('Failed to fetch token price: Network error')
    })
  })

  describe('getTokensBalances', () => {
    it('should fetch token balances for a wallet', async () => {
      const mockResponse: TokenBalance[] = [
        {
          balance: '0.154531375828269479',
          usdValue: '386.018837415744138',
          token: {
            symbol: 'ETH',
            name: 'Ether',
            decimals: 18,
            address: 'ETH',
            price: '2497.99650942554462'
          }
        },
        {
          balance: '129.196066522007754429',
          usdValue: null,
          token: {
            symbol: 'ENS',
            name: 'Ethereum Name Service',
            decimals: 18,
            address: '0xc18360217d8f7ab5e7c516566761ea12ce7f9d72',
            price: null
          }
        },
        {
          balance: '7.818702000000000041',
          usdValue: null,
          token: {
            symbol: 'COMP',
            name: 'Compound',
            decimals: 18,
            address: '0xc00e94cb662c3520282e6f5717214004a7f26888',
            price: null
          }
        }
      ]

      // Get the actual HttpSubprovider instance used by IntentProvider
      const httpProvider = (provider as any).httpProvider
      
      // Mock the post method on the actual instance
      vi.mocked(httpProvider.post).mockResolvedValue(mockResponse)

      const result = await provider.getTokensBalances({
        chain: 'ethereum',
        wallet: '0x9b1054d24dc31a54739b6d8950af5a7dbaa56815'
      })

      expect(result).toEqual(mockResponse)
      expect(httpProvider.post).toHaveBeenCalledWith('/intents', {
        id: 'token-balances',
        params: {
          chain: 'eth',
          wallet: '0x9b1054d24dc31a54739b6d8950af5a7dbaa56815'
        },
        cusRateLimit: -1
      })
    })

    it('should handle network errors', async () => {
      // Get the actual HttpSubprovider instance used by IntentProvider
      const httpProvider = (provider as any).httpProvider
      
      // Mock the post method to throw an error
      vi.mocked(httpProvider.post).mockRejectedValue(new Error('Network error'))

      await expect(provider.getTokensBalances({
        chain: 'ethereum',
        wallet: '0x9b1054d24dc31a54739b6d8950af5a7dbaa56815'
      })).rejects.toThrow('Failed to fetch token balances: Network error')
    })

    it('should normalize chain names correctly', async () => {
      const mockResponse: TokenBalance[] = [
        {
          balance: '1.0',
          usdValue: '2500.0',
          token: {
            symbol: 'ETH',
            name: 'Ether',
            decimals: 18,
            address: 'ETH',
            price: '2500.0'
          }
        }
      ]

      // Get the actual HttpSubprovider instance used by IntentProvider
      const httpProvider = (provider as any).httpProvider
      
      // Mock the post method on the actual instance
      vi.mocked(httpProvider.post).mockResolvedValue(mockResponse)

      await provider.getTokensBalances({
        chain: 'ethereum',
        wallet: '0x9b1054d24dc31a54739b6d8950af5a7dbaa56815'
      })

      expect(httpProvider.post).toHaveBeenCalledWith('/intents', {
        id: 'token-balances',
        params: {
          chain: 'eth', // Should be normalized from 'ethereum' to 'eth'
          wallet: '0x9b1054d24dc31a54739b6d8950af5a7dbaa56815'
        },
        cusRateLimit: -1
      })
    })
  })
}) 