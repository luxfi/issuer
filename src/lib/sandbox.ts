// Deterministic sandbox dataset for the issuer console. One primary issuer —
// Helios Robotics, Inc. (a fictional Delaware C-corp) — with a full digital-
// securities lifecycle: offerings, cap table, transfer-agent ledger, investors,
// compliance filings, and a hash-chained audit trail. No real securities; no
// network calls. Money is in minor units (cents); shares are integers.
import { chainHash, GENESIS_HASH } from './hash'
import type {
  AuditEvent,
  BadActorCheck,
  Filing,
  Holder,
  Investor,
  Offering,
  Overview,
  Restriction,
  ShareClass,
  TAEvent,
} from './types'

export const ISSUER = {
  name: 'Helios Robotics, Inc.',
  entity: 'Delaware C-corporation',
  cik: '0001988420',
  ein: '87-3049117',
  formed: '2024-05-14',
  state: 'Delaware',
  fiscalYearEnd: 'Dec 31',
}

// Fully-diluted denominator (all classes + reserved pool + warrants).
export const FULLY_DILUTED = 11_120_000
// Outstanding shares (common + preferred; excludes unexercised pool/warrants).
export const OUTSTANDING = 9_500_000

export const OFFERINGS: Offering[] = [
  {
    id: 'OF-SEED',
    name: 'Series Seed',
    exemption: 'reg_d_506b',
    security: 'Series Seed Preferred',
    status: 'funded',
    targetCents: 200_000_000,
    raisedCents: 199_500_000,
    minCents: 2_500_000,
    pricePerShareCents: 133,
    subscriptions: 14,
    investors: 14,
    accreditedOnly: true,
    generalSolicitation: false,
    opened: '2024-09-01',
    closes: '2024-12-15',
    jurisdiction: 'US — Reg D',
  },
  {
    id: 'OF-A',
    name: 'Series A',
    exemption: 'reg_d_506c',
    security: 'Series A Preferred',
    status: 'live',
    targetCents: 1_200_000_000,
    raisedCents: 860_000_000,
    minCents: 2_500_000,
    pricePerShareCents: 500,
    subscriptions: 22,
    investors: 22,
    accreditedOnly: true,
    generalSolicitation: true,
    opened: '2026-02-10',
    closes: '2026-09-30',
    jurisdiction: 'US — Reg D',
  },
  {
    id: 'OF-REGA',
    name: 'Community Round',
    exemption: 'reg_a_tier2',
    security: 'Common Stock',
    status: 'live',
    targetCents: 2_000_000_000,
    raisedCents: 640_000_000,
    minCents: 50_000,
    pricePerShareCents: 600,
    subscriptions: 310,
    investors: 310,
    accreditedOnly: false,
    generalSolicitation: true,
    opened: '2026-04-01',
    closes: '2026-12-31',
    jurisdiction: 'US — Reg A+ Tier 2 (SEC-qualified)',
  },
  {
    id: 'OF-REGS',
    name: 'Offshore Tranche',
    exemption: 'reg_s',
    security: 'Series A Preferred',
    status: 'closing_soon',
    targetCents: 500_000_000,
    raisedCents: 310_000_000,
    minCents: 5_000_000,
    pricePerShareCents: 500,
    subscriptions: 18,
    investors: 18,
    accreditedOnly: false,
    generalSolicitation: false,
    opened: '2026-03-15',
    closes: '2026-10-31',
    jurisdiction: 'Non-US — Reg S',
  },
  {
    id: 'OF-CF',
    name: 'Reg CF Round',
    exemption: 'reg_cf',
    security: 'Common Stock',
    status: 'upcoming',
    targetCents: 123_500_000,
    raisedCents: 0,
    minCents: 25_000,
    pricePerShareCents: 600,
    subscriptions: 0,
    investors: 0,
    accreditedOnly: false,
    generalSolicitation: true,
    opened: '2026-08-01',
    closes: '2026-11-15',
    jurisdiction: 'US — Reg CF (funding portal)',
  },
]

