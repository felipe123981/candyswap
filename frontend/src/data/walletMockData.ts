// Mock catalog of supported chains / tokens for the on-ramp / off-ramp wallet
// registry. Transak supports a large list of assets — this subset covers the
// most relevant ones with realistic metadata (network names, explorer bases,
// address validation patterns and canonical glyph / Tailwind color per coin).

export interface CoinMeta {
  symbol: string;        // canonical asset symbol (BTC, ETH, USDT ...)
  name: string;          // display name
  network: string;       // network / chain label shown in the UI
  family: 'btc' | 'evm' | 'tron' | 'solana' | 'other'; // address shape family
  color: string;         // tailwind text color class
  chipBg: string;        // tailwind background chip class
  glyph: string;         // fallback text glyph
  explorerBase: string;  // block explorer tx url prefix
  // crude (mock) address validators, one per family
  addressHint: string;
}

export const SUPPORTED_COINS: CoinMeta[] = [
  {
    symbol: 'BTC', name: 'Bitcoin', network: 'Bitcoin', family: 'btc',
    color: 'text-crypto-btc', chipBg: 'bg-crypto-btc/20', glyph: '₿',
    explorerBase: 'https://mempool.space/tx/',
    addressHint: 'bc1… or 1… / 3… (segwit / legacy)',
  },
  {
    symbol: 'ETH', name: 'Ethereum', network: 'ERC-20', family: 'evm',
    color: 'text-crypto-eth', chipBg: 'bg-crypto-eth/20', glyph: 'Ξ',
    explorerBase: 'https://etherscan.io/tx/',
    addressHint: '0x… (42 chars, EIP-55 checksum)',
  },
  {
    symbol: 'USDT', name: 'Tether USD', network: 'ERC-20', family: 'evm',
    color: 'text-crypto-usdt', chipBg: 'bg-crypto-usdt/20', glyph: '₮',
    explorerBase: 'https://etherscan.io/tx/',
    addressHint: '0x… (same shape as ETH)',
  },
  {
    symbol: 'USDC', name: 'USD Coin', network: 'ERC-20', family: 'evm',
    color: 'text-primary-400', chipBg: 'bg-primary-400/20', glyph: '◈',
    explorerBase: 'https://etherscan.io/tx/',
    addressHint: '0x… (same shape as ETH)',
  },
  {
    symbol: 'SOL', name: 'Solana', network: 'Solana', family: 'solana',
    color: 'text-crypto-sol', chipBg: 'bg-crypto-sol/20', glyph: '◎',
    explorerBase: 'https://solscan.io/tx/',
    addressHint: 'Base58, 32–44 chars',
  },
  {
    symbol: 'MATIC', name: 'Polygon', network: 'Polygon PoS', family: 'evm',
    color: 'text-purple-400', chipBg: 'bg-purple-400/20', glyph: '⬢',
    explorerBase: 'https://polygonscan.com/tx/',
    addressHint: '0x… (same shape as ETH)',
  },
  {
    symbol: 'BNB', name: 'BNB Chain', network: 'BEP-20', family: 'evm',
    color: 'text-yellow-400', chipBg: 'bg-yellow-400/20', glyph: '⬡',
    explorerBase: 'https://bscscan.com/tx/',
    addressHint: '0x… (same shape as ETH)',
  },
  {
    symbol: 'TRX', name: 'Tron', network: 'TRC-20', family: 'tron',
    color: 'text-red-400', chipBg: 'bg-red-400/20', glyph: 'T',
    explorerBase: 'https://tronscan.org/#/transaction/',
    addressHint: 'T… (34 chars, base58)',
  },
  {
    symbol: 'LTC', name: 'Litecoin', network: 'Litecoin', family: 'btc',
    color: 'text-slate-300', chipBg: 'bg-slate-300/20', glyph: 'Ł',
    explorerBase: 'https://blockchair.com/litecoin/transaction/',
    addressHint: 'ltc1… or L… / M…',
  },
  {
    symbol: 'BCH', name: 'Bitcoin Cash', network: 'Bitcoin Cash', family: 'btc',
    color: 'text-green-400', chipBg: 'bg-green-400/20', glyph: 'Ƀ',
    explorerBase: 'https://blockchair.com/bitcoin-cash/transaction/',
    addressHint: 'q… / bitcoincash:q… (legacy 1… also valid)',
  },
  {
    symbol: 'DOGE', name: 'Dogecoin', network: 'Dogecoin', family: 'btc',
    color: 'text-amber-400', chipBg: 'bg-amber-400/20', glyph: 'Ð',
    explorerBase: 'https://blockchair.com/dogecoin/transaction/',
    addressHint: 'D… (34 chars)',
  },
  {
    symbol: 'XRP', name: 'Ripple', network: 'XRPL', family: 'other',
    color: 'text-blue-400', chipBg: 'bg-blue-400/20', glyph: '✕',
    explorerBase: 'https://livenet.xrpl.org/transactions/',
    addressHint: 'r… (25–35 chars)',
  },
  {
    symbol: 'ADA', name: 'Cardano', network: 'Cardano', family: 'other',
    color: 'text-sky-400', chipBg: 'bg-sky-400/20', glyph: '₳',
    explorerBase: 'https://cardanoscan.io/transaction/',
    addressHint: 'addr1… (Shelley base/bech32)',
  },
  {
    symbol: 'DOT', name: 'Polkadot', network: 'Polkadot', family: 'other',
    color: 'text-pink-400', chipBg: 'bg-pink-400/20', glyph: '●',
    explorerBase: 'https://polkadot.subscan.io/tx/',
    addressHint: '1… (SS58, 46–48 chars)',
  },
  {
    symbol: 'AVAX', name: 'Avalanche', network: 'Avalanche C-Chain', family: 'evm',
    color: 'text-red-500', chipBg: 'bg-red-500/20', glyph: '▲',
    explorerBase: 'https://snowtrace.io/tx/',
    addressHint: '0x… on C-Chain, X-avax1… / P-avax1… on X/P-Chain',
  },
  {
    symbol: 'LINK', name: 'Chainlink', network: 'ERC-20', family: 'evm',
    color: 'text-blue-300', chipBg: 'bg-blue-300/20', glyph: '⬢',
    explorerBase: 'https://etherscan.io/tx/',
    addressHint: '0x… (same shape as ETH)',
  },
];

