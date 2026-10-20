import { useState, useEffect, useCallback } from 'react';
import {
  X, Plus, Sparkles, RefreshCw, Copy, Check, Search, ChevronDown,
  AlertCircle, ShieldAlert, Eye, EyeOff, Download, Wallet, Layers,
} from 'lucide-react';
import {
  SUPPORTED_COINS, COIN_BY_SYMBOL, networksFor, generateMockWallet,
  type CoinMeta, type GeneratedWalletKeys,
} from '../data/walletMockData';

export interface AddWalletPayload {
  symbol: string;
  network: string;
  label: string;
  address: string;
}

interface AddWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: AddWalletPayload) => void;
}

// Crude mock validators per address family. Good enough to give the form a
// dynamic feel; a real implementation would hit the API.
export const validateAddress = (
  coin: CoinMeta,
  network: string,
  address: string,
): string | null => {
  const value = address.trim();
  if (!value) return 'Address is required.';

  // Avalanche X/P-Chain use their own bech32-ish format: X-avax1… / P-avax1…
  if (coin.symbol === 'AVAX' && !network.includes('C-Chain')) {
    return /^[XP]-avax1[02-9a-zA-HJ-NP-Z]{38}$/.test(value)
      ? null
      : `Enter a valid ${network} address (${network[0]}-avax1…).`;
  }

  switch (coin.family) {
    case 'evm':
      return /^0x[a-fA-F0-9]{40}$/.test(value)
        ? null
        : 'Enter a valid 0x… EVM address (42 hex chars).';
    case 'btc':
      return /^(bc1|ltc1|[13LMq])[a-zA-HJ-NP-Z0-9]{25,62}$/.test(value) || value.startsWith('bitcoincash:')
        ? null
        : 'Enter a valid native address for this network (bech32 / legacy).';
    case 'tron':
      return /^T[a-zA-H0-9]{33}$/.test(value)
        ? null
        : 'Enter a valid TRC-20 address (T…, 34 chars).';
    case 'solana':
      return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(value)
        ? null
        : 'Enter a valid Solana base58 address (32–44 chars).';
    default:
      return value.length >= 25
        ? null
        : 'Address looks too short for this network.';
  }
};