export const SHARE_CLASSES: ShareClass[] = [
  { id: 'SC-COM', name: 'Common Stock', kind: 'common', authorized: 12_000_000, issued: 6_000_000, pricePerShareCents: 10, liquidationPref: '—', votesPerShare: 1 },
  { id: 'SC-SEED', name: 'Series Seed Preferred', kind: 'preferred', authorized: 1_500_000, issued: 1_500_000, pricePerShareCents: 133, liquidationPref: '1× non-participating', votesPerShare: 1 },
  { id: 'SC-A', name: 'Series A Preferred', kind: 'preferred', authorized: 2_600_000, issued: 2_000_000, pricePerShareCents: 500, liquidationPref: '1× non-participating', votesPerShare: 1 },
  { id: 'SC-POOL', name: 'Option Pool (2024 Plan)', kind: 'option_pool', authorized: 1_500_000, issued: 1_000_000, pricePerShareCents: 85, liquidationPref: '—', votesPerShare: 0 },
  { id: 'SC-WRT', name: 'Bridge Warrants', kind: 'warrant', authorized: 200_000, issued: 120_000, pricePerShareCents: 500, liquidationPref: '—', votesPerShare: 0 },
]

const fd = (shares: number) => Math.round((shares / FULLY_DILUTED) * 1000) / 10
const out = (shares: number) => Math.round((shares / OUTSTANDING) * 1000) / 10

export const HOLDERS: Holder[] = [
  { id: 'H-001', name: 'Ava Chen', type: 'individual', className: 'Common Stock', shares: 2_600_000, ownershipPct: out(2_600_000), fdOwnershipPct: fd(2_600_000), invested_cents: 0, since: '2024-06-01' },
  { id: 'H-002', name: 'Marcus Reid', type: 'individual', className: 'Common Stock', shares: 2_200_000, ownershipPct: out(2_200_000), fdOwnershipPct: fd(2_200_000), invested_cents: 0, since: '2024-06-01' },
  { id: 'H-003', name: 'Priya Nair', type: 'individual', className: 'Common Stock', shares: 600_000, ownershipPct: out(600_000), fdOwnershipPct: fd(600_000), invested_cents: 0, since: '2024-06-01' },
  { id: 'H-004', name: 'Employees & advisors (34)', type: 'entity', className: 'Common Stock', shares: 600_000, ownershipPct: out(600_000), fdOwnershipPct: fd(600_000), invested_cents: 0, since: '2024-07-01' },
  { id: 'H-005', name: 'Fathom Seed Fund I, LP', type: 'fund', className: 'Series Seed Preferred', shares: 900_000, ownershipPct: out(900_000), fdOwnershipPct: fd(900_000), invested_cents: 119_700_000, since: '2024-09-25' },
  { id: 'H-006', name: 'Northgate Angels SPV', type: 'entity', className: 'Series Seed Preferred', shares: 375_000, ownershipPct: out(375_000), fdOwnershipPct: fd(375_000), invested_cents: 49_875_000, since: '2024-10-05' },
  { id: 'H-007', name: 'Seed angels (9)', type: 'individual', className: 'Series Seed Preferred', shares: 225_000, ownershipPct: out(225_000), fdOwnershipPct: fd(225_000), invested_cents: 29_925_000, since: '2024-11-02' },
  { id: 'H-008', name: 'Meridian Ventures III, LP', type: 'fund', className: 'Series A Preferred', shares: 1_200_000, ownershipPct: out(1_200_000), fdOwnershipPct: fd(1_200_000), invested_cents: 600_000_000, since: '2026-02-16' },
  { id: 'H-009', name: 'Lattice Capital, LP', type: 'fund', className: 'Series A Preferred', shares: 500_000, ownershipPct: out(500_000), fdOwnershipPct: fd(500_000), invested_cents: 250_000_000, since: '2026-03-04' },
  { id: 'H-010', name: 'Helios Strategic SPV', type: 'entity', className: 'Series A Preferred', shares: 300_000, ownershipPct: out(300_000), fdOwnershipPct: fd(300_000), invested_cents: 150_000_000, since: '2026-05-12' },
  { id: 'H-011', name: 'Option holders (41) — 2024 Plan', type: 'entity', className: 'Option Pool (2024 Plan)', shares: 1_500_000, ownershipPct: 0, fdOwnershipPct: fd(1_500_000), vested: { granted: 1_000_000, vested: 620_000, cliff: '2025-06-01', end: '2028-06-01' }, invested_cents: 0, since: '2024-07-01' },
  { id: 'H-012', name: 'Bridge warrant — Fathom', type: 'fund', className: 'Bridge Warrants', shares: 120_000, ownershipPct: 0, fdOwnershipPct: fd(120_000), invested_cents: 0, since: '2024-12-01' },
]

