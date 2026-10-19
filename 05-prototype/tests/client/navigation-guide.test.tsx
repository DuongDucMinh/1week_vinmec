// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { NavigationGuide, walkingInstruction } from '../../src/client/NavigationGuide';
import { graph } from '../../src/shared/fixtures';
it('computes turns relative to the incoming direction, including the reverse route',()=>{
 const lift=graph.locations.find(p=>p.id==='DEMO-LIFT-2')!;
 const hall=graph.locations.find(p=>p.id==='DEMO-HALL-NOI')!;
 const room=graph.locations.find(p=>p.id==='DEMO-NOI')!;
 expect(walkingInstruction([lift,hall,room],0)).toContain('quay mặt');
 expect(walkingInstruction([lift,hall,room],1)).toContain('Rẽ phải');
 expect(walkingInstruction([room,hall,lift],1)).toContain('Rẽ trái');
});
it('reads a new step after opt-in and cancels speech on unmount',async()=>{
 vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT',true);
 const speak=vi.fn(),cancel=vi.fn();
 vi.stubGlobal('speechSynthesis',{speak,cancel,getVoices:()=>[{lang:'vi-VN'}]});
 vi.stubGlobal('SpeechSynthesisUtterance',class {text:string;constructor(text:string){this.text=text;}});
 const host=document.createElement('div');document.body.append(host);const root=createRoot(host);
 await act(async()=>root.render(<NavigationGuide text="Đi tới thang máy" resetKey="a"/>));
 expect(speak).not.toHaveBeenCalled();
 await act(async()=>host.querySelector('button')!.click());
 expect(speak.mock.calls.at(-1)?.[0]).toMatchObject({text:'Đi tới thang máy',lang:'vi-VN'});
 await act(async()=>root.render(<NavigationGuide text="Rẽ phải tới A201" resetKey="a"/>));
 expect(speak.mock.calls.at(-1)?.[0].text).toBe('Rẽ phải tới A201');
 const old=cancel.mock.calls.length;await act(async()=>root.unmount());expect(cancel.mock.calls.length).toBeGreaterThan(old);
 host.remove();vi.unstubAllGlobals();
});