const AddWalletModal = ({ isOpen, onClose, onSave }: AddWalletModalProps) => {
  const [mode, setMode] = useState<'register' | 'create'>('register');
  const [coinQuery, setCoinQuery] = useState('');
  const [coinOpen, setCoinOpen] = useState(false);
  const [networkOpen, setNetworkOpen] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [network, setNetwork] = useState('');
  const [label, setLabel] = useState('');
  const [address, setAddress] = useState('');
  const [addressError, setAddressError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<GeneratedWalletKeys | null>(null);
  const [revealKey, setRevealKey] = useState(false);
  const [revealMnemonic, setRevealMnemonic] = useState(false);
  const [copiedGenerated, setCopiedGenerated] = useState<string | null>(null);

  const selectedCoin = selectedSymbol ? COIN_BY_SYMBOL[selectedSymbol] : null;

  const resetForm = useCallback(() => {
    setCoinQuery('');
    setCoinOpen(false);
    setNetworkOpen(false);
    setSelectedSymbol(null);
    setNetwork('');
    setLabel('');
    setAddress('');
    setAddressError(null);
    setGenerated(null);
    setRevealKey(false);
    setRevealMnemonic(false);
  }, []);

  // Reset the form every time the modal opens, and lock background scroll
  // while it is visible.
  useEffect(() => {
    if (isOpen) {
      resetForm();
      setMode('register');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen, resetForm]);

  // Escape closes the modal.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const handleCopyValue = (value: string) => {
    navigator.clipboard?.writeText(value);
    const kind =
      value === generated?.address ? 'address'
        : value === generated?.privateKey ? 'key'
          : 'mnemonic';
    setCopiedGenerated(kind);
    setTimeout(() => setCopiedGenerated(null), 1600);
  };

  const handleDownloadBackup = () => {
    if (!generated || !selectedCoin) return;
    const content = [
      'CandySwap — wallet backup (MOCK FILE, DO NOT USE)',
      `Asset: ${selectedCoin.symbol} (${network})`,
      `Label: ${label.trim() || '—'}`,
      `Address: ${generated.address}`,
      `Private key: ${generated.privateKey}`,
      `Mnemonic: ${generated.mnemonic}`,
      `Generated at: ${new Date().toISOString()}`,
    ].join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `candyswap-${selectedCoin.symbol.toLowerCase()}-backup.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const selectCoin = (symbol: string) => {
    setSelectedSymbol(symbol);
    setNetwork(networksFor(symbol)[0]);
    setCoinOpen(false);
    setNetworkOpen(false);
    setCoinQuery('');
    setAddressError(null);
    // Changing the asset invalidates any previously generated material.
    setGenerated(null);
    setRevealKey(false);
    setRevealMnemonic(false);
  };

  const switchMode = (next: 'register' | 'create') => {
    if (next === mode) return;
    setMode(next);
    setGenerated(null);
    setRevealKey(false);
    setRevealMnemonic(false);
    setAddressError(null);
    setNetworkOpen(false);
  };

  const handleGenerate = () => {
    if (!selectedCoin) return;
    setGenerating(true);
    setGenerated(null);
    // Mock key generation — a real deployment would do this server-side (or
    // on a hardware wallet) and keep only the public address on the platform.
    setTimeout(() => {
      setGenerated(generateMockWallet(selectedCoin));
      setGenerating(false);
    }, 900);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCoin) return;

    // Create mode: the address was generated locally, nothing to validate.
    if (mode === 'create') {
      if (!generated) return;
      setSaving(true);
      setTimeout(() => {
        setSaving(false);
        onSave({
          symbol: selectedCoin.symbol,
          network,
          label,
          address: generated.address,
        });
      }, 600);
      return;
    }

    const validation = validateAddress(selectedCoin, network, address);
    if (validation) {
      setAddressError(validation);
      return;
    }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      onSave({ symbol: selectedCoin.symbol, network, label, address: address.trim() });
    }, 800);
  };

  const filteredCoins = coinQuery.trim()
    ? SUPPORTED_COINS.filter(
        (coin) =>
          coin.symbol.toLowerCase().includes(coinQuery.trim().toLowerCase()) ||
          coin.name.toLowerCase().includes(coinQuery.trim().toLowerCase()),
      )
    : SUPPORTED_COINS;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel: bottom sheet on phones, centered dialog on larger screens */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Add wallet"
        className="relative w-full sm:max-w-lg max-h-[92vh] sm:max-h-[85vh] flex flex-col bg-dark-800 border border-dark-600 rounded-t-2xl sm:rounded-2xl shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-5 border-b border-dark-600 shrink-0">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Wallet size={18} className="text-accent" />
              {mode === 'register' ? 'Register Wallet' : 'Create New Wallet'}
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              {mode === 'register'
                ? 'Paste an existing address you control.'
                : 'Generate a brand-new wallet — keys are shown once.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-1 -mt-1 rounded-lg text-gray-400 hover:text-white hover:bg-dark-700 transition-colors shrink-0"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Mode switch */}
        <div className="px-5 pt-4 shrink-0">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-dark-700 border border-dark-600">
            <button
              type="button"
              onClick={() => switchMode('register')}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                mode === 'register' ? 'bg-accent text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Plus size={13} /> Register existing
            </button>
            <button
              type="button"
              onClick={() => switchMode('create')}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                mode === 'create' ? 'bg-accent text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Sparkles size={13} /> Create new
            </button>
          </div>
        </div>

        {/* Scrollable form area */}
        <form
          id="add-wallet-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-5 space-y-4"
        >
          {/* Asset picker — expands inline so nothing is overlapped or clipped */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">Asset</label>
            <button
              type="button"
              onClick={() => setCoinOpen((open) => !open)}
              className="w-full flex items-center justify-between gap-2 bg-dark-700 border border-dark-500 rounded-xl px-4 py-2.5 text-sm hover:border-dark-400 transition-colors"
            >
              {selectedCoin ? (
                <span className="flex items-center gap-2 min-w-0">
                  <span className={`w-7 h-7 rounded-lg ${selectedCoin.chipBg} flex items-center justify-center font-bold ${selectedCoin.color} shrink-0`}>
                    {selectedCoin.glyph}
                  </span>
                  <span className="text-white font-medium">{selectedCoin.symbol}</span>
                  <span className="text-gray-400 truncate">{selectedCoin.name}</span>
                </span>
              ) : (
                <span className="flex items-center gap-2 text-gray-400">
                  <Search size={14} /> Select an asset…
                </span>
              )}
              <ChevronDown size={16} className={`text-gray-400 shrink-0 transition-transform ${coinOpen ? 'rotate-180' : ''}`} />
            </button>

            {coinOpen && (
              <div className="mt-2 bg-dark-700 border border-dark-500 rounded-xl overflow-hidden">
                <div className="p-2 border-b border-dark-600">
                  <input
                    type="text"
                    value={coinQuery}
                    onChange={(e) => setCoinQuery(e.target.value)}
                    placeholder="Search asset…"
                    className="w-full bg-dark-600 border border-dark-500 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto overscroll-contain p-1.5">
                  {filteredCoins.length === 0 ? (
                    <p className="px-3 py-4 text-sm text-gray-500 text-center">No asset found.</p>
                  ) : (
                    filteredCoins.map((coin) => (
                      <button
                        key={coin.symbol}
                        type="button"
                        onClick={() => selectCoin(coin.symbol)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-dark-600 active:bg-dark-600 transition-colors"
                      >
                        <span className={`w-6 h-6 rounded-md ${coin.chipBg} flex items-center justify-center font-bold text-xs ${coin.color} shrink-0`}>
                          {coin.glyph}
                        </span>
                        <span className="font-medium text-white">{coin.symbol}</span>
                        <span className="text-gray-400 truncate">{coin.name}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Network picker — same inline-expand pattern as the asset picker */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">Network</label>
            <button
              type="button"
              onClick={() => selectedSymbol && setNetworkOpen((open) => !open)}
              disabled={!selectedSymbol}
              className="w-full flex items-center justify-between gap-2 bg-dark-700 border border-dark-500 rounded-xl px-4 py-2.5 text-sm hover:border-dark-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {network ? (
                <span className="flex items-center gap-2 min-w-0">
                  <span className="w-7 h-7 rounded-lg bg-dark-600 flex items-center justify-center shrink-0">
                    <Layers size={14} className="text-gray-300" />
                  </span>
                  <span className="text-white font-medium truncate">{network}</span>
                </span>
              ) : (
                <span className="text-gray-400">Select an asset first</span>
              )}
              <ChevronDown size={16} className={`text-gray-400 shrink-0 transition-transform ${networkOpen ? 'rotate-180' : ''}`} />
            </button>

            {networkOpen && selectedSymbol && (
              <div className="mt-2 bg-dark-700 border border-dark-500 rounded-xl overflow-hidden">
                <div className="max-h-48 overflow-y-auto overscroll-contain p-1.5">
                  {networksFor(selectedSymbol).map((net) => (
                    <button
                      key={net}
                      type="button"
                      onClick={() => {
                        setNetwork(net);
                        setNetworkOpen(false);
                        setGenerated(null);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                        net === network
                          ? 'bg-accent/15 text-accent'
                          : 'text-gray-300 hover:bg-dark-600 active:bg-dark-600'
                      }`}
                    >
                      <Layers size={14} className="shrink-0 text-gray-400" />
                      <span className="truncate">{net}</span>
                      {net === network && <Check size={14} className="ml-auto shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Label */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">Label (optional)</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Cold storage"
              maxLength={40}
              className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent"
            />
          </div>

          {mode === 'register' ? (
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">Wallet address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  if (addressError) setAddressError(null);
                }}
                placeholder={selectedCoin ? selectedCoin.addressHint : 'Select an asset to enable validation'}
                spellCheck={false}
                className={`w-full bg-dark-700 border rounded-xl px-4 py-2.5 text-sm font-mono text-white placeholder-gray-500 focus:outline-none transition-colors ${
                  addressError ? 'border-danger focus:border-danger' : 'border-dark-500 focus:border-accent'
                }`}
              />
              {addressError ? (
                <p className="flex items-start gap-1.5 mt-1.5 text-xs text-danger">
                  <AlertCircle size={12} className="mt-0.5 shrink-0" /> {addressError}
                </p>
              ) : selectedCoin ? (
                <p className="mt-1.5 text-xs text-gray-500">
                  Validating as <span className="text-gray-300">{selectedCoin.name}</span> on{' '}
                  <span className="text-gray-300">{network}</span>.
                </p>
              ) : null}
            </div>
          ) : (
            <div>
              {generated ? (
                <div className="rounded-xl border border-warning/40 bg-warning/5 p-4 space-y-4">
                  <div className="flex items-start gap-2.5">
                    <ShieldAlert size={18} className="text-warning shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-white">Wallet generated — back up your keys now</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Mock key material for demonstration. A real deployment never returns private keys through this interface.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-lg bg-dark-800 border border-dark-600 p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">New address ({network})</span>
                        <CopyButton
                          copied={copiedGenerated === 'address'}
                          onClick={() => handleCopyValue(generated.address)}
                        />
                      </div>
                      <p className="font-mono text-xs text-green-300 break-all">{generated.address}</p>
                    </div>

                    <div className="rounded-lg bg-dark-800 border border-dark-600 p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Private key</span>
                        <div className="flex items-center gap-3">
                          <RevealButton revealed={revealKey} onClick={() => setRevealKey((r) => !r)} />
                          <CopyButton
                            copied={copiedGenerated === 'key'}
                            onClick={() => handleCopyValue(generated.privateKey)}
                          />
                        </div>
                      </div>
                      <p className={`font-mono text-xs break-all ${revealKey ? 'text-red-300' : 'text-gray-500'}`}>
                        {revealKey ? generated.privateKey : '•'.repeat(24)}
                      </p>
                    </div>

                    <div className="rounded-lg bg-dark-800 border border-dark-600 p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Recovery phrase (12 words)</span>
                        <div className="flex items-center gap-3">
                          <RevealButton revealed={revealMnemonic} onClick={() => setRevealMnemonic((r) => !r)} />
                          <CopyButton
                            copied={copiedGenerated === 'mnemonic'}
                            onClick={() => handleCopyValue(generated.mnemonic)}
                          />
                        </div>
                      </div>
                      <p className={`font-mono text-xs break-words ${revealMnemonic ? 'text-yellow-300' : 'text-gray-500'}`}>
                        {revealMnemonic ? generated.mnemonic : '•'.repeat(48)}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadBackup}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dark-500 text-xs text-gray-300 hover:text-white hover:border-dark-400 transition-colors"
                  >
                    <Download size={12} /> Download backup file
                  </button>
                </div>
              ) : (
                <div className="rounded-xl border border-dark-600 border-dashed bg-dark-700/40 p-6 text-center">
                  <Sparkles size={22} className="mx-auto mb-2 text-accent" />
                  <p className="text-sm text-gray-300">
                    {selectedCoin
                      ? `Ready to generate a new ${selectedCoin.name} wallet on ${network}.`
                      : 'Select an asset and network, then generate the wallet.'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    The address, private key and recovery phrase are produced locally (mock).
                  </p>
                </div>
              )}
            </div>
          )}
        </form>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-dark-600 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          {mode === 'create' && !generated ? (
            <button
              type="button"
              onClick={handleGenerate}
              disabled={!selectedSymbol || generating}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-accent to-primary-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-accent/25 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? (
                <>
                  <RefreshCw size={16} className="animate-spin" /> Generating…
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Generate Wallet
                </>
              )}
            </button>
          ) : (
            <button
              type="submit"
              form="add-wallet-form"
              disabled={!selectedSymbol || saving || (mode === 'create' && !generated)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-accent to-primary-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-accent/25 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <RefreshCw size={16} className="animate-spin" /> Saving…
                </>
              ) : mode === 'create' ? (
                <>
                  <Check size={16} /> Add to My Wallets
                </>
              ) : (
                <>
                  <Plus size={16} /> Verify &amp; Register
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const CopyButton = ({ copied, onClick }: { copied: boolean; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-white shrink-0"
  >
    {copied ? <Check size={11} className="text-success" /> : <Copy size={11} />}
    {copied ? 'Copied' : 'Copy'}
  </button>
);

const RevealButton = ({ revealed, onClick }: { revealed: boolean; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-white shrink-0"
  >
    {revealed ? <EyeOff size={11} /> : <Eye size={11} />}
    {revealed ? 'Hide' : 'Show'}
  </button>
);

export default AddWalletModal;
