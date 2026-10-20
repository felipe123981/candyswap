import { useState, useMemo } from 'react';
import {
  Code, Key, Webhook, Wallet as WalletIcon, Repeat, ArrowDownCircle,
  ArrowUpCircle, Building2, Coins, BookOpen, Copy, Check, Terminal,
  Send, Loader, ChevronRight, Server,
} from 'lucide-react';

type HttpMethod = 'GET' | 'POST' | 'DELETE' | 'PATCH';

interface EndpointParam {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

interface Endpoint {
  id: string;
  group: string;
  method: HttpMethod;
  path: string;
  title: string;
  description: string;
  params: EndpointParam[];
  bodyExample: Record<string, unknown>;
  mockResponse: Record<string, unknown>;
}

const METHOD_BADGE: Record<HttpMethod, string> = {
  GET: 'bg-primary-400/20 text-primary-300 border-primary-400/40',
  POST: 'bg-green-500/20 text-green-400 border-green-500/40',
  DELETE: 'bg-red-500/20 text-red-400 border-red-500/40',
  PATCH: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
};

const GROUPS = [
  { id: 'auth', label: 'Authentication', icon: Key },
  { id: 'currencies', label: 'Currencies', icon: Coins },
  { id: 'onramp', label: 'On-Ramp', icon: ArrowDownCircle },
  { id: 'offramp', label: 'Off-Ramp', icon: ArrowUpCircle },
  { id: 'swap', label: 'Swap', icon: Repeat },
  { id: 'wallets', label: 'Wallets', icon: WalletIcon },
  { id: 'business', label: 'Business Integration', icon: Building2 },
  { id: 'webhooks', label: 'Webhooks', icon: Webhook },
] as const;

const ENDPOINTS: Endpoint[] = [
  {
    id: 'auth-api-key',
    group: 'auth',
    method: 'POST',
    path: '/v1/auth/api-key',
    title: 'Exchange credentials',
    description: 'Trade your partner API key for a short-lived bearer token. Required for every authenticated call.',
    params: [
      { name: 'apiKey', type: 'string', required: true, description: 'Partner API key from the dashboard.' },
      { name: 'secret', type: 'string', required: true, description: 'Partner secret. Never expose on the client.' },
    ],
    bodyExample: { apiKey: 'ck_live_3fa9...', secret: 'sk_live_88c1...' },
    mockResponse: {
      accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      tokenType: 'Bearer',
      expiresIn: 3600,
      environment: 'production',
    },
  },
  {
    id: 'currencies-list',
    group: 'currencies',
    method: 'GET',
    path: '/v1/currencies/list',
    title: 'List supported currencies',
    description: 'Returns every fiat and crypto pair enabled for your partner account, with live limits and fees.',
    params: [
      { name: 'fiatCurrency', type: 'string', required: false, description: 'Filter by fiat, e.g. USD / BRL / EUR.' },
      { name: 'network', type: 'string', required: false, description: 'Filter by chain, e.g. ERC-20, TRC-20, Solana.' },
    ],
    bodyExample: {},
    mockResponse: {
      fiat: ['USD', 'BRL', 'EUR', 'GBP', 'INR'],
      crypto: [
        { symbol: 'BTC', name: 'Bitcoin', network: 'Bitcoin', min: 0.0005, max: 5 },
        { symbol: 'USDT', name: 'Tether USD', network: 'TRC-20', min: 5, max: 50000 },
        { symbol: 'SOL', name: 'Solana', network: 'Solana', min: 0.2, max: 2000 },
      ],
    },
  },
  {
    id: 'onramp-create',
    group: 'onramp',
    method: 'POST',
    path: '/v1/orders/on-ramp',
    title: 'Create on-ramp order',
    description: 'Locks a fiat → crypto quote and starts the hosted checkout. The user pays with card, PIX or bank transfer.',
    params: [
      { name: 'fiatAmount', type: 'number', required: true, description: 'Amount in fiat currency.' },
      { name: 'fiatCurrency', type: 'string', required: true, description: 'ISO 4217 fiat code.' },
      { name: 'cryptoCurrency', type: 'string', required: true, description: 'Target asset, e.g. BTC.' },
      { name: 'walletAddress', type: 'string', required: true, description: 'Destination wallet (must be registered).' },
      { name: 'paymentMethod', type: 'string', required: false, description: 'card | pix | bank | sepa.' },
    ],
    bodyExample: {
      fiatAmount: 1500,
      fiatCurrency: 'BRL',
      cryptoCurrency: 'USDT',
      walletAddress: 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE',
      paymentMethod: 'pix',
    },
    mockResponse: {
      orderId: 'ord_8852',
      status: 'awaiting_payment',
      fiatAmount: 1500,
      fiatCurrency: 'BRL',
      cryptoAmount: 243.12,
      cryptoCurrency: 'USDT',
      rate: 5.1441,
      fee: 0.9,
      paymentMethod: 'pix',
      checkoutUrl: 'https://checkout.candyswap.io/ord_8852',
      expiresAt: '2026-10-20T01:30:00Z',
    },
  },
  {
    id: 'offramp-create',
    group: 'offramp',
    method: 'POST',
    path: '/v1/orders/off-ramp',
    title: 'Create off-ramp order',
    description: 'User sends crypto to the deposit address; settled fiat lands on the registered bank account or PIX key.',
    params: [
      { name: 'cryptoAmount', type: 'number', required: true, description: 'Amount of crypto to sell.' },
      { name: 'cryptoCurrency', type: 'string', required: true, description: 'Source asset, e.g. BTC.' },
      { name: 'fiatCurrency', type: 'string', required: true, description: 'Settlement fiat code.' },
      { name: 'payoutMethodId', type: 'string', required: true, description: 'Registered bank account / PIX id.' },
    ],
    bodyExample: {
      cryptoAmount: 0.05,
      cryptoCurrency: 'BTC',
      fiatCurrency: 'BRL',
      payoutMethodId: 'pm_pix_a1b2',
    },
    mockResponse: {
      orderId: 'ord_8853',
      status: 'awaiting_deposit',
      cryptoAmount: 0.05,
      cryptoCurrency: 'BTC',
      fiatAmount: 16122.66,
      fiatCurrency: 'BRL',
      rate: 322453.2,
      fee: 0.99,
      depositAddress: 'bc1qx7ydlj2f3h0we9xk4t6m8qp3zv7w2n3d4e5f',
      expiresAt: '2026-10-20T05:00:00Z',
    },
  },
  {
    id: 'swap-quote',
    group: 'swap',
    method: 'POST',
    path: '/v1/swap/quote',
    title: 'Get swap quote',
    description: 'Real-time crypto → crypto quote including network fee and slippage. Quotes lock for 30 seconds.',
    params: [
      { name: 'fromAsset', type: 'string', required: true, description: 'Source asset symbol.' },
      { name: 'toAsset', type: 'string', required: true, description: 'Target asset symbol.' },
      { name: 'amount', type: 'number', required: true, description: 'Amount of fromAsset.' },
      { name: 'network', type: 'string', required: false, description: 'Route preference (fastest / cheapest).' },
    ],
    bodyExample: { fromAsset: 'ETH', toAsset: 'SOL', amount: 1.25 },
    mockResponse: {
      quoteId: 'q_4f2a91',
      fromAsset: 'ETH',
      fromAmount: 1.25,
      toAsset: 'SOL',
      toAmount: 23.08,
      rate: 18.46,
      networkFee: '0.0012 ETH',
      slippage: 0.015,
      lockedUntil: '2026-10-20T01:00:30Z',
    },
  },
  {
    id: 'swap-execute',
    group: 'swap',
    method: 'POST',
    path: '/v1/swap/execute',
    title: 'Execute swap',
    description: 'Executes a locked quote using a registered wallet as the source. Returns the on-chain transaction hash.',
    params: [
      { name: 'quoteId', type: 'string', required: true, description: 'Quote id from /v1/swap/quote.' },
      { name: 'walletId', type: 'string', required: true, description: 'Registered source wallet.' },
    ],
    bodyExample: { quoteId: 'q_4f2a91', walletId: 'w_eth_1' },
    mockResponse: {
      swapId: 'sw_99c1',
      status: 'pending',
      txHash: '0x7766554433221100ffeeddccbbaa99887766554433221100ffeeddccbbaa9988',
      fromAsset: 'ETH',
      fromAmount: 1.25,
      toAsset: 'SOL',
      toAmount: 23.08,
    },
  },
  {
    id: 'wallets-list',
    group: 'wallets',
    method: 'GET',
    path: '/v1/wallets',
    title: 'List registered wallets',
    description: 'All wallets registered by the user, with verification status and current balance snapshot.',
    params: [
      { name: 'status', type: 'string', required: false, description: 'Filter: active | pending | disabled.' },
    ],
    bodyExample: {},
    mockResponse: {
      count: 2,
      wallets: [
        {
          id: 'w_btc_1',
          label: 'Cold storage',
          symbol: 'BTC',
          network: 'Bitcoin',
          address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
          status: 'active',
          isDefault: true,
          balance: 0.4821,
        },
      ],
    },
  },
  {
    id: 'wallets-create',
    group: 'wallets',
    method: 'POST',
    path: '/v1/wallets',
    title: 'Register wallet',
    description: 'Adds a wallet. A verification micro-transaction is sent to it before it can receive settlements.',
    params: [
      { name: 'symbol', type: 'string', required: true, description: 'Asset symbol, e.g. BTC, USDT.' },
      { name: 'network', type: 'string', required: true, description: 'Network of the address, e.g. TRC-20.' },
      { name: 'address', type: 'string', required: true, description: 'On-chain address.' },
      { name: 'label', type: 'string', required: false, description: 'Friendly name for the wallet.' },
    ],
    bodyExample: {
      symbol: 'USDT',
      network: 'TRC-20',
      address: 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE',
      label: 'Settlement wallet',
    },
    mockResponse: {
      id: 'w_91kl2',
      label: 'Settlement wallet',
      symbol: 'USDT',
      network: 'TRC-20',
      address: 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE',
      status: 'pending',
      isDefault: false,
      verificationAmount: 0.001,
    },
  },
  {
    id: 'wallets-delete',
    group: 'wallets',
    method: 'DELETE',
    path: '/v1/wallets/:id',
    title: 'Remove wallet',
    description: 'Deletes a registered wallet. Pending settlements to it are cancelled and refunded.',
    params: [
      { name: 'id', type: 'string', required: true, description: 'Wallet id (path parameter).' },
    ],
    bodyExample: {},
    mockResponse: { id: 'w_91kl2', deleted: true },
  },
  {
    id: 'business-integrate',
    group: 'business',
    method: 'POST',
    path: '/v1/business/register',
    title: 'Register business',
    description: 'Onboards a business so it can accept crypto payments and auto-convert to fiat on settlement.',
    params: [
      { name: 'legalName', type: 'string', required: true, description: 'Registered legal name.' },
      { name: 'settlementCurrency', type: 'string', required: true, description: 'Auto-conversion target fiat.' },
      { name: 'webhookUrl', type: 'string', required: true, description: 'HTTPS endpoint for payment events.' },
    ],
    bodyExample: {
      legalName: 'Acme Store LTDA',
      settlementCurrency: 'BRL',
      webhookUrl: 'https://api.acme.store/payments/webhook',
    },
    mockResponse: {
      businessId: 'biz_77f3',
      status: 'active',
      settlementCurrency: 'BRL',
      apiKey: 'ck_biz_9920aa11bb22',
      webhookUrl: 'https://api.acme.store/payments/webhook',
    },
  },
  {
    id: 'business-transactions',
    group: 'business',
    method: 'GET',
    path: '/v1/business/:id/transactions',
    title: 'List business transactions',
    description: 'Paginated ledger of payments received by a business, with the auto-converted fiat amounts.',
    params: [
      { name: 'id', type: 'string', required: true, description: 'Business id (path parameter).' },
      { name: 'page', type: 'number', required: false, description: 'Page number, default 1.' },
      { name: 'limit', type: 'number', required: false, description: 'Items per page, default 20.' },
    ],
    bodyExample: {},
    mockResponse: {
      page: 1,
      limit: 20,
      total: 2,
      transactions: [
        {
          id: 'biztx_1',
          orderId: 'ord_8837',
          cryptoAmount: 0.0341,
          cryptoCurrency: 'BTC',
          fiatAmount: 11498.59,
          fiatCurrency: 'BRL',
          status: 'settled',
          settledAt: '2026-10-18T23:02:00Z',
        },
      ],
    },
  },
  {
    id: 'webhooks-config',
    group: 'webhooks',
    method: 'POST',
    path: '/v1/webhooks',
    title: 'Configure webhook',
    description: 'Registers an HTTPS endpoint to receive order and settlement events, signed with your secret.',
    params: [
      { name: 'url', type: 'string', required: true, description: 'HTTPS endpoint.' },
      { name: 'events', type: 'string[]', required: true, description: 'order.created, order.paid, swap.executed…' },
      { name: 'secret', type: 'string', required: true, description: 'HMAC-SHA256 signing secret.' },
    ],
    bodyExample: {
      url: 'https://api.acme.store/webhooks/candyswap',
      events: ['order.created', 'order.paid', 'swap.executed'],
      secret: 'whsec_77aabb',
    },
    mockResponse: {
      webhookId: 'wh_3310',
      url: 'https://api.acme.store/webhooks/candyswap',
      events: ['order.created', 'order.paid', 'swap.executed'],
      status: 'active',
    },
  },
];

type Language = 'curl' | 'javascript' | 'python';

const snippet = (endpoint: Endpoint, language: Language): string => {
  const host = 'https://api.candyswap.io';
  const path = endpoint.path.replace(':id', 'w_btc_1').replace(':id', 'biz_77f3');
  const hasBody = endpoint.method !== 'GET' && Object.keys(endpoint.bodyExample).length > 0;

  switch (language) {
    case 'curl':
      return [
        `curl -X ${endpoint.method} '${host}${path}' \\`,
        `  -H 'Authorization: Bearer $CANDYSWAP_TOKEN' \\`,
        hasBody ? `  -H 'Content-Type: application/json' \\` : null,
        hasBody ? `  -d '${JSON.stringify(endpoint.bodyExample)}'` : null,
      ]
        .filter(Boolean)
        .join('\n');
    case 'javascript':
      return [
        `const res = await fetch('${host}${path}', {`,
        `  method: '${endpoint.method}',`,
        `  headers: {`,
        `    'Authorization': \`Bearer \${process.env.CANDYSWAP_TOKEN}\`,`,
        hasBody ? `    'Content-Type': 'application/json',` : null,
        `  },`,
        hasBody
          ? `  body: JSON.stringify(${JSON.stringify(endpoint.bodyExample, null, 2).replace(/\n/g, '\n  ')}),`
          : null,
        `});`,
        ``,
        `const data = await res.json();`,
      ]
        .filter(Boolean)
        .join('\n');
    case 'python':
      return [
        `import os`,
        `import requests`,
        ``,
        `resp = requests.request(`,
        `    '${endpoint.method}',`,
        `    '${host}${path}',`,
        `    headers={'Authorization': f'Bearer {os.environ["CANDYSWAP_TOKEN"]}'},`,
        hasBody
          ? `    json=${JSON.stringify(endpoint.bodyExample).replace(/"/g, "'").replace(/'([a-zA-Z0-9_]+)':/g, '"$1":')},`
          : null,
        `)`,
        ``,
        `print(resp.json())`,
      ]
        .filter(Boolean)
        .join('\n');
  }
};

const ApiDocsPage = () => {
  const [activeGroup, setActiveGroup] = useState<string>('auth');
  const [activeEndpointId, setActiveEndpointId] = useState<string>(ENDPOINTS[0].id);
  const [language, setLanguage] = useState<Language>('curl');
  const [copied, setCopied] = useState<'request' | 'response' | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const endpointsByGroup = useMemo(
    () => GROUPS.map((group) => ({
      ...group,
      endpoints: ENDPOINTS.filter((endpoint) => endpoint.group === group.id),
    })),
    [],
  );

  const activeEndpoint = useMemo(
    () => ENDPOINTS.find((endpoint) => endpoint.id === activeEndpointId) ?? ENDPOINTS[0],
    [activeEndpointId],
  );

  const requestSnippet = useMemo(
    () => snippet(activeEndpoint, language),
    [activeEndpoint, language],
  );

  const handleCopy = (kind: 'request' | 'response', text: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(kind);
    setTimeout(() => setCopied(null), 1600);
  };

  const sendRequest = () => {
    setSending(true);
    setSent(false);
    setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 850);
  };