export const TA_EVENTS: TAEvent[] = [
  { id: 'CERT-000148', type: 'issuance', security: 'Series A Preferred', from: '—', to: 'Meridian Ventures III, LP', shares: 1_200_000, status: 'settled', restriction: 'Rule 144 restricted — §4(a)(2) private placement', holdUntil: '2027-02-16', drs: true, date: '2026-02-16' },
  { id: 'CERT-000149', type: 'issuance', security: 'Series A Preferred', from: '—', to: 'Lattice Capital, LP', shares: 500_000, status: 'settled', restriction: 'Rule 144 restricted — §4(a)(2) private placement', holdUntil: '2027-03-04', drs: true, date: '2026-03-04' },
  { id: 'CERT-000150', type: 'issuance', security: 'Series A Preferred', from: '—', to: 'Helios Strategic SPV', shares: 300_000, status: 'pending', restriction: 'Held pending KYC / accreditation verification', drs: true, date: '2026-05-12' },
  { id: 'CERT-000151', type: 'issuance', security: 'Common Stock', from: '—', to: 'Reg A+ investors (310)', shares: 1_066_667, status: 'settled', restriction: 'Freely tradable — Reg A+ Tier 2', drs: true, date: '2026-06-01' },
  { id: 'TXN-000042', type: 'transfer', security: 'Series Seed Preferred', from: 'Northgate Angels SPV', to: 'Cedar Trust', shares: 75_000, status: 'restricted', restriction: 'Rule 144 — holding met; Form 144 on file', drs: true, date: '2026-06-20' },
  { id: 'TXN-000043', type: 'transfer', security: 'Common Stock', from: 'Ava Chen', to: 'Chen Family Trust', shares: 200_000, status: 'settled', restriction: 'Rule 144 — affiliate volume limit applied', drs: true, date: '2026-05-28' },
  { id: 'CERT-000152', type: 'issuance', security: 'Series Seed Preferred', from: '—', to: 'Fathom Seed Fund I, LP', shares: 900_000, status: 'settled', restriction: 'Lock-up — released 2025-03-25', drs: true, date: '2024-09-25' },
  { id: 'REL-000009', type: 'release', security: 'Series Seed Preferred', from: '—', to: 'Fathom Seed Fund I, LP', shares: 900_000, status: 'settled', restriction: 'Lock-up expired — legend removed', drs: true, date: '2025-03-25' },
  { id: 'TXN-000044', type: 'transfer', security: 'Series A Preferred (Reg S)', from: '—', to: 'Sofia Marín', shares: 40_000, status: 'pending', restriction: 'Reg S — 40-day distribution compliance period', holdUntil: '2026-08-30', drs: true, date: '2026-07-03' },
  { id: 'WRT-000003', type: 'issuance', security: 'Bridge Warrant', from: '—', to: 'Fathom Seed Fund I, LP', shares: 120_000, status: 'settled', drs: true, date: '2024-12-01' },
  { id: 'TXN-000045', type: 'transfer', security: 'Common Stock', from: 'Former employee #101', to: 'Secondary buyer', shares: 5_000, status: 'rejected', restriction: 'ROFR not waived — transfer blocked', drs: true, date: '2026-06-30' },
  { id: 'CERT-000153', type: 'issuance', security: 'Series A Preferred (Reg S)', from: '—', to: 'Grün Kapital GmbH', shares: 60_000, status: 'settled', restriction: 'Reg S — 40-day period elapsed', drs: true, date: '2026-04-20' },
  { id: 'CERT-000154', type: 'issuance', security: 'Series A Preferred (Reg S)', from: '—', to: 'Kenji Watanabe', shares: 20_000, status: 'settled', restriction: 'Reg S — 40-day period elapsed', drs: true, date: '2026-04-02' },
  { id: 'TXN-000046', type: 'transfer', security: 'Series A Preferred', from: 'Lattice Capital, LP', to: 'Lattice SPV II, LP', shares: 100_000, status: 'pending', restriction: 'Rule 144 — holding period not met', drs: true, date: '2026-07-08' },
  { id: 'TXN-000047', type: 'transfer', security: 'Common Stock', from: 'Daniel Okoro', to: 'Okoro (spouse) — gift', shares: 1_000, status: 'pending', restriction: 'Gift transfer — transfer-agent review', drs: true, date: '2026-07-10' },
]

