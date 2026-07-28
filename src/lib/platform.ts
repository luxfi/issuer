// Platform-operator (superadmin) sandbox data. This is the view ABOVE any single
// issuer: the entity that RUNS the regulated stack — a registered broker-dealer
// (BD), transfer agent (TA) and SEC-registered alternative trading system (ATS)
// — overseeing every issuer tenant on the platform. Deterministic; no real data.
import { chainHash, GENESIS_HASH } from './hash'

export type TenantKind = 'issuer' | 'broker_dealer' | 'transfer_agent' | 'ats' | 'msb'
export type KybStatus = 'verified' | 'in_review' | 'pending'
export type TenantStatus = 'active' | 'onboarding' | 'pending_approval' | 'suspended'

export interface Tenant {
  id: string
  name: string
  kind: TenantKind
  entity: string
  jurisdiction: string
  kyb: KybStatus
  status: TenantStatus
  securitiesIssued: number
  raisedCents: number
  holders: number
  offeringsLive: number
  since: string
}

export type ReviewState = 'approved' | 'pending' | 'halted'
export interface PlatformOffering {
  id: string
  issuer: string
  name: string
  exemptionLabel: string
  security: string
  status: string
  review: ReviewState
  targetCents: number
  raisedCents: number
  investors: number
}

export interface PlatformFiling {
  id: string
  kind: string
  issuer: string
  jurisdiction: string
  status: 'filed' | 'accepted' | 'pending' | 'overdue' | 'exempt' | 'effective'
  ref: string
}

export interface PlatformBadActor {
  id: string
  person: string
  issuer: string
  role: string
  result: 'clear' | 'flagged' | 'pending'
}

export const OPERATOR = {
  name: 'Lux Securities',
  ta: 'Lux Transfer Agency, LLC',
  bd: 'Lux Securities, LLC — Member FINRA/SIPC',
  ats: 'Lux ATS (SEC-registered)',
}

export const TENANTS: Tenant[] = [
  { id: 'T-HELI', name: 'Helios Robotics, Inc.', kind: 'issuer', entity: 'Delaware C-corp', jurisdiction: 'US', kyb: 'verified', status: 'active', securitiesIssued: 9_500_000, raisedCents: 2_010_000_000, holders: 68, offeringsLive: 3, since: '2024-06-01' },
  { id: 'T-ASTR', name: 'Aster Bio Holdings, PBC', kind: 'issuer', entity: 'Delaware PBC', jurisdiction: 'US', kyb: 'verified', status: 'active', securitiesIssued: 4_200_000, raisedCents: 1_150_000_000, holders: 41, offeringsLive: 1, since: '2025-01-14' },
  { id: 'T-MERD', name: 'Meridian Real Estate Trust', kind: 'issuer', entity: 'Maryland REIT', jurisdiction: 'US', kyb: 'verified', status: 'active', securitiesIssued: 12_000_000, raisedCents: 4_800_000_000, holders: 320, offeringsLive: 2, since: '2024-03-22' },
  { id: 'T-VIRE', name: 'Vireo Ventures Fund II, LP', kind: 'issuer', entity: 'Delaware LP (fund)', jurisdiction: 'US', kyb: 'verified', status: 'active', securitiesIssued: 750_000, raisedCents: 7_500_000_000, holders: 88, offeringsLive: 1, since: '2025-06-02' },
  { id: 'T-NRTH', name: 'Northwind Energy PLC', kind: 'issuer', entity: 'UK PLC', jurisdiction: 'Non-US', kyb: 'verified', status: 'active', securitiesIssued: 6_500_000, raisedCents: 3_000_000_000, holders: 54, offeringsLive: 1, since: '2025-09-10' },
  { id: 'T-KEST', name: 'Kestrel Fintech, Inc.', kind: 'issuer', entity: 'Delaware C-corp', jurisdiction: 'US', kyb: 'verified', status: 'suspended', securitiesIssued: 2_000_000, raisedCents: 500_000_000, holders: 22, offeringsLive: 0, since: '2025-04-18' },
  { id: 'T-COBL', name: 'Cobalt Mining Corp', kind: 'issuer', entity: 'Nevada corp', jurisdiction: 'US', kyb: 'in_review', status: 'pending_approval', securitiesIssued: 0, raisedCents: 0, holders: 0, offeringsLive: 0, since: '2026-07-08' },
  { id: 'T-SOLC', name: 'Solace Health, Inc.', kind: 'issuer', entity: 'Delaware C-corp', jurisdiction: 'US', kyb: 'pending', status: 'onboarding', securitiesIssued: 0, raisedCents: 0, holders: 0, offeringsLive: 0, since: '2026-07-11' },
  { id: 'T-HALC', name: 'Halcyon Securities, LLC', kind: 'broker_dealer', entity: 'FINRA member BD', jurisdiction: 'US', kyb: 'verified', status: 'active', securitiesIssued: 0, raisedCents: 0, holders: 0, offeringsLive: 0, since: '2025-02-01' },
  { id: 'T-CEDR', name: 'Cedar Transfer Agency', kind: 'transfer_agent', entity: 'SEC-registered TA', jurisdiction: 'US', kyb: 'verified', status: 'active', securitiesIssued: 0, raisedCents: 0, holders: 0, offeringsLive: 0, since: '2024-11-05' },
  { id: 'T-LTCE', name: 'Lattice ATS, LLC', kind: 'ats', entity: 'SEC-registered ATS', jurisdiction: 'US', kyb: 'verified', status: 'active', securitiesIssued: 0, raisedCents: 0, holders: 0, offeringsLive: 0, since: '2025-05-20' },
  { id: 'T-PAYB', name: 'PayBridge, Inc.', kind: 'msb', entity: 'FinCEN-registered MSB', jurisdiction: 'US', kyb: 'in_review', status: 'pending_approval', securitiesIssued: 0, raisedCents: 0, holders: 0, offeringsLive: 0, since: '2026-06-28' },
]

