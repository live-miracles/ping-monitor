import { describe, expect, it } from 'vitest'
import { trimTrailingSilentHops } from '../src/shared/trim-hops'
import { collectRunsFromHopRecords } from '../src/renderer/src/lib/route-table'
import type { HopRecord, HopSample } from '../src/shared/types'

function hop(hopNumber: number, address: string | null): HopSample {
  return { hopNumber, address, hostname: null, latencyMs: address ? 5 : null }
}

describe('trimTrailingSilentHops', () => {
  it('drops the silent tail after the last responding hop', () => {
    const hops = [hop(1, 'a'), hop(2, 'b'), hop(3, null), hop(4, null)]
    expect(trimTrailingSilentHops(hops).map((h) => h.hopNumber)).toEqual([1, 2])
  })

  it('keeps silent hops that sit between responders', () => {
    const hops = [hop(1, 'a'), hop(2, null), hop(3, 'c')]
    expect(trimTrailingSilentHops(hops)).toBe(hops)
  })

  it('returns an empty list when nothing replied', () => {
    expect(trimTrailingSilentHops([hop(1, null), hop(2, null)])).toEqual([])
  })
})

describe('collectRunsFromHopRecords', () => {
  it('trims the silent tail of runs stored by older builds', () => {
    const capturedAt = new Date(1_000)
    const records: HopRecord[] = [hop(1, 'a'), hop(2, 'b'), hop(3, null), hop(4, null)].map(
      (h, i) => ({
        id: i,
        targetId: 't',
        traceId: 'run-1',
        hopNumber: h.hopNumber,
        address: h.address,
        hostname: null,
        latencyMs: h.latencyMs,
        capturedAt
      })
    )
    const [run] = collectRunsFromHopRecords(records)
    expect(run.hops.map((h) => h.hopNumber)).toEqual([1, 2])
  })
})