export const INVESTORS: Investor[] = [
  { id: 'IN-001', name: 'Meridian Ventures III, LP', type: 'fund', email: 'ops@meridian.vc', country: 'US', accreditation: 'accredited', accreditationBasis: 'Rule 501(a)(3) — institutional', kyc: 'cleared', aml: 'cleared', shares: 1_200_000, investedCents: 600_000_000, distributionsCents: 18_000_000, offerings: ['Series A'], since: '2026-02-14' },
  { id: 'IN-002', name: 'Fathom Seed Fund I, LP', type: 'fund', email: 'admin@fathom.fund', country: 'US', accreditation: 'accredited', accreditationBasis: 'Rule 501(a)(3) — institutional', kyc: 'cleared', aml: 'cleared', shares: 1_020_000, investedCents: 119_700_000, distributionsCents: 5_400_000, offerings: ['Series Seed', 'Bridge Warrant'], since: '2024-09-20' },
  { id: 'IN-003', name: 'Lattice Capital, LP', type: 'fund', email: 'invest@lattice.capital', country: 'US', accreditation: 'accredited', accreditationBasis: 'Rule 501(a)(3) — institutional', kyc: 'cleared', aml: 'cleared', shares: 500_000, investedCents: 250_000_000, distributionsCents: 0, offerings: ['Series A'], since: '2026-03-02' },
  { id: 'IN-004', name: 'Ava Chen', type: 'individual', email: 'ava@heliosrobotics.com', country: 'US', accreditation: 'accredited', accreditationBasis: 'Rule 501(a)(5) — income', kyc: 'cleared', aml: 'cleared', shares: 2_600_000, investedCents: 0, distributionsCents: 0, offerings: ['Founder'], since: '2024-06-01' },
  { id: 'IN-005', name: 'Northgate Angels SPV', type: 'entity', email: 'gp@northgate.io', country: 'US', accreditation: 'accredited', accreditationBasis: 'Rule 506(c) — third-party verified', kyc: 'cleared', aml: 'cleared', shares: 375_000, investedCents: 49_875_000, distributionsCents: 2_250_000, offerings: ['Series Seed'], since: '2024-10-05' },
  { id: 'IN-006', name: 'Helios Strategic SPV', type: 'entity', email: 'ir@heliosstrategic.com', country: 'US', accreditation: 'accredited', accreditationBasis: 'Rule 506(c) — verification in review', kyc: 'review', aml: 'cleared', shares: 300_000, investedCents: 150_000_000, distributionsCents: 0, offerings: ['Series A'], since: '2026-05-11' },
  { id: 'IN-007', name: 'Rebecca Stone', type: 'individual', email: 'rebecca.stone@gmail.com', country: 'US', accreditation: 'pending', accreditationBasis: '506(c) verification requested', kyc: 'pending', aml: 'pending', shares: 0, investedCents: 0, distributionsCents: 0, offerings: ['Series A'], since: '2026-07-01' },
  { id: 'IN-008', name: 'Sofia Marín', type: 'individual', email: 'sofia.marin@proton.me', country: 'ES', accreditation: 'qualified', accreditationBasis: 'Reg S — non-US person', kyc: 'cleared', aml: 'pending', shares: 40_000, investedCents: 20_000_000, distributionsCents: 0, offerings: ['Offshore Tranche'], since: '2026-03-20' },
  { id: 'IN-009', name: 'Kenji Watanabe', type: 'individual', email: 'k.watanabe@example.jp', country: 'JP', accreditation: 'qualified', accreditationBasis: 'Reg S — non-US person', kyc: 'cleared', aml: 'cleared', shares: 20_000, investedCents: 10_000_000, distributionsCents: 0, offerings: ['Offshore Tranche'], since: '2026-04-01' },
  { id: 'IN-010', name: 'Grün Kapital GmbH', type: 'entity', email: 'kontakt@gruenkapital.de', country: 'DE', accreditation: 'qualified', accreditationBasis: 'Reg S — non-US institution', kyc: 'cleared', aml: 'cleared', shares: 60_000, investedCents: 30_000_000, distributionsCents: 0, offerings: ['Offshore Tranche'], since: '2026-04-18' },
  { id: 'IN-011', name: 'Daniel Okoro', type: 'individual', email: 'daniel.okoro@gmail.com', country: 'US', accreditation: 'non_accredited', accreditationBasis: 'Reg A+ — investment limit applied', kyc: 'cleared', aml: 'cleared', shares: 3_333, investedCents: 1_999_800, distributionsCents: 0, offerings: ['Community Round'], since: '2026-04-12' },
  { id: 'IN-012', name: 'Priya Nair', type: 'individual', email: 'priya@heliosrobotics.com', country: 'US', accreditation: 'accredited', accreditationBasis: 'Rule 501(a)(5) — net worth', kyc: 'cleared', aml: 'cleared', shares: 600_000, investedCents: 0, distributionsCents: 0, offerings: ['Founder'], since: '2024-06-01' },
]