export const PLATFORM_OFFERINGS: PlatformOffering[] = [
  { id: 'PO-01', issuer: 'Helios Robotics, Inc.', name: 'Series A', exemptionLabel: 'Reg D — 506(c)', security: 'Series A Preferred', status: 'live', review: 'approved', targetCents: 1_200_000_000, raisedCents: 860_000_000, investors: 22 },
  { id: 'PO-02', issuer: 'Helios Robotics, Inc.', name: 'Community Round', exemptionLabel: 'Reg A+ — Tier 2', security: 'Common Stock', status: 'live', review: 'approved', targetCents: 2_000_000_000, raisedCents: 640_000_000, investors: 310 },
  { id: 'PO-03', issuer: 'Helios Robotics, Inc.', name: 'Offshore Tranche', exemptionLabel: 'Reg S', security: 'Series A Preferred', status: 'closing_soon', review: 'approved', targetCents: 500_000_000, raisedCents: 310_000_000, investors: 18 },
  { id: 'PO-04', issuer: 'Aster Bio Holdings, PBC', name: 'Series B', exemptionLabel: 'Reg D — 506(c)', security: 'Series B Preferred', status: 'live', review: 'approved', targetCents: 2_500_000_000, raisedCents: 1_150_000_000, investors: 41 },
  { id: 'PO-05', issuer: 'Meridian Real Estate Trust', name: 'Property Fund IV', exemptionLabel: 'Reg A+ — Tier 2', security: 'Trust Units', status: 'live', review: 'approved', targetCents: 5_000_000_000, raisedCents: 3_200_000_000, investors: 260 },
  { id: 'PO-06', issuer: 'Meridian Real Estate Trust', name: 'Bridge Notes', exemptionLabel: 'Reg D — 506(b)', security: 'Promissory Notes', status: 'funded', review: 'approved', targetCents: 1_600_000_000, raisedCents: 1_600_000_000, investors: 60 },
  { id: 'PO-07', issuer: 'Vireo Ventures Fund II, LP', name: 'Fund II', exemptionLabel: 'Reg D — 506(b)', security: 'LP Interests', status: 'live', review: 'approved', targetCents: 10_000_000_000, raisedCents: 7_500_000_000, investors: 88 },
  { id: 'PO-08', issuer: 'Northwind Energy PLC', name: 'Green Bond', exemptionLabel: 'Reg S', security: 'Senior Notes', status: 'live', review: 'approved', targetCents: 4_000_000_000, raisedCents: 3_000_000_000, investors: 54 },
  { id: 'PO-09', issuer: 'Cobalt Mining Corp', name: 'IPO — Community', exemptionLabel: 'Reg A+ — Tier 2', security: 'Common Stock', status: 'upcoming', review: 'pending', targetCents: 3_000_000_000, raisedCents: 0, investors: 0 },
  { id: 'PO-10', issuer: 'Kestrel Fintech, Inc.', name: 'Reg CF Round', exemptionLabel: 'Reg CF', security: 'Common Stock', status: 'draft', review: 'halted', targetCents: 500_000_000, raisedCents: 0, investors: 0 },
]

