// @vitest-environment jsdom
import {act} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {Patient} from '../../src/client/Patient';
import {createRun} from '../../src/shared/fixtures';
import {makeSnapshot} from '../../src/domain/engine';
import type {SimulationApi} from '../../src/client/api';
let root:Root,host:HTMLDivElement;
beforeEach(()=>{vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT',true);host=document.createElement('div');document.body.append(host);root=createRoot(host);});
afterEach(async()=>{await act(async()=>root.unmount());host.remove();vi.unstubAllGlobals();});
async function click(label:string){const button=[...host.querySelectorAll('button')].find(button=>button.textContent===label)!;await act(async()=>button.click());}
const snapshot=()=>makeSnapshot(createRun());
const api=()=>({connected:true,pending:false,command:vi.fn(),ask:vi.fn()}) as unknown as SimulationApi;

it('shows the question immediately, then keeps the response and draft when changing tabs',async()=>{
 const s=snapshot(),a=api();let resolve!:(value:unknown)=>void;
 a.ask=vi.fn().mockImplementation(()=>new Promise(done=>{resolve=done;}));
 await act(async()=>root.render(<Patient snapshot={s} api={a} offline={false} setOffline={vi.fn()}/>));
 await click('Trợ lý');await click('Giờ tôi làm gì?');
 expect(host.querySelector('.question-bubble')?.textContent).toBe('Giờ tôi làm gì?');
 expect(host.querySelector('.typing-indicator')).not.toBeNull();
 await click('Lượt khám');await click('Trợ lý');
 expect(host.querySelectorAll('.question-bubble')).toHaveLength(1);
 await act(async()=>resolve({source:'FALLBACK',answer:'Mời đến quầy tiếp nhận.',intent:'NEXT_ACTION',revision:s.revision,runId:s.runId}));
 expect(host.querySelector('.typing-indicator')).toBeNull();
 expect(host.querySelector('.answer-bubble')?.textContent).toContain('Mời đến quầy tiếp nhận.');
 const input=host.querySelector<HTMLTextAreaElement>('#question')!;
 await act(async()=>{Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value')!.set!.call(input,'Tôi cần giấy gì?');input.dispatchEvent(new Event('input',{bubbles:true}));});
 await click('Thông báo');await click('Trợ lý');
 expect(host.querySelector<HTMLTextAreaElement>('#question')?.value).toBe('Tôi cần giấy gì?');
 expect(a.ask).toHaveBeenCalledTimes(1);
});

it('retries a failed answer without duplicating the question and clears chat for a new journey',async()=>{
 const s=snapshot(),a=api();
 a.ask=vi.fn().mockRejectedValueOnce(new Error('Chưa nhận được phản hồi.')).mockResolvedValueOnce({source:'FALLBACK',answer:'Giữ giấy chỉ định.',intent:'PAPER',revision:s.revision,runId:s.runId});
 await act(async()=>root.render(<Patient snapshot={s} api={a} offline={false} setOffline={vi.fn()}/>));
 await click('Trợ lý');await click('Tôi có phải lấy giấy không?');
 expect(host.querySelector('[role="alert"]')?.textContent).toBe('Chưa nhận được phản hồi.');
 await click('Thử lại câu hỏi');
 expect(host.querySelectorAll('.question-bubble')).toHaveLength(1);
 expect(host.querySelector('.answer-bubble')?.textContent).toContain('Giữ giấy chỉ định.');
 s.views['DEMO-P01'].visit.journeyVersion=1;
 await act(async()=>root.render(<Patient snapshot={s} api={a} offline={false} setOffline={vi.fn()}/>));
 await click('Trợ lý');
 expect(host.querySelectorAll('.question-bubble')).toHaveLength(0);
});
