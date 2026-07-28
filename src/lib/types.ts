// Domain types for the digital-securities issuer console (sandbox). Money is in
// minor units (cents); share/unit counts are integers.

export type OfferingExemption = 'reg_d_506b' | 'reg_d_506c' | 'reg_a_tier2' | 'reg_s' | 'reg_cf'
export type OfferingStatus = 'live' | 'closing_soon' | 'funded' | 'upcoming' | 'draft' | 'closed'

export interface Offering {
  id: string
  name: string
  exemption: OfferingExemption
  security: string // security offered, e.g. "Series A Preferred"
  status: OfferingStatus
  targetCents: number
  raisedCents: number
  minCents: number // minimum investment
  pricePerShareCents: number
  subscriptions: number
  investors: number
  accreditedOnly: boolean
  generalSolicitation: boolean
  opened: string // ISO
  closes: string // ISO (target close)
  jurisdiction: string
}

export type ShareClassKind = 'common' | 'preferred' | 'option_pool' | 'safe' | 'warrant'
export interface ShareClass {
  id: string
  name: string
  kind: ShareClassKind
  authorized: number
  issued: number // outstanding
  pricePerShareCents: number
  liquidationPref?: string
  votesPerShare: number
}

export interface Holder {
  id: string
  name: string
  type: 'individual' | 'entity' | 'fund' | 'trust'
  className: string
  shares: number
  ownershipPct: number // of fully-diluted
  fdOwnershipPct: number
  vested?: { granted: number; vested: number; cliff: string; end: string } // for option grants
  invested_cents: number
  since: string
}

export type TAEventType = 'issuance' | 'transfer' | 'restriction' | 'release' | 'conversion' | 'cancellation'
export interface TAEvent {
  id: string // certificate / entry id
  type: TAEventType
  security: string
  from: string // '—' for issuance from treasury
  to: string
  shares: number
  status: 'settled' | 'pending' | 'restricted' | 'rejected'
  restriction?: string // legend / basis, e.g. "Rule 144 — 6mo holding"
  holdUntil?: string // ISO, restriction lift date
  drs: boolean // book-entry (DRS) vs certificated
  date: string
}

export type Accreditation = 'accredited' | 'non_accredited' | 'qualified' | 'pending'
export type KycState = 'cleared' | 'pending' | 'review' | 'flagged' | 'rejected'
export interface Investor {
  id: string
  name: string
  type: 'individual' | 'entity' | 'fund' | 'trust'
  email: string
  country: string
  accreditation: Accreditation
  accreditationBasis: string
  kyc: KycState
  aml: KycState
  shares: number
  investedCents: number
  distributionsCents: number
  offerings: string[]
  since: string
}

export interface AuditEvent {
  seq: number
  ts: string
  actor: string
  action: string
  category: 'offering' | 'cap_table' | 'transfer' | 'investor' | 'compliance' | 'distribution'
  target: string
  detail: string
  prevHash: string
  hash: string
}

export type FilingStatus = 'filed' | 'accepted' | 'pending' | 'overdue' | 'exempt' | 'effective'
export interface Filing {
  id: string
  kind: string // "Form D", "Blue Sky", "Form 1-A", "Form C"
  offering: string
  jurisdiction: string
  status: FilingStatus
  filed?: string
  due?: string
  reference: string
}

export interface BadActorCheck {
  id: string
  person: string
  role: string
  result: 'clear' | 'flagged' | 'pending'
  checked: string
}

export interface Restriction {
  id: string
  security: string
  legend: string
  basis: string // "Rule 144", "Lock-up", "Reg S — 40-day", "Reg CF — 12mo"
  affects: number // shares
  lifts?: string
  status: 'restricted' | 'unlocking' | 'unrestricted'
}

export interface Overview {
  totalRaisedCents: number
  holders: number
  securitiesIssued: number
  fullyDiluted: number
  pendingTransfers: number
  offeringsLive: number
  accreditedInvestors: number
  optionsAvailable: number
  restrictedShares: number
  distributionsPaidCents: number
  raiseSeries: { label: string; value: number }[] // cumulative raised by month (cents)
  classMix: { label: string; value: number }[] // fully-diluted by class (shares)
}