export const PLATFORM_FILINGS: PlatformFiling[] = [
  { id: 'PF-01', kind: 'Form D', issuer: 'Helios Robotics, Inc.', jurisdiction: 'SEC', status: 'filed', ref: '021-502774' },
  { id: 'PF-02', kind: 'Form 1-A', issuer: 'Helios Robotics, Inc.', jurisdiction: 'SEC — Reg A+', status: 'effective', ref: '024-12894' },
  { id: 'PF-03', kind: 'Form D', issuer: 'Aster Bio Holdings, PBC', jurisdiction: 'SEC', status: 'accepted', ref: '021-514403' },
  { id: 'PF-04', kind: 'Form 1-A', issuer: 'Meridian Real Estate Trust', jurisdiction: 'SEC — Reg A+', status: 'effective', ref: '024-11002' },
  { id: 'PF-05', kind: 'Form D', issuer: 'Vireo Ventures Fund II, LP', jurisdiction: 'SEC', status: 'accepted', ref: '021-498320' },
  { id: 'PF-06', kind: 'Reg S memorandum', issuer: 'Northwind Energy PLC', jurisdiction: 'Non-US', status: 'exempt', ref: 'Reg S' },
  { id: 'PF-07', kind: 'Form 1-A', issuer: 'Cobalt Mining Corp', jurisdiction: 'SEC — Reg A+', status: 'pending', ref: '024-13551' },
  { id: 'PF-08', kind: 'Blue Sky notice', issuer: 'Aster Bio Holdings, PBC', jurisdiction: 'California', status: 'overdue', ref: 'CA-NF-90551' },
]

export const PLATFORM_BAD_ACTORS: PlatformBadActor[] = [
  { id: 'PB-01', person: 'Ava Chen', issuer: 'Helios Robotics, Inc.', role: 'CEO / ≥20%', result: 'clear' },
  { id: 'PB-02', person: 'Dr. Lena Fischer', issuer: 'Aster Bio Holdings, PBC', role: 'CEO / Director', result: 'clear' },
  { id: 'PB-03', person: 'Meridian GP, LLC', issuer: 'Meridian Real Estate Trust', role: 'Sponsor / Manager', result: 'clear' },
  { id: 'PB-04', person: 'R. Delgado', issuer: 'Cobalt Mining Corp', role: 'CFO', result: 'flagged' },
  { id: 'PB-05', person: 'Vireo GP II, LLC', issuer: 'Vireo Ventures Fund II, LP', role: 'General Partner', result: 'clear' },
  { id: 'PB-06', person: 'S. Okafor', issuer: 'Kestrel Fintech, Inc.', role: 'Director', result: 'flagged' },
]

export const PLATFORM_KPIS = {
  tenants: TENANTS.length,
  issuers: TENANTS.filter((t) => t.kind === 'issuer').length,
  activeIssuers: TENANTS.filter((t) => t.kind === 'issuer' && t.status === 'active').length,
  securities: TENANTS.reduce((s, t) => s + t.securitiesIssued, 0),
  raisedCents: TENANTS.reduce((s, t) => s + t.raisedCents, 0),
  holders: TENANTS.reduce((s, t) => s + t.holders, 0),
  offeringsLive: TENANTS.reduce((s, t) => s + t.offeringsLive, 0),
  atsTrades24h: 170,
  gmvCents: 121_400_000,
}

