// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '../../src/client/App';
import { createRun } from '../../src/shared/fixtures';
import { makeSnapshot } from '../../src/domain/engine';

class FakeEventSource {
  static current: FakeEventSource;
  listeners = new Map<string, (event: MessageEvent<string>) => void>();
  onerror: (() => void) | null = null;
  constructor() { FakeEventSource.current = this; }
  addEventListener(name: string, handler: (event: MessageEvent<string>) => void) { this.listeners.set(name, handler); }
  close() {}
  snapshot(value: unknown) { this.listeners.get('snapshot')?.(new MessageEvent('snapshot', { data: JSON.stringify(value) })); }
}

let host: HTMLDivElement;
let root: Root;
let requests: { path: string; body: Record<string, unknown> }[];
let respond: (value: unknown) => void;
let reject: (reason: Error) => void;

const button = (container: ParentNode, text: string) => {
  const found = [...container.querySelectorAll('button')].find(element => element.textContent === text);
  if (!found) throw new Error(`Missing button: ${text}`);
  return found;
};
const click = async (element: HTMLElement) => { await act(async () => { element.click(); }); };
const dialog = () => {
  const found = host.querySelector<HTMLDialogElement>('dialog[open]');
  if (!found) throw new Error('Expected an open modal');
  return found;
};

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal('EventSource', FakeEventSource);
  // jsdom has no native modal/top-layer implementation. These stubs only let us
  // test React's DOM placement and request recovery, not browser focus trapping.
  Object.defineProperties(HTMLDialogElement.prototype, {
    showModal: { configurable: true, value: function (this: HTMLDialogElement) { this.open = true; } },
    close: { configurable: true, value: function (this: HTMLDialogElement) { this.open = false; } },
  });
  requests = [];
  vi.stubGlobal('fetch', vi.fn((path: string, options: RequestInit) => {
    requests.push({ path, body: JSON.parse(options.body as string) });
    return new Promise((resolve, fail) => { respond = resolve; reject = fail; });
  }));
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(async () => {
  await act(async () => { root.unmount(); });
  host.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

async function openConfirmation(role: 'control') {
  window.history.replaceState(null, '', `/${role}`);
  await act(async () => { root.render(<App />); });
  const snapshot = makeSnapshot(createRun());
  await act(async () => { FakeEventSource.current.snapshot(snapshot); });
  await click(button(host, 'Cài đặt & kiểm tra'));
  await click(button(dialog(), 'Trả kết quả'));
  await click(button(host, 'Tạo lượt mới / đặt lại với chế độ đã chọn'));
  return { snapshot, submitText: 'Xác nhận tạo lượt mới' };
}

describe.each(['control'] as const)('%s modal command recovery', role => {
  it('shows pending and rejected command feedback inside the active modal', async () => {
    const { snapshot, submitText } = await openConfirmation(role);
    await click(button(dialog(), submitText));
    expect(dialog().querySelector('[role="status"]')?.textContent).toContain('Đang gửi xác nhận');
    expect(button(dialog(), submitText).disabled).toBe(true);
    await act(async () => { respond({ json: async () => ({ ok: false, message: 'Tiến độ đã đổi.', snapshot }) }); });
    expect(dialog().querySelector('[role="alert"]')?.textContent).toContain('Tiến độ đã đổi.');
    expect(dialog().querySelector('[role="status"]')).toBeNull();
    expect(button(dialog(), submitText).disabled).toBe(false);
    expect([...dialog().querySelectorAll('button')].some(element => element.textContent === 'Gửi lại cùng xác nhận')).toBe(false);
  });

  it('keeps unknown outcome honest and retries the identical command from inside the modal', async () => {
    const { snapshot, submitText } = await openConfirmation(role);
    await click(button(dialog(), submitText));
    await act(async () => { reject(new Error('Lost acknowledgement')); });
    expect(dialog().querySelector('[role="alert"]')?.textContent).toContain('Chưa rõ kết quả xác nhận');
    expect(button(dialog(), submitText).disabled).toBe(true);
    const retry = button(dialog(), 'Gửi lại cùng xác nhận');
    expect(retry.disabled).toBe(false);
    retry.focus();
    expect(document.activeElement).toBe(retry);
    expect(dialog().contains(document.activeElement)).toBe(true);
    await click(retry);
    expect(requests).toHaveLength(2);
    expect(requests[0].body.commandId).toEqual(expect.any(String));
    expect(requests[1]).toEqual(requests[0]);
    expect(dialog().querySelector('[role="status"]')?.textContent).toContain('Đang gửi xác nhận');
    await act(async () => { respond({ json: async () => ({ ok: true, snapshot }) }); });
    expect(dialog().getAttribute('aria-label')).toBe('Cài đặt & kiểm tra');
    expect(dialog().textContent).not.toContain('Bắt đầu lượt khám mới?');
    expect(host.querySelector('[role="alert"]')).toBeNull();
  });
});


describe('cross-screen command recovery', () => {
  it('revalidates a definite stale revision once without making the patient click again', async () => {
    window.history.replaceState(null,'','/control');
    await act(async()=>{root.render(<App/>);});
    const snapshot=makeSnapshot(createRun());
    await act(async()=>{FakeEventSource.current.snapshot(snapshot);});
    await act(async()=>{const select=host.querySelector<HTMLSelectElement>('[aria-label="Khoa khám ban đầu"]')!;select.value='DEMO-INTERNAL';select.dispatchEvent(new Event('change',{bubbles:true}));});
    await click(button(host,'Xác nhận tiếp nhận'));
    const fresh={...snapshot,revision:snapshot.revision+1};
    await act(async()=>{respond({json:async()=>({ok:false,code:'STALE_REVISION',snapshot:fresh})});});
    expect(requests).toHaveLength(2);
    expect(requests[1].body).toMatchObject({type:'REGISTER',visitId:'DEMO-P01',expectedRevision:fresh.revision,payload:requests[0].body.payload});
    expect(requests[1].body.commandId).not.toBe(requests[0].body.commandId);
    await act(async()=>{respond({json:async()=>({ok:true,snapshot:fresh})});});
    expect(host.querySelector('dialog')).toBeNull();
  });
  it('does not rebase an old command after the same patient was reset on another screen',async()=>{
    window.history.replaceState(null,'','/control');await act(async()=>root.render(<App/>));const snapshot=makeSnapshot(createRun());await act(async()=>FakeEventSource.current.snapshot(snapshot));
    await act(async()=>{const select=host.querySelector<HTMLSelectElement>('[aria-label="Khoa khám ban đầu"]')!;select.value='DEMO-CARDIOLOGY';select.dispatchEvent(new Event('change',{bubbles:true}));});await click(button(host,'Xác nhận tiếp nhận'));
    const fresh=structuredClone(snapshot);fresh.revision++;fresh.visits[0].journeyVersion=1;fresh.views['DEMO-P01'].visit.journeyVersion=1;
    await act(async()=>respond({json:async()=>({ok:false,code:'STALE_REVISION',message:'Hành trình đã được reset.',snapshot:fresh})}));expect(requests).toHaveLength(1);expect(host.querySelector('[role="alert"]')?.textContent).toContain('reset');expect(host.querySelector<HTMLSelectElement>('[aria-label="Khoa khám ban đầu"]')!.value).toBe('');
  });

});
