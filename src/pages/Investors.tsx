import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { Card, Table, THead, TH, TBody, TR, TD, Avatar, Badge, Button, Skeleton, Segmented, EmptyState, Stat } from '@/components/ui'
import { StatusBadge } from '@/components/StatusBadge'
import { Drawer, DetailRow, Section } from '@/components/Drawer'
import { useAsync } from '@/hooks/useAsync'
import { getInvestors, clearInvestorKyc } from '@/lib/data'
import { formatNumber, formatAmount, formatCompact, formatDate, initials, titleCase } from '@/lib/format'
import type { Investor } from '@/lib/types'

type Filter = 'all' | 'accredited' | 'non_accredited' | 'pending' | 'review'

export function Investors() {
  const { data, loading, refetch } = useAsync(getInvestors)
  const [filter, setFilter] = useState<Filter>('all')
  const [sel, setSel] = useState<Investor | null>(null)
  const [busy, setBusy] = useState(false)
  const investors = data ?? []

  const rows = useMemo(() => {
    switch (filter) {
      case 'accredited':
        return investors.filter((i) => i.accreditation === 'accredited' || i.accreditation === 'qualified')
      case 'non_accredited':
        return investors.filter((i) => i.accreditation === 'non_accredited')
      case 'pending':
        return investors.filter((i) => i.accreditation === 'pending')
      case 'review':
        return investors.filter((i) => i.kyc === 'review' || i.kyc === 'pending' || i.aml === 'pending')
      default:
        return investors
    }
  }, [investors, filter])

  const accredited = investors.filter((i) => i.accreditation === 'accredited' || i.accreditation === 'qualified').length
  const needsReview = investors.filter((i) => i.kyc === 'review' || i.kyc === 'pending' || i.aml === 'pending').length
  const distributions = investors.reduce((s, i) => s + i.distributionsCents, 0)

  async function clearKyc() {
    if (!sel) return
    setBusy(true)
    await clearInvestorKyc(sel.id)
    setBusy(false)
    setSel({ ...sel, kyc: 'cleared', aml: 'cleared', accreditation: sel.accreditation === 'pending' ? 'accredited' : sel.accreditation })
    refetch()
  }

  const canClear = sel && (sel.kyc === 'review' || sel.kyc === 'pending' || sel.aml === 'pending')

  return (
    <div className="space-y-6">
      <PageHeader
        title="Investors"
        desc="Accreditation, KYC/AML standing, holdings and distributions across all offerings."
        action={
          <Segmented
            value={filter}
            onChange={setFilter}
            options={[
              { label: 'All', value: 'all' },
              { label: 'Accredited', value: 'accredited' },
              { label: 'Non-acc.', value: 'non_accredited' },
              { label: 'Pending', value: 'pending' },
              { label: 'Review', value: 'review' },
            ]}
          />
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[104px]" />)
        ) : (
          <>
            <Stat label="Investors" value={formatNumber(investors.length)} icon="users" hint="on file" />
            <Stat label="Accredited / qualified" value={formatNumber(accredited)} icon="shield" />
            <Stat label="Awaiting review" value={formatNumber(needsReview)} icon="clock" hint="KYC / AML" />
            <Stat label="Distributions" value={formatCompact(distributions)} icon="treasury" hint="paid to date" />
          </>
        )}
      </div>

      <Card>
        {loading ? (
          <div className="space-y-2 p-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
        ) : rows.length === 0 ? (
          <EmptyState icon="users" title="No investors" desc="No investors match this filter." />
        ) : (
          <Table>
            <THead>
              <TH>Investor</TH>
              <TH>Country</TH>
              <TH>Accreditation</TH>
              <TH>KYC</TH>
              <TH>AML</TH>
              <TH className="text-right">Shares</TH>
              <TH className="text-right">Invested</TH>
            </THead>
            <TBody>
              {rows.map((inv) => (
                <TR key={inv.id} onClick={() => setSel(inv)}>
                  <TD>
                    <div className="flex items-center gap-2.5">
                      <Avatar label={initials(inv.name)} />
                      <div className="leading-tight">
                        <p className="font-medium">{inv.name}</p>
                        <p className="text-xs text-muted-foreground">{inv.email}</p>
                      </div>
                    </div>
                  </TD>
                  <TD>{inv.country}</TD>
                  <TD>
                    <StatusBadge status={inv.accreditation} dot={false} />
                  </TD>
                  <TD>
                    <StatusBadge status={inv.kyc} />
                  </TD>
                  <TD>
                    <StatusBadge status={inv.aml} />
                  </TD>
                  <TD className="text-right tabular-nums">{formatNumber(inv.shares)}</TD>
                  <TD className="text-right font-medium tabular-nums">{formatCompact(inv.investedCents)}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </Card>

      <Drawer
        open={!!sel}
        onClose={() => setSel(null)}
        title={sel?.name}
        subtitle={sel ? `${titleCase(sel.type)} · ${sel.country}` : ''}
        footer={
          canClear ? (
            <Button variant="success" icon="check" className="w-full" disabled={busy} onClick={clearKyc}>
              Clear KYC / AML
            </Button>
          ) : (
            <p className="text-center text-xs text-muted-foreground">
              {sel ? `KYC ${titleCase(sel.kyc)} · AML ${titleCase(sel.aml)}` : ''} — no action required
            </p>
          )
        }
      >
        {sel && (
          <div className="space-y-6">
            <Section label="Standing">
              <div className="flex flex-wrap gap-2">
                <StatusBadge status={sel.accreditation} dot={false} />
                <Badge tone="muted">KYC</Badge>
                <StatusBadge status={sel.kyc} />
                <Badge tone="muted">AML</Badge>
                <StatusBadge status={sel.aml} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{sel.accreditationBasis}</p>
            </Section>
            <Section label="Profile">
              <DetailRow label="Investor ID"><span className="font-mono text-xs">{sel.id}</span></DetailRow>
              <DetailRow label="Email">{sel.email}</DetailRow>
              <DetailRow label="Type">{titleCase(sel.type)}</DetailRow>
              <DetailRow label="Onboarded">{formatDate(sel.since)}</DetailRow>
            </Section>
            <Section label="Position">
              <DetailRow label="Shares / units">{formatNumber(sel.shares)}</DetailRow>
              <DetailRow label="Invested">{formatAmount(sel.investedCents, 'USD')}</DetailRow>
              <DetailRow label="Distributions">{formatAmount(sel.distributionsCents, 'USD')}</DetailRow>
              <DetailRow label="Offerings">{sel.offerings.join(', ')}</DetailRow>
            </Section>
          </div>
        )}
      </Drawer>
    </div>
  )
}
