// Data-access layer for the platform-operator (superadmin) console. Mutable
// working copies of the cross-issuer sandbox so operator actions (approve /
// suspend a tenant, approve / halt an offering) persist for the session and
// append to the platform-wide hash-chained audit trail.
import { chainHash } from './hash'
import {
  OPERATOR,
  PLATFORM_AUDIT,
  PLATFORM_BAD_ACTORS,
  PLATFORM_FILINGS,
  PLATFORM_KPIS,
  PLATFORM_OFFERINGS,
  RAISED_BY_ISSUER,
  TENANTS,
  type PlatformAuditEvent,
  type PlatformBadActor,
  type PlatformFiling,
  type PlatformOffering,
  type Tenant,
  type TenantStatus,
} from './platform'

const tenants: Tenant[] = TENANTS.map((t) => ({ ...t }))
const offerings: PlatformOffering[] = PLATFORM_OFFERINGS.map((o) => ({ ...o }))
const audit: PlatformAuditEvent[] = PLATFORM_AUDIT.map((e) => ({ ...e }))

const wait = <T>(v: T, ms = 120): Promise<T> => new Promise((r) => setTimeout(() => r(v), ms))

function append(actor: string, action: string, issuer: string, detail: string) {
  const prev = audit[audit.length - 1]
  const seq = prev.seq + 1
  const ts = new Date().toISOString()
  const payload = `${seq}|${ts}|${actor}|${action}|${issuer}|${detail}`
  audit.push({ seq, ts, actor, action, issuer, detail, prevHash: prev.hash, hash: chainHash(prev.hash, payload) })
}

export const getOperator = () => wait(OPERATOR)
export const getPlatformKpis = () => wait(PLATFORM_KPIS)
export const getTenants = (): Promise<Tenant[]> => wait(tenants.map((t) => ({ ...t })))
export const getPlatformOfferings = (): Promise<PlatformOffering[]> => wait(offerings.map((o) => ({ ...o })))
export const getPlatformAudit = (): Promise<PlatformAuditEvent[]> => wait(audit.map((e) => ({ ...e })))
export const getPlatformFilings = (): Promise<PlatformFiling[]> => wait(PLATFORM_FILINGS)
export const getPlatformBadActors = (): Promise<PlatformBadActor[]> => wait(PLATFORM_BAD_ACTORS)
export const getRaisedByIssuer = () => wait(RAISED_BY_ISSUER)

export async function setTenantStatus(id: string, status: TenantStatus): Promise<void> {
  const t = tenants.find((x) => x.id === id)
  if (!t) return
  t.status = status
  const verb = status === 'active' ? 'Issuer approved' : status === 'suspended' ? 'Issuer suspended' : 'Tenant updated'
  append('operator', verb, t.name, `Tenant ${t.name} set to ${status.replace('_', ' ')}.`)
  await wait(null, 200)
}

export async function setOfferingReview(id: string, review: 'approved' | 'halted'): Promise<void> {
  const o = offerings.find((x) => x.id === id)
  if (!o) return
  o.review = review
  append('operator', review === 'approved' ? 'Offering approved' : 'Offering halted', o.issuer, `${o.name} (${o.exemptionLabel}) ${review}.`)
  await wait(null, 200)
}

export type { Tenant, PlatformOffering, PlatformAuditEvent, PlatformFiling, PlatformBadActor }
