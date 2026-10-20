import { useState, useMemo, useCallback } from 'react';
import {
  Wallet as WalletIcon, Plus, RefreshCw, Copy, Check, X, Star,
  ArrowDownCircle, ArrowUpCircle, Clock, CheckCircle, XCircle,
  ExternalLink, AlertCircle, LayoutGrid,
} from 'lucide-react';
import {
  SUPPORTED_COINS, COIN_BY_SYMBOL, MOCK_USD_RATES,
  initialWallets, initialTransactions, CATEGORY_LABEL,
  type MockWallet, type MockTransaction, type TxStatus,
} from '../data/walletMockData';
import AddWalletModal, { type AddWalletPayload } from '../components/AddWalletModal';

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const PAGE_SIZE = 8;

const STATUS_ICON: Record<TxStatus, React.ReactNode> = {
  confirmed: <CheckCircle size={12} className="text-green-500" />,
  pending: <Clock size={12} className="text-yellow-500" />,
  failed: <XCircle size={12} className="text-red-500" />,
};

const STATUS_BADGE: Record<TxStatus, string> = {
  confirmed: 'border-transparent bg-green-100 text-green-800',
  pending: 'border-transparent bg-yellow-100 text-yellow-800',
  failed: 'border-transparent bg-red-100 text-red-800',
};

const WALLET_STATUS_BADGE = {
  active: 'border-transparent bg-green-100 text-green-800',
  pending: 'border-transparent bg-yellow-100 text-yellow-800',
  disabled: 'border-transparent bg-gray-200 text-gray-700',
};

const truncate = (value: string, head = 8, tail = 6) =>
  value.length > head + tail + 1 ? `${value.slice(0, head)}…${value.slice(-tail)}` : value;

