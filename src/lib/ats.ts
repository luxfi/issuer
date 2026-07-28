// Alternative Trading System (ATS) sandbox data — the compliant secondary
// market where the issuer's already-issued digital securities trade between
// eligible (accredited / QIB) holders. Operated by the platform broker-dealer;
// settled T+1 into the transfer-agent DRS book. No real orders or trades.

export interface AtsMarket {
  symbol: string
  name: string
  security: string
  lastCents: number
  changePct: number
  volume24h: number // shares
  status: 'open' | 'halted' | 'auction'
}

export interface AtsLevel {
  priceCents: number
  size: number
  orders: number
}
export interface AtsBook {
  bids: AtsLevel[] // price descending
  asks: AtsLevel[] // price ascending
}

export interface AtsTrade {
  id: string
  symbol: string
  side: 'buy' | 'sell'
  priceCents: number
  size: number
  ts: string
  status: 'settled' | 'pending'
}

export const ATS_MARKETS: AtsMarket[] = [
  { symbol: 'HELI.A', name: 'Helios Series A Preferred', security: 'Series A Preferred', lastCents: 540, changePct: 8.0, volume24h: 42_000, status: 'open' },
  { symbol: 'HELI.C', name: 'Helios Common (Reg A+)', security: 'Common Stock', lastCents: 615, changePct: 2.5, volume24h: 128_000, status: 'open' },
]

export const ATS_BOOKS: Record<string, AtsBook> = {
  'HELI.A': {
    asks: [
      { priceCents: 545, size: 2_500, orders: 2 },
      { priceCents: 550, size: 5_000, orders: 3 },
      { priceCents: 560, size: 8_000, orders: 2 },
      { priceCents: 575, size: 12_000, orders: 4 },
      { priceCents: 600, size: 20_000, orders: 5 },
    ],
    bids: [
      { priceCents: 540, size: 3_000, orders: 2 },
      { priceCents: 535, size: 6_000, orders: 3 },
      { priceCents: 525, size: 10_000, orders: 4 },
      { priceCents: 510, size: 15_000, orders: 3 },
      { priceCents: 500, size: 25_000, orders: 6 },
    ],
  },
  'HELI.C': {
    asks: [
      { priceCents: 620, size: 4_000, orders: 3 },
      { priceCents: 630, size: 9_000, orders: 4 },
      { priceCents: 645, size: 15_000, orders: 5 },
      { priceCents: 660, size: 22_000, orders: 6 },
    ],
    bids: [
      { priceCents: 615, size: 5_000, orders: 3 },
      { priceCents: 605, size: 11_000, orders: 4 },
      { priceCents: 595, size: 18_000, orders: 5 },
      { priceCents: 580, size: 30_000, orders: 7 },
    ],
  },
}

export const ATS_TRADES: AtsTrade[] = [
  { id: 'T-10241', symbol: 'HELI.A', side: 'buy', priceCents: 542, size: 1_200, ts: '2026-07-13T15:41:00Z', status: 'settled' },
  { id: 'T-10240', symbol: 'HELI.C', side: 'buy', priceCents: 615, size: 1_000, ts: '2026-07-13T15:22:00Z', status: 'settled' },
  { id: 'T-10239', symbol: 'HELI.A', side: 'sell', priceCents: 538, size: 800, ts: '2026-07-13T14:58:00Z', status: 'settled' },
  { id: 'T-10238', symbol: 'HELI.C', side: 'sell', priceCents: 610, size: 2_500, ts: '2026-07-13T14:30:00Z', status: 'settled' },
  { id: 'T-10237', symbol: 'HELI.A', side: 'buy', priceCents: 545, size: 2_000, ts: '2026-07-13T13:55:00Z', status: 'settled' },
  { id: 'T-10236', symbol: 'HELI.C', side: 'buy', priceCents: 618, size: 750, ts: '2026-07-13T13:12:00Z', status: 'settled' },
  { id: 'T-10235', symbol: 'HELI.A', side: 'buy', priceCents: 540, size: 500, ts: '2026-07-13T12:44:00Z', status: 'pending' },
  { id: 'T-10234', symbol: 'HELI.C', side: 'sell', priceCents: 608, size: 3_200, ts: '2026-07-12T20:05:00Z', status: 'settled' },
]
