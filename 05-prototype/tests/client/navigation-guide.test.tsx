// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NavigationGuide, walkingInstruction } from '../../src/client/NavigationGuide';
import { graph } from '../../src/shared/fixtures';
it('computes turns relative to the incoming direction, including the reverse route',()=>{
 const lift=graph.locations.find(p=>p.id==='DEMO-LIFT-2')!;
 const hall=graph.locations.find(p=>p.id==='DEMO-HALL-NOI')!;
 const room=graph.locations.find(p=>p.id==='DEMO-NOI')!;
 expect(walkingInstruction([lift,hall,room],0)).toContain('Đi tới');
 expect(walkingInstruction([lift,hall,room],1)).toContain('Rẽ phải');
 expect(walkingInstruction([room,hall,lift],1)).toContain('Rẽ trái');
});
describe('Vietnamese cloud audio',()=>{
 let host:HTMLDivElement,root:Root;
 const request=vi.fn(),nativeSpeak=vi.fn(),revoke=vi.fn();
 const players:TestAudio[]=[];
 class TestAudio {
  src='';onerror:(()=>void)|null=null;
  play=vi.fn(async()=>{});pause=vi.fn();load=vi.fn();
  removeAttribute=vi.fn(()=>{this.src='';});
  constructor(){players.push(this);}
 }
 const response=()=>({ok:true,headers:new Headers({'content-type':'audio/mpeg'}),blob:async()=>new Blob(['test-audio'],{type:'audio/mpeg'})});
 const render=(text='Đi tới thang máy',resetKey='a')=>act(async()=>root.render(<NavigationGuide text={text} resetKey={resetKey}/>));
 const toggle=()=>act(async()=>host.querySelector<HTMLButtonElement>('.icon-button')!.click());
 beforeEach(()=>{
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT',true);players.length=0;localStorage.clear();
  request.mockReset().mockResolvedValue(response());nativeSpeak.mockClear();revoke.mockClear();
  vi.stubGlobal('fetch',request);vi.stubGlobal('Audio',TestAudio);
  vi.stubGlobal('speechSynthesis',{speak:nativeSpeak,getVoices:()=>[{lang:'en-US',default:true}]});
  vi.stubGlobal('URL',{createObjectURL:vi.fn(()=>`blob:vi-${players.length}`),revokeObjectURL:revoke});
  host=document.createElement('div');document.body.append(host);root=createRoot(host);
 });
 afterEach(async()=>{await act(async()=>root.unmount());host.remove();vi.unstubAllGlobals();vi.useRealTimers();});

 it('plays Vietnamese audio by default, even when only English device voices exist',async()=>{
  await render();expect(host.querySelector('.icon-button')?.getAttribute('aria-pressed')).toBe('true');
  expect(request).toHaveBeenCalledWith('/api/speech',expect.objectContaining({method:'POST',body:JSON.stringify({text:'Đi tới thang máy'})}));
  expect(players[0].play).toHaveBeenCalledOnce();expect(nativeSpeak).not.toHaveBeenCalled();
  expect(host.querySelector('[role="status"]')).toBeNull();
 });
 it('remembers off across steps and remounts, and remembers turning on again',async()=>{
  await render();await toggle();
  expect(localStorage.getItem('vinmec.navigationVoice')).toBe('off');
  await render('Chặng tiếp theo','another-journey');
  await act(async()=>root.render(null));await render();
  expect(request).toHaveBeenCalledOnce();
  expect(host.querySelector('.icon-button')?.getAttribute('aria-label')).toBe('Bật giọng chỉ đường');
  await toggle();expect(localStorage.getItem('vinmec.navigationVoice')).toBe('on');
  await act(async()=>root.render(null));await render();
  expect(request).toHaveBeenCalledTimes(3);
  expect(host.querySelector('.icon-button')?.getAttribute('aria-pressed')).toBe('true');
 });
 it('keeps voice enabled after a playback error and requests the next step',async()=>{
  request.mockResolvedValueOnce({ok:false,status:503});await render();
  expect(host.querySelector('.icon-button')?.getAttribute('aria-pressed')).toBe('true');
  await render('Chặng tiếp theo');expect(players[1].play).toHaveBeenCalledOnce();
  expect(host.querySelector('.icon-button')?.getAttribute('aria-pressed')).toBe('true');
 });
 it('explains a missing recording without disabling voice and can retry after installation',async()=>{
  request.mockResolvedValueOnce({ok:false,status:503,json:async()=>({code:'SPEECH_RECORDING_MISSING'})});
  await render();expect(host.textContent).toContain('Chặng này chưa có bản ghi âm');
  expect(host.textContent).not.toContain('Chưa phát được giọng tiếng Việt');
  expect(host.querySelector('.icon-button')?.getAttribute('aria-pressed')).toBe('true');
  await act(async()=>host.querySelector<HTMLButtonElement>('[role="status"] button')!.click());
  expect(players[1].play).toHaveBeenCalledOnce();expect(host.querySelector('[role="status"]')).toBeNull();
 });
 it('uses the default and allows toggling when local storage is unavailable',async()=>{
  vi.spyOn(Storage.prototype,'getItem').mockImplementation(()=>{throw new Error('blocked');});
  vi.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw new Error('blocked');});
  try{await render();await toggle();expect(host.querySelector('.icon-button')?.getAttribute('aria-pressed')).toBe('false');}
  finally{vi.restoreAllMocks();}
 });
 it('stops old audio and releases its URL when a step, route, or toggle changes',async()=>{
  await render();const signal=request.mock.calls[0][1].signal;
  await render('Rẽ phải tới A201');
  expect(signal.aborted).toBe(true);expect(players[0].pause).toHaveBeenCalledOnce();expect(revoke).toHaveBeenCalledWith('blob:vi-1');
  expect(JSON.parse(request.mock.calls.at(-1)![1].body).text).toBe('Rẽ phải tới A201');
  await render('Rẽ phải tới A201','new-route');expect(players[1].pause).toHaveBeenCalledOnce();
  await toggle();expect(players[2].pause).toHaveBeenCalledOnce();expect(host.querySelector('.icon-button')?.getAttribute('aria-pressed')).toBe('false');
 });
 it('aborts a pending request on unmount and ignores a late response',async()=>{
  let resolve!:(value:ReturnType<typeof response>)=>void;
  request.mockImplementationOnce(()=>new Promise(done=>{resolve=done;}));
  await render();const signal=request.mock.calls[0][1].signal;
  await act(async()=>root.render(null));expect(signal.aborted).toBe(true);
  await act(async()=>resolve(response()));expect(players[0].play).not.toHaveBeenCalled();
 });
 it('never plays a late previous step after a newer step is available',async()=>{
  let resolve!:(value:ReturnType<typeof response>)=>void;
  request.mockImplementationOnce(()=>new Promise(done=>{resolve=done;}));
  await render();await render('Đến phòng B105');
  await act(async()=>resolve(response()));expect(players[0].play).not.toHaveBeenCalled();expect(players[1].play).toHaveBeenCalledOnce();
 });
 it.each([503,429])('shows a retry on a service error %s without using an English fallback',async(status)=>{
  request.mockResolvedValueOnce({ok:false,status});await render();
  expect(host.textContent).toContain('Chưa phát được giọng tiếng Việt');expect(nativeSpeak).not.toHaveBeenCalled();expect(players[0].play).not.toHaveBeenCalled();
  await act(async()=>host.querySelector<HTMLButtonElement>('[role="status"] button')!.click());expect(players[1].play).toHaveBeenCalledOnce();
 });
 it('rejects a non-audio response and allows retry after a network failure',async()=>{
  request.mockResolvedValueOnce({ok:true,headers:new Headers({'content-type':'text/html'})});await render();
  expect(players[0].play).not.toHaveBeenCalled();request.mockRejectedValueOnce(new TypeError('offline'));
  await act(async()=>host.querySelector<HTMLButtonElement>('[role="status"] button')!.click());
  expect(host.textContent).toContain('Chưa phát được giọng tiếng Việt');expect(nativeSpeak).not.toHaveBeenCalled();
 });
 it('retries autoplay-blocked audio in the tap gesture without requesting speech again',async()=>{
  request.mockImplementationOnce(async()=>{players[0].play.mockRejectedValueOnce(new DOMException('blocked','NotAllowedError'));return response();});
  await render();expect(host.textContent).toContain('Chạm Nghe lại');
  await act(async()=>host.querySelector<HTMLButtonElement>('[role="status"] button')!.click());
  expect(request).toHaveBeenCalledOnce();expect(players[0].play).toHaveBeenCalledTimes(2);expect(host.querySelector('[role="status"]')).toBeNull();
 });
 it('times out a stalled audio request',async()=>{
  vi.useFakeTimers();request.mockImplementationOnce((_url,options)=>new Promise((_resolve,reject)=>options.signal.addEventListener('abort',()=>reject(new Error('timeout')))));
  await render();await act(async()=>vi.advanceTimersByTime(15_000));
  expect(host.textContent).toContain('Chưa phát được giọng tiếng Việt');expect(players[0].play).not.toHaveBeenCalled();
 });
});