export const RESTRICTIONS: Restriction[] = [
  { id: 'RS-01', security: 'Series A Preferred', legend: 'THESE SECURITIES HAVE NOT BEEN REGISTERED UNDER THE SECURITIES ACT OF 1933…', basis: 'Rule 144 — §4(a)(2)', affects: 1_700_000, lifts: '2027-02-16', status: 'restricted' },
  { id: 'RS-02', security: 'Series A Preferred (Reg S)', legend: 'OFFERED AND SOLD IN RELIANCE ON REGULATION S…', basis: 'Reg S — 40-day distribution period', affects: 120_000, lifts: '2026-08-30', status: 'unlocking' },
  { id: 'RS-03', security: 'Common Stock (founders)', legend: 'AFFILIATE CONTROL SECURITIES — RULE 144 VOLUME LIMITS APPLY', basis: 'Rule 144 — affiliate', affects: 5_400_000, status: 'restricted' },
  { id: 'RS-04', security: 'Series Seed Preferred', legend: '(legend removed)', basis: 'Lock-up — expired 2025-03-25', affects: 1_500_000, lifts: '2025-03-25', status: 'unrestricted' },
  { id: 'RS-05', security: 'Common Stock (Reg A+)', legend: '(no legend — freely tradable)', basis: 'Reg A+ Tier 2', affects: 1_066_667, status: 'unrestricted' },
]

export const FILINGS: Filing[] = [
  { id: 'FL-01', kind: 'Form D', offering: 'Series Seed', jurisdiction: 'SEC — EDGAR', status: 'accepted', filed: '2024-09-30', reference: '021-489201' },
  { id: 'FL-02', kind: 'Form D', offering: 'Series A', jurisdiction: 'SEC — EDGAR', status: 'filed', filed: '2026-02-25', reference: '021-502774' },
  { id: 'FL-03', kind: 'Form D/A (annual amendment)', offering: 'Series A', jurisdiction: 'SEC — EDGAR', status: 'pending', due: '2026-08-25', reference: '021-502774-A' },
  { id: 'FL-04', kind: 'Form 1-A', offering: 'Community Round', jurisdiction: 'SEC — Reg A+', status: 'effective', filed: '2026-03-20', reference: '024-12894' },
  { id: 'FL-05', kind: 'Form C', offering: 'Reg CF Round', jurisdiction: 'SEC — funding portal', status: 'pending', due: '2026-10-01', reference: 'C-2026-0417' },
  { id: 'FL-06', kind: 'Blue Sky notice', offering: 'Series A', jurisdiction: 'California (DFPI)', status: 'filed', filed: '2026-02-26', reference: 'CA-NF-88213' },
  { id: 'FL-07', kind: 'Blue Sky notice', offering: 'Series A', jurisdiction: 'New York (Dept. of Law)', status: 'filed', filed: '2026-02-27', reference: 'NY-NF-44190' },
  { id: 'FL-08', kind: 'Blue Sky notice', offering: 'Series A', jurisdiction: 'Texas (SSB)', status: 'overdue', due: '2026-08-01', reference: 'TX-NF-pending' },
  { id: 'FL-09', kind: 'Blue Sky (covered security)', offering: 'Series A', jurisdiction: 'Massachusetts', status: 'exempt', reference: 'NSMIA §18 — 506 covered' },
  { id: 'FL-10', kind: 'US registration', offering: 'Offshore Tranche', jurisdiction: 'Non-US — Reg S', status: 'exempt', reference: 'Reg S — no US registration' },
]

