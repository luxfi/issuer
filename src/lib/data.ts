// Data-access layer. The issuer console is a self-contained sandbox: every
// getter returns deterministic in-memory data (no bankd, no network). A couple
// of mutations (clear KYC, decide a pending transfer) let the demo drive the
// review flows and append to the audit trail — mirroring how an operator would
// act on the real transfer-agent book.
import { chainHash } from './hash'
import { ATS_BOOKS, ATS_MARKETS, ATS_TRADES, type AtsBook, type AtsMarket, type AtsTrade } from './ats'
import {
  AUDIT_TRAIL,
  BAD_ACTOR_CHECKS,
  FILINGS,
  HOLDERS,
  HOLDER_LIMITS,
  INVESTORS,
  ISSUER,
  OFFERINGS,
  OVERVIEW,
  RESTRICTIONS,
  SHARE_CLASSES,
  TA_EVENTS,
} from './sandbox'
import type {
  AuditEvent,
  BadActorCheck,
  Filing,
  Holder,
  Investor,
  KycState,
  Offering,
  Overview,
  Restriction,
  ShareClass,
  TAEvent,
} from './types'

// Mutable working copies so review actions persist for the session.
const investors: Investor[] = INVESTORS.map((i) => ({ ...i }))
const taEvents: TAEvent[] = TA_EVENTS.map((t) => ({ ...t }))
const audit: AuditEvent[] = AUDIT_TRAIL.map((e) => ({ ...e }))

const wait = <T>(v: T, ms = 120): Promise<T> => new Promise((r) => setTimeout(() => r(v), ms))

function appendAudit(actor: string, action: string, category: AuditEvent['category'], target: string, detail: string) {
  const prev = audit[audit.length - 1]
  const seq = prev.seq + 1
  const ts = new Date().toISOString()
  const payload = `${seq}|${ts}|${actor}|${action}|${target}|${detail}`
  audit.push({ seq, ts, actor, action, category, target, detail, prevHash: prev.hash, hash: chainHash(prev.hash, payload) })
}

export const getIssuer = () => wait(ISSUER)
export const getOverview = (): Promise<Overview> => wait(OVERVIEW)
export const getOfferings = (): Promise<Offering[]> => wait(OFFERINGS)
export const getShareClasses = (): Promise<ShareClass[]> => wait(SHARE_CLASSES)
export const getHolders = (): Promise<Holder[]> => wait(HOLDERS)
export const getInvestors = (): Promise<Investor[]> => wait(investors.map((i) => ({ ...i })))
export const getTAEvents = (): Promise<TAEvent[]> => wait(taEvents.map((t) => ({ ...t })))
export const getAuditTrail = (): Promise<AuditEvent[]> => wait(audit.map((e) => ({ ...e })))
export const getFilings = (): Promise<Filing[]> => wait(FILINGS)
export const getBadActorChecks = (): Promise<BadActorCheck[]> => wait(BAD_ACTOR_CHECKS)
export const getRestrictions = (): Promise<Restriction[]> => wait(RESTRICTIONS)
export const getHolderLimits = () => wait(HOLDER_LIMITS)

// ATS secondary market.
export const getAtsMarkets = (): Promise<AtsMarket[]> => wait(ATS_MARKETS)
export const getAtsBook = (symbol: string): Promise<AtsBook> => wait(ATS_BOOKS[symbol] ?? { bids: [], asks: [] })
export const getAtsTrades = (symbol?: string): Promise<AtsTrade[]> =>
  wait(symbol ? ATS_TRADES.filter((t) => t.symbol === symbol) : ATS_TRADES)

// Clear an investor's KYC/AML and accreditation (sandbox review action).
export async function clearInvestorKyc(id: string): Promise<void> {
  const inv = investors.find((i) => i.id === id)
  if (!inv) return
  inv.kyc = 'cleared' as KycState
  inv.aml = 'cleared' as KycState
  if (inv.accreditation === 'pending') inv.accreditation = 'accredited'
  appendAudit('z@lux.financial', 'KYC cleared', 'investor', inv.name, `Accreditation & AML cleared for ${inv.name}.`)
  await wait(null, 200)
}

// Decide a pending transfer/issuance on the transfer-agent book.
export async function decideTransfer(id: string, decision: 'settled' | 'rejected'): Promise<void> {
  const ev = taEvents.find((t) => t.id === id)
  if (!ev || ev.status !== 'pending') return
  ev.status = decision
  const verb = decision === 'settled' ? 'settled' : 'rejected'
  appendAudit('z@lux.financial', decision === 'settled' ? 'Transfer settled' : 'Transfer rejected', 'transfer', ev.to, `${ev.shares.toLocaleString()} ${ev.security} ${verb} (${ev.id}).`)
  await wait(null, 200)
}

// Re-export for pages that want the raw types alongside the getters.
export type { Offering, ShareClass, Holder, Investor, TAEvent, AuditEvent, Filing, BadActorCheck, Restriction, Overview }