// ---- Platform (cross-issuer) audit trail — its own hash chain. ----
type RawPlatformEvent = { ts: string; actor: string; action: string; issuer: string; detail: string }
const RAW: RawPlatformEvent[] = [
  { ts: '2024-11-05T12:00:00Z', actor: 'z@lux.financial', action: 'Transfer agent registered', issuer: 'Cedar Transfer Agency', detail: 'SEC Form TA-1 on file; onboarded as book-of-record TA.' },
  { ts: '2025-01-14T14:20:00Z', actor: 'operator', action: 'Issuer approved', issuer: 'Aster Bio Holdings, PBC', detail: 'KYB verified; issuer tenant activated for Reg D offering.' },
  { ts: '2025-02-01T09:30:00Z', actor: 'operator', action: 'Broker-dealer onboarded', issuer: 'Halcyon Securities, LLC', detail: 'FINRA membership confirmed; placement-agent tenant activated.' },
  { ts: '2025-06-02T16:45:00Z', actor: 'operator', action: 'Issuer approved', issuer: 'Vireo Ventures Fund II, LP', detail: 'Fund tenant activated; 506(b) LP interests.' },
  { ts: '2026-02-25T11:00:00Z', actor: 'compliance-agent', action: 'Filing accepted', issuer: 'Helios Robotics, Inc.', detail: 'SEC Form D accepted for Series A (021-502774).' },
  { ts: '2026-03-20T20:40:00Z', actor: 'compliance-agent', action: 'Reg A+ qualified', issuer: 'Meridian Real Estate Trust', detail: 'Form 1-A qualified; Property Fund IV effective.' },
  { ts: '2026-06-28T10:15:00Z', actor: 'operator', action: 'MSB flagged for review', issuer: 'PayBridge, Inc.', detail: 'BSA/AML program review pending; onboarding held.' },
  { ts: '2026-07-02T13:05:00Z', actor: 'operator', action: 'Issuer suspended', issuer: 'Kestrel Fintech, Inc.', detail: 'Reg CF round halted; suspended pending bad-actor remediation.' },
  { ts: '2026-07-08T15:22:00Z', actor: 'operator', action: 'Issuer onboarding started', issuer: 'Cobalt Mining Corp', detail: 'KYB in review; Reg A+ offering pending platform approval.' },
  { ts: '2026-07-09T18:40:00Z', actor: 'compliance-agent', action: 'Bad-actor hit', issuer: 'Cobalt Mining Corp', detail: 'Rule 506(d) covered person flagged (CFO); escalated to review.' },
  { ts: '2026-07-11T09:00:00Z', actor: 'operator', action: 'Issuer onboarding started', issuer: 'Solace Health, Inc.', detail: 'KYB pending; issuer tenant created.' },
  { ts: '2026-07-13T21:10:00Z', actor: 'ats-engine', action: 'Secondary trades settled', issuer: 'Helios Robotics, Inc.', detail: '170 ATS executions settled T+1 into DRS across HELI.A / HELI.C.' },
]

export interface PlatformAuditEvent extends RawPlatformEvent {
  seq: number
  prevHash: string
  hash: string
}

export const PLATFORM_AUDIT: PlatformAuditEvent[] = (() => {
  let prev = GENESIS_HASH
  return RAW.map((e, i) => {
    const seq = i + 1
    const payload = `${seq}|${e.ts}|${e.actor}|${e.action}|${e.issuer}|${e.detail}`
    const hash = chainHash(prev, payload)
    const ev: PlatformAuditEvent = { seq, ...e, prevHash: prev, hash }
    prev = hash
    return ev
  })
})()

export const TENANT_KIND_LABEL: Record<TenantKind, string> = {
  issuer: 'Issuer',
  broker_dealer: 'Broker-Dealer',
  transfer_agent: 'Transfer Agent',
  ats: 'ATS',
  msb: 'MSB',
}

// Bars for the platform overview: capital raised by issuer (cents).
export const RAISED_BY_ISSUER = TENANTS.filter((t) => t.raisedCents > 0)
  .sort((a, b) => b.raisedCents - a.raisedCents)
  .map((t) => ({ label: t.name.split(/[ ,]/)[0], value: t.raisedCents, sub: t.name }))