export const COIN_BY_SYMBOL: Record<string, CoinMeta> = SUPPORTED_COINS.reduce(
  (acc, coin) => { acc[coin.symbol] = coin; return acc; },
  {} as Record<string, CoinMeta>,
);

// Networks available per asset. Avalanche ships three chains (C-Chain for
// contracts, X-Chain for transfers, P-Chain for staking); stablecoins and
// majors live on several chains at once. This drives the dynamic network
// selects across the app.
export const NETWORKS_BY_SYMBOL: Record<string, string[]> = {
  BTC: ['Bitcoin'],
  ETH: ['ERC-20'],
  USDT: ['ERC-20', 'TRC-20', 'BEP-20', 'Polygon PoS', 'Avalanche C-Chain', 'Solana'],
  USDC: ['ERC-20', 'BEP-20', 'Polygon PoS', 'Avalanche C-Chain', 'Solana'],
  SOL: ['Solana'],
  MATIC: ['Polygon PoS'],
  BNB: ['BEP-20'],
  TRX: ['TRC-20'],
  LTC: ['Litecoin'],
  BCH: ['Bitcoin Cash'],
  DOGE: ['Dogecoin'],
  XRP: ['XRPL'],
  ADA: ['Cardano'],
  DOT: ['Polkadot'],
  AVAX: ['Avalanche C-Chain', 'Avalanche X-Chain', 'Avalanche P-Chain'],
  LINK: ['ERC-20'],
};

export const networksFor = (symbol: string): string[] =>
  NETWORKS_BY_SYMBOL[symbol] ?? [COIN_BY_SYMBOL[symbol]?.network ?? 'Unknown'];

