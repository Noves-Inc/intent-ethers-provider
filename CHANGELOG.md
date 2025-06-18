# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.4] - 2025-06-18

### Added
- New `getTokensBalances` method to retrieve current token balances for a wallet on any supported chain
- Added comprehensive type definitions for token balance responses including balance amounts, USD values, and token metadata
- Added support for both native tokens and ERC-20 tokens with detailed pricing information when available
- Added unit tests and comprehensive documentation with examples for the new token balances functionality
- Enhanced API documentation with filtering examples and balance display patterns

## [0.1.3] - 2025-06-12

### Added
- New `getTokenPrice` method to retrieve current or historical token prices with detailed pricing information
- Added comprehensive type definitions for token price responses including exchange and liquidity data
- Added support for historical price queries using timestamp parameters
- Added unit tests and documentation for the new token price functionality
- Enhanced API documentation with examples for both current and historical price fetching

## [0.1.2] - 2025-06-02

### Added
- New `getChainNewTxs` method to stream real-time classified transactions from any supported chain
- Added comprehensive documentation and examples for the new transaction streaming feature
- Added unit tests for the new transaction streaming functionality

## [0.1.1] - 2025-05-28

### Changed
- Improved module exports configuration for better Next.js compatibility
- Removed `type: "module"` from package.json to support both ESM and CommonJS
- Added `sideEffects: false` for better tree-shaking
- Updated tsup configuration with proper ESM/CommonJS output extensions
- Enhanced build configuration with esbuild options for better compatibility
- Modified export syntax in index.ts for better module resolution

### Fixed
- Module resolution issues in Next.js environments
- Export compatibility between ESM and CommonJS formats 