  const selectGroup = (groupId: string) => {
    setActiveGroup(groupId);
    const first = ENDPOINTS.find((endpoint) => endpoint.group === groupId);
    if (first) setActiveEndpointId(first.id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <BookOpen size={20} className="text-accent" />
            <h1 className="text-2xl md:text-3xl font-bold text-white">API Reference</h1>
            <span className="px-2 py-0.5 rounded-md bg-accent/20 text-accent text-[11px] font-medium border border-accent/40">
              v1 · mock
            </span>
          </div>
          <p className="text-sm text-gray-400">
            On-ramp / off-ramp and swap endpoints for users and businesses. Fully mocked — requests never leave your browser.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-dark-800 border border-dark-600 text-xs text-gray-400 shrink-0">
          <Server size={14} className="text-success" />
          Base URL: <code className="font-mono text-gray-200 break-all">api.candyswap.io</code>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4 lg:gap-6">
        {/* Sidebar: horizontal chips on phones, vertical tree on >= lg */}
        <aside className="lg:sticky lg:top-24 h-fit">
          <div className="flex lg:flex-col gap-1.5 lg:gap-1 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0">
            {endpointsByGroup.map((group) => {
              const Icon = group.icon;
              const groupActive = group.id === activeGroup;
              return (
                <div key={group.id} className="shrink-0 lg:w-full">
                  <button
                    onClick={() => selectGroup(group.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      groupActive
                        ? 'bg-accent/15 text-accent'
                        : 'text-gray-300 hover:bg-dark-700 hover:text-white'
                    }`}
                  >
                    <Icon size={16} className="shrink-0" />
                    {group.label}
                    <span className="ml-auto hidden lg:inline text-[10px] text-gray-500">{group.endpoints.length}</span>
                  </button>
                  {groupActive && (
                    <div className="lg:ml-3 lg:pl-3 lg:border-l lg:border-dark-600 lg:mt-1 lg:space-y-0.5 flex lg:block gap-1.5 overflow-x-auto pb-1 lg:pb-0">
                      {group.endpoints.map((endpoint) => (
                        <button
                          key={endpoint.id}
                          onClick={() => setActiveEndpointId(endpoint.id)}
                          className={`shrink-0 lg:shrink flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs transition-colors lg:w-full ${
                            endpoint.id === activeEndpointId
                              ? 'bg-dark-700 text-white'
                              : 'text-gray-400 hover:bg-dark-700/60 hover:text-gray-200'
                          }`}
                        >
                          <span className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold font-mono border ${METHOD_BADGE[endpoint.method]}`}>
                            {endpoint.method}
                          </span>
                          <span className="truncate">{endpoint.title}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="pt-0 lg:pt-4">
            <div className="hidden lg:flex items-center gap-2 px-3 py-2.5 rounded-lg bg-dark-800 border border-dark-600 text-xs text-gray-400">
              <Key size={14} className="text-warning" />
              Get your keys in the business dashboard.
            </div>
          </div>
        </aside>

        {/* Endpoint detail */}
        <div className="space-y-6 min-w-0">
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-6">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span className={`px-2.5 py-1 rounded-md text-xs font-bold font-mono border ${METHOD_BADGE[activeEndpoint.method]}`}>
                {activeEndpoint.method}
              </span>
              <code className="text-sm font-mono text-white break-all">{activeEndpoint.path}</code>
            </div>
            <h2 className="text-lg font-semibold text-white mb-1">{activeEndpoint.title}</h2>
            <p className="text-sm text-gray-400">{activeEndpoint.description}</p>
          </div>

          {/* Parameters */}
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-6">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Terminal size={16} className="text-accent" /> Parameters
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="hidden sm:table-header-group">
                  <tr className="border-b border-dark-600 text-left">
                    <th className="px-3 py-2 text-xs font-medium text-gray-400">Name</th>
                    <th className="px-3 py-2 text-xs font-medium text-gray-400">Type</th>
                    <th className="px-3 py-2 text-xs font-medium text-gray-400">Required</th>
                    <th className="px-3 py-2 text-xs font-medium text-gray-400">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {activeEndpoint.params.map((param) => (
                    <tr
                      key={param.name}
                      className="block sm:table-row border border-dark-600 sm:border-0 rounded-lg sm:rounded-none mb-2 sm:mb-0 sm:border-b sm:border-dark-700 p-2.5 sm:p-0"
                    >
                      <td className="block sm:table-cell sm:px-3 sm:py-2.5">
                        <span className="sm:hidden text-[10px] font-medium uppercase tracking-wide text-gray-500 mr-2">Name</span>
                        <code className="text-xs font-mono text-primary-300">{param.name}</code>
                      </td>
                      <td className="block sm:table-cell sm:px-3 sm:py-2.5">
                        <span className="sm:hidden text-[10px] font-medium uppercase tracking-wide text-gray-500 mr-2">Type</span>
                        <span className="text-xs text-gray-300">{param.type}</span>
                      </td>
                      <td className="block sm:table-cell sm:px-3 sm:py-2.5">
                        <span className="sm:hidden text-[10px] font-medium uppercase tracking-wide text-gray-500 mr-2">Required</span>
                        {param.required ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-danger/20 text-danger">required</span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-dark-600 text-gray-400">optional</span>
                        )}
                      </td>
                      <td className="block sm:table-cell sm:px-3 sm:py-2.5 text-xs text-gray-400">
                        <span className="sm:hidden text-[10px] font-medium uppercase tracking-wide text-gray-500 mr-2">Desc</span>
                        {param.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Request sample */}
          <div className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-dark-600 px-4 py-3">
              <div className="flex items-center gap-1">
                {(['curl', 'javascript', 'python'] as Language[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                      language === lang
                        ? 'bg-accent/20 text-accent'
                        : 'text-gray-400 hover:text-white hover:bg-dark-700'
                    }`}
                  >
                    {lang === 'javascript' ? 'JS' : lang === 'python' ? 'Py' : 'cURL'}
                  </button>
                ))}
              </div>
              <button
                onClick={() => handleCopy('request', requestSnippet)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-dark-700 transition-colors"
              >
                {copied === 'request' ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                {copied === 'request' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-xs font-mono text-gray-300 leading-relaxed">
              <code>{requestSnippet}</code>
            </pre>
          </div>

          {/* Mock response */}
          <div className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-dark-600 px-4 py-3">
              <div className="flex items-center gap-2">
                <Code size={16} className="text-accent" />
                <h3 className="font-semibold text-white text-sm">Mock Response</h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-success/20 text-success font-mono">200 OK</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={sendRequest}
                  disabled={sending}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-accent/20 text-accent hover:bg-accent/30 transition-colors disabled:opacity-50"
                >
                  {sending ? <Loader size={12} className="animate-spin" /> : <Send size={12} />}
                  {sending ? 'Sending…' : 'Send (mock)'}
                </button>
                <button
                  onClick={() => handleCopy('response', JSON.stringify(activeEndpoint.mockResponse, null, 2))}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-dark-700 transition-colors"
                >
                  {copied === 'response' ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                  {copied === 'response' ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
            <pre className="p-4 overflow-x-auto text-xs font-mono leading-relaxed">
              <code className="text-green-300">
                {sending
                  ? '// requesting…'
                  : JSON.stringify(activeEndpoint.mockResponse, null, 2)}
              </code>
            </pre>
            {sent && !sending && (
              <div className="flex items-center gap-2 px-4 py-2.5 border-t border-dark-600 bg-dark-700/50 text-xs text-gray-400">
                <ChevronRight size={12} className="text-success" />
                Simulated response for <code className="font-mono text-gray-300">{activeEndpoint.method} {activeEndpoint.path}</code> — no network call was made.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiDocsPage;
