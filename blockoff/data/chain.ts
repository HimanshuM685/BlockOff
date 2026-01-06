/* eslint-disable @typescript-eslint/no-explicit-any */

// Chain interface definition
export interface ChainConfig {
  id: string;
  name: string;
  displayName: string;
  symbol: string;
  chainId: number;
  rpcUrl: string;
  explorer: string;
  faucet?: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  imageUrl: any;
  testnet: boolean;
  type: 'evm' | 'other';
  gasSettings?: {
    defaultGasLimit: string;
    defaultGasPrice: string;
    maxFeePerGas?: string;
    maxPriorityFeePerGas?: string;
  };
  features: string[];
}

// Currency interface definition
export interface CurrencyConfig {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  imageUrl: any;
  chains: string[]; // Chain IDs where this currency is available
  contractAddress?: string; // For ERC-20 tokens
  isNative: boolean;
}

// Supported chains configuration
export const CHAINS: Record<string, ChainConfig> = {
  sepolia: {
    id: 'sepolia',
    name: 'Ethereum Sepolia',
    displayName: 'Sepolia',
    symbol: 'BOFF',
    chainId: 11155111,
    rpcUrl: 'https://rpc.sepolia.org',
    explorer: 'https://sepolia.etherscan.io',
    faucet: 'https://sepoliafaucet.com',
    nativeCurrency: {
      name: 'BlockOff',
      symbol: 'BOFF',
      decimals: 18,
    },
    imageUrl: require('../assets/images/chains_currencies/ethereum-eth-logo.png'),
    testnet: true,
    type: 'evm',
    gasSettings: {
      defaultGasLimit: '21000',
      defaultGasPrice: '1500000000', // 1.5 Gwei
    },
    features: ['evm-compatible', 'smart-contracts'],
  },
};

// Supported currencies configuration
export const CURRENCIES: Record<string, CurrencyConfig> = {
  eth: {
    id: 'eth',
    name: 'BlockOff',
    symbol: 'BOFF',
    decimals: 18,
    imageUrl: require('../assets/images/chains_currencies/ethereum-eth-logo.png'),
    chains: ['sepolia'],
    isNative: true,
  },
};

// Default selections
export const DEFAULT_CHAIN = CHAINS.sepolia;
export const DEFAULT_CURRENCY = CURRENCIES.eth;

// Utility functions
export const getChainById = (chainId: string): ChainConfig | undefined => {
  return CHAINS[chainId];
};

export const getCurrencyById = (currencyId: string): CurrencyConfig | undefined => {
  return CURRENCIES[currencyId];
};

export const getChainsByType = (type: ChainConfig['type']): ChainConfig[] => {
  return Object.values(CHAINS).filter(chain => chain.type === type);
};

export const getCurrenciesByChain = (chainId: string): CurrencyConfig[] => {
  return Object.values(CURRENCIES).filter(currency => 
    currency.chains.includes(chainId)
  );
};

export const getNativeCurrencyForChain = (chainId: string): CurrencyConfig | undefined => {
  return Object.values(CURRENCIES).find(currency => 
    currency.chains.includes(chainId) && currency.isNative
  );
};

export const getTestnetChains = (): ChainConfig[] => {
  return Object.values(CHAINS).filter(chain => chain.testnet);
};

export const getMainnetChains = (): ChainConfig[] => {
  return Object.values(CHAINS).filter(chain => !chain.testnet);
};

export const getSupportedChainIds = (): number[] => {
  return Object.values(CHAINS).map(chain => chain.chainId);
};

export const getChainByChainId = (chainId: number): ChainConfig | undefined => {
  return Object.values(CHAINS).find(chain => chain.chainId === chainId);
};

// Export arrays for backward compatibility
export const CHAINS_ARRAY = Object.values(CHAINS);
export const CURRENCIES_ARRAY = Object.values(CURRENCIES);

// Type exports for external use
export type { ChainConfig as ChainConfigType, CurrencyConfig as CurrencyConfigType };