export const BAD_ACTOR_CHECKS: BadActorCheck[] = [
  { id: 'BA-01', person: 'Ava Chen', role: 'CEO, Director, ≥20% holder', result: 'clear', checked: '2026-02-01' },
  { id: 'BA-02', person: 'Marcus Reid', role: 'CTO, Director', result: 'clear', checked: '2026-02-01' },
  { id: 'BA-03', person: 'Priya Nair', role: 'COO, Director', result: 'clear', checked: '2026-02-01' },
  { id: 'BA-04', person: 'Meridian Ventures III, LP', role: '≥20% beneficial owner', result: 'clear', checked: '2026-02-10' },
  { id: 'BA-05', person: 'Fathom Seed Fund I, LP', role: 'Seed lead (>20% at close)', result: 'clear', checked: '2024-09-15' },
  { id: 'BA-06', person: 'Lux Securities, BD', role: 'Placement agent', result: 'clear', checked: '2026-02-05' },
]

export const HOLDER_LIMITS = {
  holdersOfRecord: 68,
  nonAccredited: 14,
  totalThreshold: 2000, // Exchange Act §12(g)
  nonAccreditedThreshold: 500,
  status: 'within_limits' as const,
}

// ---- Audit trail: build the hash chain deterministically. ----
type RawEvent = Omit<AuditEvent, 'seq' | 'prevHash' | 'hash'>
const RAW_AUDIT: RawEvent[] = [
  { ts: '2024-06-01T15:04:00Z', actor: 'z@lux.financial', action: 'Issuer onboarded', category: 'cap_table', target: 'Helios Robotics, Inc.', detail: 'Delaware C-corp registered on the transfer-agent book of record.' },
  { ts: '2024-09-01T17:20:00Z', actor: 'z@lux.financial', action: 'Offering created', category: 'offering', target: 'Series Seed (Reg D 506(b))', detail: 'Target $2.0M; Series Seed Preferred @ $1.33; accredited-only.' },
  { ts: '2024-09-30T13:11:00Z', actor: 'compliance-agent', action: 'Form D filed', category: 'compliance', target: 'Series Seed', detail: 'SEC EDGAR Form D accepted (021-489201).' },
  { ts: '2024-12-15T22:00:00Z', actor: 'z@lux.financial', action: 'Offering closed', category: 'offering', target: 'Series Seed', detail: 'Raised $1.995M from 14 investors; fully subscribed.' },
  { ts: '2025-03-25T16:30:00Z', actor: 'ta-agent', action: 'Lock-up released', category: 'transfer', target: 'Fathom Seed Fund I, LP', detail: '6-month lock-up expired; 900,000 Series Seed legend removed.' },
  { ts: '2026-02-10T14:45:00Z', actor: 'z@lux.financial', action: 'Offering created', category: 'offering', target: 'Series A (Reg D 506(c))', detail: 'Target $12.0M; general solicitation enabled; accredited-only w/ verification.' },
  { ts: '2026-02-14T18:02:00Z', actor: 'compliance-agent', action: 'Accreditation verified', category: 'investor', target: 'Meridian Ventures III, LP', detail: 'Rule 506(c) verification — institutional (Rule 501(a)(3)).' },
  { ts: '2026-02-16T19:15:00Z', actor: 'ta-agent', action: 'Shares issued', category: 'transfer', target: 'Meridian Ventures III, LP', detail: '1,200,000 Series A issued (DRS book-entry); Rule 144 legend applied.' },
  { ts: '2026-02-25T11:00:00Z', actor: 'compliance-agent', action: 'Form D filed', category: 'compliance', target: 'Series A', detail: 'SEC Form D filed (021-502774); CA & NY blue-sky notices submitted.' },
  { ts: '2026-03-20T20:40:00Z', actor: 'compliance-agent', action: 'Reg A+ qualified', category: 'compliance', target: 'Community Round', detail: 'Form 1-A qualified by SEC; offering effective (024-12894).' },
  { ts: '2026-04-01T15:00:00Z', actor: 'z@lux.financial', action: 'Offering opened', category: 'offering', target: 'Reg A+ Community Round', detail: 'Tier 2 live; non-accredited participation with per-investor limits.' },
  { ts: '2026-05-12T13:22:00Z', actor: 'ta-agent', action: 'Issuance held', category: 'transfer', target: 'Helios Strategic SPV', detail: '300,000 Series A held pending KYC / accreditation review.' },
  { ts: '2026-06-01T09:05:00Z', actor: 'ta-agent', action: 'Batch issuance', category: 'transfer', target: 'Reg A+ investors (310)', detail: '1,066,667 Common issued in book-entry; freely tradable.' },
  { ts: '2026-06-20T17:48:00Z', actor: 'ta-agent', action: 'Transfer recorded', category: 'transfer', target: 'Northgate → Cedar Trust', detail: '75,000 Series Seed; Form 144 on file; Rule 144 holding met.' },
  { ts: '2026-06-30T10:33:00Z', actor: 'ta-agent', action: 'Transfer blocked', category: 'transfer', target: 'Employee secondary', detail: '5,000 Common transfer rejected — ROFR not waived.' },
  { ts: '2026-07-08T21:10:00Z', actor: 'z@lux.financial', action: 'Distribution paid', category: 'distribution', target: 'Series A holders', detail: '$180,000 dividend to Series A; $312,400 cumulative distributions.' },
]

