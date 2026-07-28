import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { Card, CardHeader, Table, THead, TH, TBody, TR, TD, Badge, Skeleton, Stat, Segmented } from '@/components/ui'
import { StatusBadge } from '@/components/StatusBadge'
import { Icon } from '@/components/icons'
import { useAsync } from '@/hooks/useAsync'
import { getAtsMarkets, getAtsBook, getAtsTrades } from '@/lib/data'
import { formatAmount, formatNumber, formatPct, relativeTime } from '@/lib/format'
import { cn } from '@/lib/cn'

export function Trading() {
  const markets = useAsync(getAtsMarkets)
  const [symbol, setSymbol] = useState('HELI.A')
  const book = useAsync(() => getAtsBook(symbol), [symbol])
  const trades = useAsync(() => getAtsTrades(symbol), [symbol])
  const market = (markets.data ?? []).find((m) => m.symbol === symbol)

  const bestBid = book.data?.bids[0]?.priceCents
  const bestAsk = book.data?.asks[0]?.priceCents
  const spread = bestBid && bestAsk ? bestAsk - bestBid : 0
  const maxSize = useMemo(() => {
    const all = [...(book.data?.bids ?? []), ...(book.data?.asks ?? [])]
    return Math.max(1, ...all.map((l) => l.size))
  }, [book.data])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Trading — ATS"
        desc="SEC-registered alternative trading system for compliant secondary trading of the issued securities. Eligible (accredited / QIB) holders only; T+1 settlement into the TA book."
        action={
          <Segmented
            value={symbol}
            onChange={setSymbol}
            options={(markets.data ?? []).map((m) => ({ label: m.symbol, value: m.symbol }))}
          />
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {markets.loading || !market ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[104px]" />)
        ) : (
          <>
            <Stat label="Last price" value={formatAmount(market.lastCents, 'USD')} delta={{ value: formatPct(market.changePct), up: market.changePct >= 0 }} icon="coins" />
            <Stat label="24h volume" value={formatNumber(market.volume24h)} icon="activity" hint="shares" />
            <Stat label="Spread" value={formatAmount(spread, 'USD')} icon="tx" hint="best bid/ask" />
            <Stat label="Venue status" value={<span className="capitalize">{market.status}</span>} icon="server" hint="ATS · Rule 15c2-11" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Order book */}
        <Card>
          <CardHeader title={`Order book — ${symbol}`} desc={market?.name} />
          <div className="p-4">
            {book.loading || !book.data ? (
              <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-7" />)}</div>
            ) : (
              <div className="space-y-3">
                {/* Asks (reversed so best ask sits nearest the spread) */}
                <div className="space-y-1">
                  {book.data.asks
                    .slice()
                    .reverse()
                    .map((l) => (
                      <BookRow key={`a-${l.priceCents}`} side="ask" priceCents={l.priceCents} size={l.size} orders={l.orders} maxSize={maxSize} />
                    ))}
                </div>
                <div className="flex items-center justify-between border-y border-border py-1.5 text-xs">
                  <span className="font-medium text-foreground">Spread</span>
                  <span className="tabular-nums text-muted-foreground">
                    {formatAmount(spread, 'USD')} ({bestBid ? formatPct((spread / bestBid) * 100, 2) : '—'})
                  </span>
                </div>
                <div className="space-y-1">
                  {book.data.bids.map((l) => (
                    <BookRow key={`b-${l.priceCents}`} side="bid" priceCents={l.priceCents} size={l.size} orders={l.orders} maxSize={maxSize} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Matched trades */}
        <Card>
          <CardHeader title="Matched trades" desc="Executed on-venue; settling into DRS book-entry" />
          {trades.loading ? (
            <div className="space-y-2 p-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-9" />)}</div>
          ) : (
            <Table>
              <THead>
                <TH>Trade</TH>
                <TH>Side</TH>
                <TH className="text-right">Price</TH>
                <TH className="text-right">Size</TH>
                <TH>Settle</TH>
                <TH className="text-right">When</TH>
              </THead>
              <TBody>
                {(trades.data ?? []).map((t) => (
                  <TR key={t.id}>
                    <TD className="font-mono text-xs">{t.id}</TD>
                    <TD>
                      <Badge tone={t.side === 'buy' ? 'success' : 'danger'}>{t.side}</Badge>
                    </TD>
                    <TD className="text-right tabular-nums">{formatAmount(t.priceCents, 'USD')}</TD>
                    <TD className="text-right tabular-nums">{formatNumber(t.size)}</TD>
                    <TD>
                      <StatusBadge status={t.status} dot={false} />
                    </TD>
                    <TD className="text-right text-muted-foreground">{relativeTime(t.ts)}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </Card>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-info/25 bg-info/[0.06] px-4 py-2.5 text-xs text-info">
        <Icon name="scale" size={14} className="mt-0.5 shrink-0" />
        <p>
          <span className="font-semibold">Regulated venue.</span>{' '}
          <span className="text-info/80">
            Orders are restricted to verified eligible holders; transfers respect Rule 144 / Reg S legends and issuer
            transfer restrictions before matching. Executions settle T+1 into the transfer-agent DRS ledger.
          </span>
        </p>
      </div>
    </div>
  )
}

function BookRow({
  side,
  priceCents,
  size,
  orders,
  maxSize,
}: {
  side: 'bid' | 'ask'
  priceCents: number
  size: number
  orders: number
  maxSize: number
}) {
  const pct = Math.max(4, (size / maxSize) * 100)
  return (
    <div className="relative flex items-center justify-between overflow-hidden rounded-md px-2 py-1 text-xs">
      <div
        className={cn('absolute inset-y-0 right-0', side === 'ask' ? 'bg-destructive/10' : 'bg-success/10')}
        style={{ width: `${pct}%` }}
      />
      <span className={cn('relative z-10 font-medium tabular-nums', side === 'ask' ? 'text-destructive' : 'text-success')}>
        {formatAmount(priceCents, 'USD')}
      </span>
      <span className="relative z-10 tabular-nums text-foreground">{formatNumber(size)}</span>
      <span className="relative z-10 w-8 text-right tabular-nums text-muted-foreground">{orders}</span>
    </div>
  )
}
