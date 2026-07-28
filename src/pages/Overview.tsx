import { Link } from 'react-router'
import { PageHeader } from '@/components/PageHeader'
import { Card, CardHeader, CardBody, Stat, Skeleton, Table, THead, TH, TBody, TR, TD, Button } from '@/components/ui'
import { AreaTrend, Donut } from '@/components/charts'
import { useAsync } from '@/hooks/useAsync'
import { getOverview, getAuditTrail } from '@/lib/data'
import { formatCompact, formatCompactNumber, formatNumber, formatDate } from '@/lib/format'
import { Icon } from '@/components/icons'
import { ISSUER } from '@/lib/sandbox'
import { useBrand } from '@/lib/brand'

export function Overview() {
  const { data: ov, loading } = useAsync(getOverview)
  const { data: audit } = useAsync(getAuditTrail)
  const brand = useBrand()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        desc={`${ISSUER.name} — digital-securities book of record on the ${brand.product} sandbox.`}
        action={
          <Button icon="download" variant="secondary">
            Export report
          </Button>
        }
      />

      {/* Primary KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {loading || !ov ? (
          Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-[104px]" />)
        ) : (
          <>
            <Stat label="Total raised" value={formatCompact(ov.totalRaisedCents)} delta={{ value: '+9.3% mo', up: true }} icon="coins" hint="across all offerings" />
            <Stat label="Holders of record" value={formatNumber(ov.holders)} icon="users" hint="§12(g) monitored" />
            <Stat label="Securities issued" value={formatCompactNumber(ov.securitiesIssued)} icon="layers" hint="outstanding shares" />
            <Stat label="Pending transfers" value={formatNumber(ov.pendingTransfers)} icon="ledger" hint="TA review queue" />
            <Stat label="Offerings live" value={formatNumber(ov.offeringsLive)} icon="activity" hint="accepting subscriptions" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Cumulative raised */}
        <Card className="lg:col-span-2">
          <CardHeader title="Capital raised" desc="Cumulative across all offerings, trailing 12 months (USD)" />
          <CardBody>
            {loading || !ov ? (
              <Skeleton className="h-40 w-full" />
            ) : (
              <>
                <div className="mb-3 flex items-end gap-2">
                  <span className="text-2xl font-semibold tracking-tight tabular-nums">{formatCompact(ov.totalRaisedCents)}</span>
                  <span className="mb-1 inline-flex items-center gap-0.5 text-xs font-medium text-success">
                    <Icon name="arrowUp" size={12} /> 9.3%
                  </span>
                </div>
                <AreaTrend data={ov.raiseSeries} />
              </>
            )}
          </CardBody>
        </Card>

        {/* Ownership by class */}
        <Card>
          <CardHeader title="Fully-diluted ownership" desc="By share class" />
          <CardBody>
            {loading || !ov ? (
              <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-6" />)}</div>
            ) : (
              <Donut data={ov.classMix} />
            )}
          </CardBody>
        </Card>
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {loading || !ov ? (
          Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-[104px]" />)
        ) : (
          <>
            <Stat label="Fully diluted" value={formatCompactNumber(ov.fullyDiluted)} icon="pie" hint="all classes + pool" />
            <Stat label="Options available" value={formatCompactNumber(ov.optionsAvailable)} icon="key" hint="2024 Plan" />
            <Stat label="Accredited investors" value={formatNumber(ov.accreditedInvestors)} icon="shield" hint="of holders" />
            <Stat label="Restricted shares" value={formatCompactNumber(ov.restrictedShares)} icon="lock" hint="Rule 144 / Reg S" />
            <Stat label="Distributions paid" value={formatCompact(ov.distributionsPaidCents)} icon="treasury" hint="cumulative" />
          </>
        )}
      </div>

      <Card>
        <CardHeader
          title="Recent activity"
          desc="Latest entries on the transfer-agent and compliance ledger"
          action={
            <Link to="/audit">
              <Button size="sm" variant="ghost" icon="chevronRight">
                Audit trail
              </Button>
            </Link>
          }
        />
        <Table>
          <THead>
            <TH>Action</TH>
            <TH>Target</TH>
            <TH>Actor</TH>
            <TH className="text-right">When</TH>
          </THead>
          <TBody>
            {(audit ?? [])
              .slice()
              .reverse()
              .slice(0, 6)
              .map((e) => (
                <TR key={e.seq}>
                  <TD className="font-medium">{e.action}</TD>
                  <TD className="text-muted-foreground">{e.target}</TD>
                  <TD className="text-muted-foreground">{e.actor}</TD>
                  <TD className="text-right text-muted-foreground">{formatDate(e.ts)}</TD>
                </TR>
              ))}
          </TBody>
        </Table>
      </Card>
    </div>
  )
}