export const AUDIT_TRAIL: AuditEvent[] = (() => {
  let prev = GENESIS_HASH
  return RAW_AUDIT.map((e, i) => {
    const seq = i + 1
    const payload = `${seq}|${e.ts}|${e.actor}|${e.action}|${e.target}|${e.detail}`
    const hash = chainHash(prev, payload)
    const ev: AuditEvent = { seq, ...e, prevHash: prev, hash }
    prev = hash
    return ev
  })
})()

export const OVERVIEW: Overview = {
  totalRaisedCents: OFFERINGS.reduce((s, o) => s + o.raisedCents, 0),
  holders: HOLDER_LIMITS.holdersOfRecord,
  securitiesIssued: OUTSTANDING,
  fullyDiluted: FULLY_DILUTED,
  pendingTransfers: TA_EVENTS.filter((t) => t.status === 'pending').length,
  offeringsLive: OFFERINGS.filter((o) => o.status === 'live' || o.status === 'closing_soon').length,
  accreditedInvestors: 54,
  optionsAvailable: 500_000,
  restrictedShares: 1_820_000,
  distributionsPaidCents: 31_240_000,
  raiseSeries: [
    { label: 'Aug', value: 120_000_000 },
    { label: 'Sep', value: 200_000_000 },
    { label: 'Oct', value: 200_000_000 },
    { label: 'Nov', value: 310_000_000 },
    { label: 'Dec', value: 440_000_000 },
    { label: 'Jan', value: 600_000_000 },
    { label: 'Feb', value: 830_000_000 },
    { label: 'Mar', value: 1_050_000_000 },
    { label: 'Apr', value: 1_320_000_000 },
    { label: 'May', value: 1_580_000_000 },
    { label: 'Jun', value: 1_840_000_000 },
    { label: 'Jul', value: 2_010_000_000 },
  ],
  classMix: [
    { label: 'Common', value: 6_000_000 },
    { label: 'Series Seed', value: 1_500_000 },
    { label: 'Series A', value: 2_000_000 },
    { label: 'Option Pool', value: 1_500_000 },
    { label: 'Warrants', value: 120_000 },
  ],
}