// Mock USD rates per asset (used for the USD estimates across the page).
export const MOCK_USD_RATES: Record<string, number> = {
  BTC: 67250.42,
  ETH: 3185.18,
  USDT: 1.0,
  USDC: 1.0,
  SOL: 172.34,
  MATIC: 0.58,
  BNB: 588.9,
  TRX: 0.124,
  LTC: 84.22,
  BCH: 412.55,
  DOGE: 0.151,
  XRP: 0.523,
  ADA: 0.372,
  DOT: 6.18,
  AVAX: 35.44,
  LINK: 14.92,
};

export type WalletStatus = 'active' | 'pending' | 'disabled';

export interface MockWallet {
  id: string;
  label: string;
  symbol: string;        // asset symbol (key into COIN_BY_SYMBOL)
  network: string;       // network override (USDT can live on many networks)
  address: string;
  balance: number;       // major units
  status: WalletStatus;
  isDefault: boolean;
  addedAt: string;       // ISO
  lastActivity?: string; // ISO
}

export type TxStatus = 'confirmed' | 'pending' | 'failed';
export type TxDirection = 'incoming' | 'outgoing';
export type TxCategory =
  | 'ramp_in'        // fiat → crypto (on-ramp via Transak)
  | 'ramp_out'       // crypto → fiat (off-ramp)
  | 'swap'           // crypto → crypto
  | 'business_in'    // payment received from an integrated business
  | 'business_out'   // payout to an integrated business
  | 'withdrawal'
  | 'deposit';

export interface MockTransaction {
  id: string;
  walletId: string;
  symbol: string;
  direction: TxDirection;
  category: TxCategory;
  amount: number;       // major units
  status: TxStatus;
  txHash: string;
  occurredAt: string;   // ISO
  orderId?: string;
}

export const CATEGORY_LABEL: Record<TxCategory, string> = {
  ramp_in: 'On-Ramp',
  ramp_out: 'Off-Ramp',
  swap: 'Swap',
  business_in: 'Business In',
  business_out: 'Business Out',
  withdrawal: 'Withdrawal',
  deposit: 'Deposit',
};

export const STATUS_CLASS: Record<TxStatus, string> = {
  confirmed: 'border-transparent bg-green-100 text-green-800',
  pending: 'border-transparent bg-yellow-100 text-yellow-800',
  failed: 'border-transparent bg-red-100 text-red-800',
};

export const WALLET_STATUS_CLASS: Record<WalletStatus, string> = {
  active: 'border-transparent bg-green-100 text-green-800',
  pending: 'border-transparent bg-yellow-100 text-yellow-800',
  disabled: 'border-transparent bg-gray-200 text-gray-700',
};

export const initialWallets: MockWallet[] = [
  {
    id: 'w_btc_1', label: 'Cold storage', symbol: 'BTC', network: 'Bitcoin',
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    balance: 0.4821, status: 'active', isDefault: true,
    addedAt: '2024-02-11T10:24:00Z', lastActivity: '2026-10-14T18:02:00Z',
  },
  {
    id: 'w_eth_1', label: 'Main trading', symbol: 'ETH', network: 'ERC-20',
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD38',
    balance: 12.4552, status: 'active', isDefault: false,
    addedAt: '2024-03-02T09:15:00Z', lastActivity: '2026-10-18T11:41:00Z',
  },
  {
    id: 'w_usdt_1', label: 'Settlement wallet', symbol: 'USDT', network: 'TRC-20',
    address: 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE',
    balance: 5230.0, status: 'active', isDefault: false,
    addedAt: '2024-05-19T14:03:00Z', lastActivity: '2026-10-19T08:22:00Z',
  },
  {
    id: 'w_sol_1', label: 'Staking bag', symbol: 'SOL', network: 'Solana',
    address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    balance: 184.2, status: 'pending', isDefault: false,
    addedAt: '2026-10-19T20:10:00Z',
  },
  {
    id: 'w_doge_1', label: 'Deprecated tip jar', symbol: 'DOGE', network: 'Dogecoin',
    address: 'DJRFZNDPNJQYPLMDKNJYHKYRUGJULQWHPV',
    balance: 0, status: 'disabled', isDefault: false,
    addedAt: '2025-06-01T12:00:00Z', lastActivity: '2025-11-30T16:45:00Z',
  },
];

