# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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