const randomHash = () =>
  Array.from({ length: 64 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');

// Label shown inline before each value inside the mobile card layout.
const MobileLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="sm:hidden inline-block w-20 align-middle text-[10px] font-medium uppercase tracking-wide text-gray-500">
    {children}
  </span>
);

// Mock on-ramp / off-ramp wallet registry page.
const WalletsPage = () => {
  const [wallets, setWallets] = useState<MockWallet[]>(initialWallets);
  const [transactions, setTransactions] = useState<MockTransaction[]>(initialTransactions);
  const [page, setPage] = useState(1);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleSaveWallet = useCallback((payload: AddWalletPayload) => {
    const coin = COIN_BY_SYMBOL[payload.symbol];
    const id = `w_${Date.now().toString(36)}`;
    setWallets((prev) => [
      {
        id,
        label: payload.label.trim() || `${coin?.name ?? payload.symbol} wallet`,
        symbol: payload.symbol,
        network: payload.network,
        address: payload.address,
        balance: 0,
        status: 'pending',
        isDefault: prev.length === 0,
        addedAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    setTransactions((prev) => [
      {
        id: `t_${Date.now().toString(36)}`,
        walletId: id,
        symbol: payload.symbol,
        direction: 'incoming',
        category: 'deposit',
        amount: 0,
        status: 'pending',
        txHash: randomHash(),
        occurredAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    setModalOpen(false);
    setPage(1);
  }, []);

  const handleCopy = async (wallet: MockWallet) => {
    try {
      await navigator.clipboard.writeText(wallet.address);
      setCopiedId(wallet.id);
      setTimeout(() => setCopiedId(null), 1600);
    } catch {
      setCopiedId(null);
    }
  };

  const handleSetDefault = (id: string) => {
    setWallets((prev) => prev.map((w) => ({ ...w, isDefault: w.id === id })));
  };

  const handleDelete = (id: string) => {
    setWallets((prev) => prev.filter((w) => w.id !== id));
  };

  const refreshHistory = useCallback(() => {
    setHistoryLoading(true);
    setError(null);
    setTimeout(() => {
      // Small mock shuffle: re-confirms pending items every now and then.
      setTransactions((prev) =>
        prev.map((tx) =>
          tx.status === 'pending' && Math.random() > 0.5
            ? { ...tx, status: 'confirmed' as TxStatus }
            : tx,
        ),
      );
      setHistoryLoading(false);
    }, 700);
  }, []);

  // ─── Derived values ──────────────────────────────────────────────────
  const totalBalanceUsd = useMemo(() => {
    let total = 0;
    let counted = 0;
    for (const wallet of wallets) {
      const rate = MOCK_USD_RATES[wallet.symbol] ?? 0;
      if (rate) {
        total += wallet.balance * rate;
        counted += 1;
      }
    }
    return { total, counted };
  }, [wallets]);

  const pendingCount = useMemo(
    () => transactions.filter((t) => t.status === 'pending').length,
    [transactions],
  );

  const activeNetworks = useMemo(() => {
    const set = new Set(wallets.filter((w) => w.status !== 'disabled').map((w) => w.network));
    return set.size;
  }, [wallets]);

  const walletById = useMemo(() => {
    const map = new Map<string, MockWallet>();
    for (const w of wallets) map.set(w.id, w);
    return map;
  }, [wallets]);

  const totalPages = Math.max(1, Math.ceil(transactions.length / PAGE_SIZE));
  const pageItems = useMemo(
    () => transactions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [transactions, page],
  );

  const lastActivity = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
    return sorted.length ? new Date(sorted[0].occurredAt) : null;
  }, [transactions]);

  const goToPage = (next: number) => {
    if (next < 1 || next > totalPages || next === page) return;
    setPage(next);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold text-white">My Wallets</h1>
          <p className="text-sm text-gray-400 mt-1">
            Register or create crypto wallets. Mock data — nothing is sent anywhere.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-dark-800 border border-dark-600 text-sm text-gray-300">
            <LayoutGrid size={16} className="text-accent" />
            <span>
              <strong className="text-white">{SUPPORTED_COINS.length}</strong> assets supported
            </span>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-accent to-primary-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-accent/25 transition-all text-sm whitespace-nowrap"
          >
            <Plus size={16} /> Add Wallet
          </button>
        </div>
      </div>

      <AddWalletModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveWallet}
      />

      {/* ─── Summary + wallet listing ───────────────────────────────────── */}
      <div className="bg-dark-800 border border-dark-600 rounded-xl p-4 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-5">
          <div>
            <h3 className="text-[1.29rem] font-semibold text-white tracking-tight">Wallet Summary</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Balances of your registered wallets, settled swaps and business payments (USD estimate).
            </p>
          </div>
          {lastActivity && (
            <span className="text-xs text-gray-400 shrink-0">
              Last activity: {lastActivity.toLocaleDateString()}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          <div className="p-3 md:p-4 border border-dark-600 rounded-lg bg-dark-700/50 min-w-0">
            <h4 className="text-xs md:text-sm font-medium text-gray-400 truncate">Total Balance</h4>
            <p className="text-xl md:text-2xl font-bold text-primary-400 truncate">
              {totalBalanceUsd.counted > 0 ? usdFormatter.format(totalBalanceUsd.total) : '—'}
            </p>
            <p className="text-[10px] md:text-xs text-gray-500 truncate">Across {wallets.length} wallet{wallets.length === 1 ? '' : 's'} (USD est.)</p>
          </div>
          <div className="p-3 md:p-4 border border-dark-600 rounded-lg bg-dark-700/50 min-w-0">
            <h4 className="text-xs md:text-sm font-medium text-gray-400 truncate">Registered Wallets</h4>
            <p className="text-xl md:text-2xl font-bold text-white">{wallets.length}</p>
            <p className="text-[10px] md:text-xs text-gray-500 truncate">
              {wallets.filter((w) => w.status === 'pending').length} awaiting verification
            </p>
          </div>
          <div className="p-3 md:p-4 border border-dark-600 rounded-lg bg-dark-700/50 min-w-0">
            <h4 className="text-xs md:text-sm font-medium text-gray-400 truncate">Pending</h4>
            <p className="text-xl md:text-2xl font-bold text-white">{pendingCount}</p>
            <p className="text-[10px] md:text-xs text-gray-500 truncate">
              {pendingCount === 1 ? 'Movement awaiting confirmation' : 'Movements awaiting confirmation'}
            </p>
          </div>
          <div className="p-3 md:p-4 border border-dark-600 rounded-lg bg-dark-700/50 min-w-0">
            <h4 className="text-xs md:text-sm font-medium text-gray-400 truncate">Active Networks</h4>
            <p className="text-xl md:text-2xl font-bold text-white">{activeNetworks}</p>
            <p className="text-[10px] md:text-xs text-gray-500 truncate">Distinct chains in use</p>
          </div>
        </div>

        {/* Wallet list — table on >= sm, stacked cards on phones (no data hidden) */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="hidden sm:table-header-group">
              <tr className="border-b border-dark-600 text-left">
                <th className="px-3 py-2.5 text-xs font-medium text-gray-400">Asset</th>
                <th className="px-3 py-2.5 text-xs font-medium text-gray-400">Label</th>
                <th className="px-3 py-2.5 text-xs font-medium text-gray-400">Network</th>
                <th className="px-3 py-2.5 text-xs font-medium text-gray-400">Address</th>
                <th className="px-3 py-2.5 text-xs font-medium text-gray-400 text-right">Balance</th>
                <th className="px-3 py-2.5 text-xs font-medium text-gray-400">Status</th>
                <th className="px-3 py-2.5 text-xs font-medium text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {wallets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10">
                    <div className="flex flex-col items-center gap-3 text-center">
                      <WalletIcon size={36} className="text-dark-500" />
                      <p className="text-sm text-gray-400">
                        No wallets registered yet. Use the “Add Wallet” button to register your first one.
                      </p>
                      <button
                        onClick={() => setModalOpen(true)}
                        className="mt-1 px-5 py-2 bg-gradient-to-r from-accent to-primary-600 text-white text-sm font-medium rounded-xl"
                      >
                        Add Wallet
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                wallets.map((wallet) => {
                  const coin = COIN_BY_SYMBOL[wallet.symbol];
                  const rate = MOCK_USD_RATES[wallet.symbol] ?? 0;
                  const usd = rate ? wallet.balance * rate : null;
                  return (
                    <tr
                      key={wallet.id}
                      className="block sm:table-row border border-dark-600 sm:border-0 rounded-xl sm:rounded-none bg-dark-700/40 sm:bg-transparent mb-3 sm:mb-0 sm:hover:bg-dark-700/40 transition-colors"
                    >
                      <td className="block sm:table-cell px-3 py-2 sm:py-3 sm:border-b sm:border-dark-700">
                        <div className="flex items-center gap-2">
                          <span className={`w-8 h-8 rounded-lg ${coin?.chipBg ?? 'bg-dark-600'} flex items-center justify-center font-bold ${coin?.color ?? 'text-gray-300'} shrink-0`}>
                            {coin?.glyph ?? '?'}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white">{wallet.symbol}</p>
                            <p className="text-[10px] text-gray-500 truncate">{coin?.name ?? ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="block sm:table-cell px-3 py-1 sm:py-3 sm:border-b sm:border-dark-700">
                        <MobileLabel>Label</MobileLabel>
                        <div className="flex items-center gap-1.5">
                          {wallet.isDefault && <Star size={12} className="text-accent fill-accent shrink-0" />}
                          <span className="text-sm text-gray-200 truncate">{wallet.label}</span>
                        </div>
                        <p className="text-[10px] text-gray-500">added {new Date(wallet.addedAt).toLocaleDateString()}</p>
                      </td>
                      <td className="block sm:table-cell px-3 py-1 sm:py-3 sm:border-b sm:border-dark-700">
                        <MobileLabel>Network</MobileLabel>
                        <span className="inline-block px-2 py-0.5 rounded-md bg-dark-600 text-gray-300 text-[11px] font-medium break-words">
                          {wallet.network}
                        </span>
                      </td>
                      <td className="block sm:table-cell px-3 py-1 sm:py-3 sm:border-b sm:border-dark-700">
                        <MobileLabel>Address</MobileLabel>
                        <span className="font-mono text-xs text-gray-300 break-all" title={wallet.address}>
                          {truncate(wallet.address)}
                        </span>
                      </td>
                      <td className="block sm:table-cell px-3 py-1 sm:py-3 sm:border-b sm:border-dark-700 sm:text-right">
                        <MobileLabel>Balance</MobileLabel>
                        <p className="font-mono text-xs font-medium text-white">
                          {wallet.balance.toLocaleString(undefined, { maximumFractionDigits: 8 })} {wallet.symbol}
                        </p>
                        {usd !== null && (
                          <p className="text-[10px] text-gray-500">≈ {usdFormatter.format(usd)}</p>
                        )}
                      </td>
                      <td className="block sm:table-cell px-3 py-1 sm:py-3 sm:border-b sm:border-dark-700">
                        <MobileLabel>Status</MobileLabel>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${WALLET_STATUS_BADGE[wallet.status]}`}>
                          {wallet.status === 'active' && <CheckCircle size={10} />}
                          {wallet.status === 'pending' && <Clock size={10} />}
                          {wallet.status === 'disabled' && <X size={10} />}
                          <span className="capitalize">{wallet.status}</span>
                        </span>
                      </td>
                      <td className="block sm:table-cell px-3 py-2 sm:py-3 sm:border-b sm:border-dark-700">
                        <div className="flex items-center sm:justify-end gap-1">
                          <button
                            onClick={() => handleCopy(wallet)}
                            title="Copy address"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-dark-600 transition-colors"
                          >
                            {copiedId === wallet.id ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                          </button>
                          <button
                            onClick={() => handleSetDefault(wallet.id)}
                            title="Set as default"
                            disabled={wallet.isDefault}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-accent hover:bg-dark-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Star size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(wallet.id)}
                            title="Remove wallet"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-danger hover:bg-dark-600 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Transaction history ────────────────────────────────────────── */}
      <div className="bg-dark-800 border border-dark-600 rounded-xl p-4 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-5">
          <div>
            <h3 className="text-[1.29rem] font-semibold text-white tracking-tight">Transaction History</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              On-ramps, off-ramps, swaps and business integrations settled to your wallets.
            </p>
          </div>
          <button
            onClick={refreshHistory}
            disabled={historyLoading}
            title="Refresh history"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dark-500 text-xs text-gray-300 hover:text-white hover:border-dark-400 transition-colors self-start shrink-0"
          >
            <RefreshCw size={13} className={historyLoading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        {error ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <AlertCircle size={32} className="text-danger" />
            <p className="text-sm text-gray-400">{error}</p>
            <button
              onClick={refreshHistory}
              className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="hidden sm:table-header-group">
                  <tr className="border-b border-dark-600 text-left">
                    <th className="px-3 py-2.5 text-xs font-medium text-gray-400">Date</th>
                    <th className="px-3 py-2.5 text-xs font-medium text-gray-400">Type</th>
                    <th className="px-3 py-2.5 text-xs font-medium text-gray-400">Wallet</th>
                    <th className="px-3 py-2.5 text-xs font-medium text-gray-400 text-right">Amount</th>
                    <th className="px-3 py-2.5 text-xs font-medium text-gray-400">Status</th>
                    <th className="px-3 py-2.5 text-xs font-medium text-gray-400">Transaction</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((tx) => {
                    const wallet = walletById.get(tx.walletId);
                    const coin = COIN_BY_SYMBOL[tx.symbol];
                    const isIncoming = tx.direction === 'incoming';
                    const usd = (MOCK_USD_RATES[tx.symbol] ?? 0) * tx.amount;
                    return (
                      <tr
                        key={tx.id}
                        className="block sm:table-row border border-dark-600 sm:border-0 rounded-xl sm:rounded-none bg-dark-700/40 sm:bg-transparent mb-3 sm:mb-0 sm:hover:bg-dark-700/40 transition-colors"
                      >
                        <td className="block sm:table-cell px-3 py-2 sm:py-3 sm:whitespace-nowrap sm:border-b sm:border-dark-700">
                          <MobileLabel>Date</MobileLabel>
                          <span className="text-xs text-gray-300">
                            {new Date(tx.occurredAt).toLocaleString()}
                          </span>
                        </td>
                        <td className="block sm:table-cell px-3 py-1 sm:py-3 sm:border-b sm:border-dark-700">
                          <MobileLabel>Type</MobileLabel>
                          <div className="flex items-center gap-2">
                            {isIncoming ? (
                              <ArrowDownCircle size={15} className="text-green-500 shrink-0" />
                            ) : (
                              <ArrowUpCircle size={15} className="text-gray-400 shrink-0" />
                            )}
                            <span className="text-sm text-gray-200">{CATEGORY_LABEL[tx.category]}</span>
                            {tx.orderId && (
                              <span className="text-[10px] text-gray-500 font-mono">#{tx.orderId}</span>
                            )}
                          </div>
                        </td>
                        <td className="block sm:table-cell px-3 py-1 sm:py-3 sm:border-b sm:border-dark-700">
                          <MobileLabel>Wallet</MobileLabel>
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className={`w-5 h-5 rounded ${coin?.chipBg ?? 'bg-dark-600'} flex items-center justify-center font-bold text-[10px] ${coin?.color ?? 'text-gray-300'} shrink-0`}>
                              {coin?.glyph ?? '?'}
                            </span>
                            <span className="text-xs text-gray-300 truncate max-w-[180px] sm:max-w-[140px]" title={wallet?.address}>
                              {wallet?.label ?? tx.symbol}
                            </span>
                          </div>
                        </td>
                        <td className="block sm:table-cell px-3 py-1 sm:py-3 sm:text-right sm:whitespace-nowrap sm:border-b sm:border-dark-700">
                          <MobileLabel>Amount</MobileLabel>
                          <span className={`font-mono text-xs ${isIncoming ? 'text-green-400' : 'text-gray-200'}`}>
                            {isIncoming ? '+' : '−'}{tx.amount} {tx.symbol}
                          </span>
                          {tx.amount > 0 && (
                            <p className="text-[10px] text-gray-500">≈ {usdFormatter.format(usd)}</p>
                          )}
                        </td>
                        <td className="block sm:table-cell px-3 py-1 sm:py-3 sm:border-b sm:border-dark-700">
                          <MobileLabel>Status</MobileLabel>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${STATUS_BADGE[tx.status]}`}>
                            {STATUS_ICON[tx.status]}
                            <span className="capitalize">{tx.status}</span>
                          </span>
                        </td>
                        <td className="block sm:table-cell px-3 py-2 sm:py-3 sm:border-b sm:border-dark-700">
                          <MobileLabel>Transaction</MobileLabel>
                          {coin ? (
                            <a
                              href={`${coin.explorerBase}${tx.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 font-mono text-xs text-primary-400 hover:underline break-all"
                              title={tx.txHash}
                            >
                              {truncate(tx.txHash, 6, 4)} <ExternalLink size={11} className="shrink-0" />
                            </a>
                          ) : (
                            <span className="font-mono text-xs text-gray-500">{truncate(tx.txHash, 6, 4)}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-end gap-2 mt-4">
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page <= 1}
                  className="px-3 py-1.5 rounded-lg border border-dark-500 text-xs text-gray-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-xs text-gray-400">Page {page} of {totalPages}</span>
                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 rounded-lg border border-dark-500 text-xs text-gray-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WalletsPage;