// ─── "Create new wallet" mock generator ─────────────────────────────────
// Deterministic-enough random address / key material per address family.
// MOCK ONLY — never use this for real key material.

const HEX = '0123456789abcdef';
const BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const BECH32 = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';

const randomString = (alphabet: string, length: number): string =>
  Array.from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');

const MNEMONIC_WORDS = [
  'abandon', 'ability', 'access', 'account', 'across', 'address', 'budget',
  'candy', 'castle', 'cavern', 'census', 'cereal', 'chain', 'crystal',
  'depth', 'diamond', 'dolphin', 'dragon', 'echo', 'ember', 'falcon',
  'forest', 'fossil', 'fragment', 'galaxy', 'garden', 'harbor', 'horizon',
  'island', 'jungle', 'krypton', 'legend', 'lunar', 'magnet', 'meadow',
  'meteor', 'mirror', 'nebula', 'nomad', 'ocean', 'orbit', 'panther',
  'phantom', 'pioneer', 'planet', 'quantum', 'rival', 'rocket', 'safari',
  'sahara', 'siren', 'solar', 'sonic', 'summit', 'sunset', 'thunder',
  'tornado', 'vector', 'vortex', 'walnut', 'willow', 'wizard', 'zenith',
];

export interface GeneratedWalletKeys {
  address: string;
  privateKey: string;
  mnemonic: string;
}

export const generateMockWallet = (coin: CoinMeta): GeneratedWalletKeys => {
  let address: string;
  switch (coin.family) {
    case 'evm':
      address = `0x${randomString(HEX, 40)}`;
      break;
    case 'tron':
      address = `T${randomString(BASE58, 33)}`;
      break;
    case 'solana':
      address = randomString(BASE58, 44);
      break;
    case 'btc':
      // bech32 for BTC/LTC, q-style for BCH, D-style for DOGE
      if (coin.symbol === 'BCH') address = `q${randomString(BECH32, 39)}`;
      else if (coin.symbol === 'DOGE') address = `D${randomString(BASE58, 33)}`;
      else if (coin.symbol === 'LTC') address = `ltc1q${randomString(BECH32, 38)}`;
      else address = `bc1q${randomString(BECH32, 38)}`;
      break;
    default:
      if (coin.symbol === 'ADA') address = `addr1q${randomString(BECH32, 54)}`;
      else if (coin.symbol === 'DOT') address = `1${randomString(BASE58, 46)}`;
      else if (coin.symbol === 'XRP') address = `r${randomString(BASE58, 24)}`;
      else address = randomString(BASE58, 34);
  }

  const privateKey =
    coin.family === 'evm'
      ? `0x${randomString(HEX, 64)}`
      : randomString(BASE58, 51);

  const mnemonic = Array.from(
    { length: 12 },
    () => MNEMONIC_WORDS[Math.floor(Math.random() * MNEMONIC_WORDS.length)],
  ).join(' ');

  return { address, privateKey, mnemonic };
};

