// Shared display labels for securities vocabularies (used across issuer +
// operator consoles).
import type { OfferingExemption } from './types'

export const EXEMPTION_LABEL: Record<OfferingExemption, string> = {
  reg_d_506b: 'Reg D — 506(b)',
  reg_d_506c: 'Reg D — 506(c)',
  reg_a_tier2: 'Reg A+ — Tier 2',
  reg_s: 'Reg S',
  reg_cf: 'Reg CF',
}

export const EXEMPTION_SHORT: Record<OfferingExemption, string> = {
  reg_d_506b: '506(b)',
  reg_d_506c: '506(c)',
  reg_a_tier2: 'Reg A+',
  reg_s: 'Reg S',
  reg_cf: 'Reg CF',
}
