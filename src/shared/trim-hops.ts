import type { HopSample } from './types'

/**
 * Drops the hops after the last one that actually replied. A trace that never
 * reaches its destination (the path black-holes ICMP part-way) otherwise
 * carries one silent row per remaining TTL up to the 30-hop cap - rows that
 * say nothing except "no answer", and that the route table/path graph then
 * render as a long tail of empty hops. Silent hops *between* responders are
 * kept (a firewalled router mid-path is real, useful information).
 *
 * Shared by the main process (so new traces are stored trimmed) and the
 * renderer (so runs already stored in the DB by older builds display
 * correctly too).
 */
export function trimTrailingSilentHops(hops: HopSample[]): HopSample[] {
  let end = hops.length
  while (end > 0 && hops[end - 1].address === null) end--
  return end === hops.length ? hops : hops.slice(0, end)
}