export const initialTransactions: MockTransaction[] = [
  {
    id: 't1', walletId: 'w_usdt_1', symbol: 'USDT', direction: 'incoming',
    category: 'ramp_in', amount: 1500, status: 'confirmed',
    txHash: '9f8e7d6c5b4a392817f6e5d4c3b2a190887766554433221100ffeeddccbbaa99',
    occurredAt: '2026-10-19T08:22:00Z', orderId: 'ord_8841',
  },
  {
    id: 't2', walletId: 'w_btc_1', symbol: 'BTC', direction: 'incoming',
    category: 'business_in', amount: 0.0341, status: 'confirmed',
    txHash: 'a1b2c3d4e5f60718293a4b5c6d7e8f9001020304050607080910111213141516',
    occurredAt: '2026-10-18T22:47:00Z', orderId: 'ord_8837',
  },
  {
    id: 't3', walletId: 'w_eth_1', symbol: 'ETH', direction: 'outgoing',
    category: 'swap', amount: 1.25, status: 'confirmed',
    txHash: '0x7766554433221100ffeeddccbbaa99887766554433221100ffeeddccbbaa9988',
    occurredAt: '2026-10-18T11:41:00Z',
  },
  {
    id: 't4', walletId: 'w_sol_1', symbol: 'SOL', direction: 'incoming',
    category: 'ramp_in', amount: 45, status: 'pending',
    txHash: '4k3j2h1g0f9e8d7c6b5a493827160514131211101z9y8x7w6v5u4t3s2r1q0p',
    occurredAt: '2026-10-19T20:12:00Z', orderId: 'ord_8852',
  },
  {
    id: 't5', walletId: 'w_btc_1', symbol: 'BTC', direction: 'outgoing',
    category: 'ramp_out', amount: 0.0125, status: 'pending',
    txHash: 'b2c3d4e5f60718293a4b5c6d7e8f900112232425262728293031323334353637',
    occurredAt: '2026-10-17T15:30:00Z', orderId: 'ord_8829',
  },
  {
    id: 't6', walletId: 'w_usdt_1', symbol: 'USDT', direction: 'incoming',
    category: 'business_in', amount: 890.5, status: 'confirmed',
    txHash: '1f2e3d4c5b6a79887766554433221100ffeeddccbbaa9988776655443322110f',
    occurredAt: '2026-10-16T09:05:00Z', orderId: 'ord_8801',
  },
  {
    id: 't7', walletId: 'w_eth_1', symbol: 'ETH', direction: 'incoming',
    category: 'deposit', amount: 3.7, status: 'confirmed',
    txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    occurredAt: '2026-10-15T13:12:00Z',
  },
  {
    id: 't8', walletId: 'w_usdt_1', symbol: 'USDT', direction: 'outgoing',
    category: 'business_out', amount: 240, status: 'failed',
    txHash: '8a7b6c5d4e3f2011022324252627282930313233343536373839404142434445',
    occurredAt: '2026-10-14T17:59:00Z', orderId: 'ord_8790',
  },
  {
    id: 't9', walletId: 'w_btc_1', symbol: 'BTC', direction: 'incoming',
    category: 'ramp_in', amount: 0.075, status: 'confirmed',
    txHash: 'c3d4e5f60718293a4b5c6d7e8f900102030405060708091011121314151617181',
    occurredAt: '2026-10-14T18:02:00Z', orderId: 'ord_8785',
  },
  {
    id: 't10', walletId: 'w_eth_1', symbol: 'ETH', direction: 'outgoing',
    category: 'withdrawal', amount: 0.85, status: 'confirmed',
    txHash: '0xaa99887766554433221100ffeeddccbbaa99887766554433221100ffeeddccb',
    occurredAt: '2026-10-12T20:44:00Z',
  },
  {
    id: 't11', walletId: 'w_usdt_1', symbol: 'USDT', direction: 'incoming',
    category: 'swap', amount: 600, status: 'confirmed',
    txHash: '5d6c7b8a99001122334455667788990011223344556677889900112233445566',
    occurredAt: '2026-10-11T10:31:00Z',
  },
  {
    id: 't12', walletId: 'w_btc_1', symbol: 'BTC', direction: 'incoming',
    category: 'business_in', amount: 0.125, status: 'confirmed',
    txHash: 'd4e5f60718293a4b5c6d7e8f90010203040506070809101112131415161718192',
    occurredAt: '2026-10-10T08:15:00Z', orderId: 'ord_8762',
  },
  {
    id: 't13', walletId: 'w_eth_1', symbol: 'ETH', direction: 'incoming',
    category: 'ramp_in', amount: 2.1, status: 'confirmed',
    txHash: '0x99887766554433221100ffeeddccbbaa99887766554433221100ffeeddccbba',
    occurredAt: '2026-10-08T14:27:00Z', orderId: 'ord_8744',
  },
  {
    id: 't14', walletId: 'w_usdt_1', symbol: 'USDT', direction: 'outgoing',
    category: 'ramp_out', amount: 1200, status: 'confirmed',
    txHash: '6c7b8a9900112233445566778899001122334455667788990011223344556677',
    occurredAt: '2026-10-06T16:03:00Z', orderId: 'ord_8721',
  },
];
