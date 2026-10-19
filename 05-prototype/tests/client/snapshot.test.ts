import { describe, expect, it } from 'vitest';
import { acceptSnapshot } from '../../src/client/api';
import { createRun } from '../../src/shared/fixtures';
import { makeSnapshot } from '../../src/domain/engine';

describe('client authoritative snapshot ordering', () => {
  it('never rolls back to a lower revision or a retired run after reset', () => {
    const retired = new Set<string>();
    const old = makeSnapshot(createRun('RETURN_TO_DOCTOR', 'demo', '00000000-0000-0000-0000-000000000001'));
    const fresh = { ...old, revision: 9 };
    expect(acceptSnapshot(fresh, old, retired)).toBe(fresh);
    const reset = { ...makeSnapshot(createRun('COLLECT_PAPER', 'demo', '00000000-0000-0000-0000-000000000002')), generation: 1 };
    expect(acceptSnapshot(fresh, reset, retired)).toBe(reset);
    expect(acceptSnapshot(reset, { ...old, revision: 100 }, retired)).toBe(reset);
  });

  it('ignores a late acknowledgement from a skipped intermediate reset and still accepts the current run next event', () => {
    const retired = new Set<string>();
    const a = makeSnapshot(createRun('RETURN_TO_DOCTOR', 'demo', '00000000-0000-0000-0000-000000000001'));
    const b = { ...a, generation: a.generation + 1, runId: '00000000-0000-0000-0000-000000000002', revision: 8 };
    const c = { ...a, generation: a.generation + 2, runId: '00000000-0000-0000-0000-000000000003', revision: 0 };
    let current = acceptSnapshot(a, c, retired);
    current = acceptSnapshot(current, b, retired);
    expect(current).toBe(c);
    expect(retired.has(c.runId)).toBe(false);
    const cNext = { ...c, revision: 1 };
    expect(acceptSnapshot(current, cNext, retired)).toBe(cNext);
  });

  it('rejects a different run with the same generation without poisoning the current run', () => {
    const retired = new Set<string>();
    const current = makeSnapshot(createRun());
    const invalid = { ...current, runId: 'same-generation-other-run', revision: 999 };
    expect(acceptSnapshot(current, invalid, retired)).toBe(current);
    expect(retired.size).toBe(0);
    expect(acceptSnapshot(current, { ...current, revision: 1 }, retired)?.revision).toBe(1);
  });

  it('keeps the reconnect snapshot when a delayed SSE event or HTTP response belongs to an older generation', () => {
    const retired = new Set<string>();
    const beforeDisconnect = makeSnapshot(createRun());
    const afterReconnect = { ...beforeDisconnect, generation: beforeDisconnect.generation + 5, runId: 'reconnected-new-run', revision: 0 };
    const current = acceptSnapshot(beforeDisconnect, afterReconnect, retired);
    expect(acceptSnapshot(current, { ...beforeDisconnect, generation: afterReconnect.generation - 1, runId: 'unseen-old-sse', revision: 1000 }, retired)).toBe(afterReconnect);
    expect(acceptSnapshot(current, { ...afterReconnect, revision: 2 }, retired)?.revision).toBe(2);
  });
});
