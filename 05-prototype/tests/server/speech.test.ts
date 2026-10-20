import { afterEach, expect, it, vi } from 'vitest';
import type { Server } from 'node:http';
import { AzureSpeechProvider, type SpeechProvider } from '../../src/server/speech';
import { createApp } from '../../src/server/app';
import { Repository } from '../../src/server/repository';

const audio=Buffer.from('mock-mp3');
const audioResponse=()=>new Response(audio,{headers:{'content-type':'audio/mpeg'}});

it('selects the Vietnamese neural voice, escapes SSML, and reads room codes in Vietnamese',async()=>{
 const transport=vi.fn<typeof fetch>().mockResolvedValue(audioResponse());
 const provider=new AzureSpeechProvider('server-test-key','southeastasia',undefined,transport);
 expect(await provider.synthesize('Đến phòng A201 & B105 <ngay>')).toEqual(audio);
 const [url,options]=transport.mock.calls[0];
 expect(url).toBe('https://southeastasia.tts.speech.microsoft.com/cognitiveservices/v1');
 expect(options!.headers).toMatchObject({'Ocp-Apim-Subscription-Key':'server-test-key','X-Microsoft-OutputFormat':'audio-24khz-48kbitrate-mono-mp3'});
 expect(options!.body).toContain('xml:lang="vi-VN"');expect(options!.body).toContain('name="vi-VN-HoaiMyNeural"');
 expect(options!.body).toContain('a hai không một &amp; bê một không năm &lt;ngay&gt;');
});
it('reuses repeated directions without another external synthesis',async()=>{
 const transport=vi.fn<typeof fetch>().mockImplementation(async()=>audioResponse());const provider=new AzureSpeechProvider('key','eastasia',undefined,transport);
 await provider.synthesize('Rẽ phải');await provider.synthesize('Rẽ phải');expect(transport).toHaveBeenCalledOnce();
 for(let i=0;i<64;i++)await provider.synthesize(`Tầng ${i}`);
 await provider.synthesize('Rẽ phải');expect(transport).toHaveBeenCalledTimes(66);
});
it.each([['','southeastasia','vi-VN-HoaiMyNeural'],['key','','vi-VN-HoaiMyNeural'],['key','bad.region','vi-VN-HoaiMyNeural'],['key','eastasia','en-US-JennyNeural']])('rejects missing or non-Vietnamese configuration',async(key,region,voice)=>{
 const transport=vi.fn<typeof fetch>();const provider=new AzureSpeechProvider(key,region,voice,transport);
 await expect(provider.synthesize('Rẽ phải')).rejects.toMatchObject({code:'SPEECH_NOT_CONFIGURED'});expect(transport).not.toHaveBeenCalled();
});
it('supports the Vietnamese male voice',async()=>{
 const transport=vi.fn<typeof fetch>().mockResolvedValue(audioResponse());await new AzureSpeechProvider('key','eastasia','vi-VN-NamMinhNeural',transport).synthesize('Rẽ trái');
 expect(transport.mock.calls[0][1]!.body).toContain('vi-VN-NamMinhNeural');
});
it.each([new Response('secret-provider-details',{status:401}),new Response('not audio'),new Response(null,{headers:{'content-type':'audio/mpeg'}})])('masks provider errors and invalid audio',async(response)=>{
 const provider=new AzureSpeechProvider('key','eastasia',undefined,vi.fn<typeof fetch>().mockResolvedValue(response));
 await expect(provider.synthesize('Rẽ phải')).rejects.toMatchObject({code:'SPEECH_UNAVAILABLE',message:'SPEECH_UNAVAILABLE'});
});
it('bounds upstream latency and forwards cancellation',async()=>{
 const transport:typeof fetch=async(_url,options)=>new Promise((_resolve,reject)=>{options!.signal!.addEventListener('abort',()=>reject(options!.signal!.reason),{once:true});});
 await expect(new AzureSpeechProvider('key','eastasia',undefined,transport,10).synthesize('Rẽ phải')).rejects.toMatchObject({code:'SPEECH_UNAVAILABLE'});
 const controller=new AbortController();const pending=new AzureSpeechProvider('key','eastasia',undefined,transport).synthesize('Rẽ trái',controller.signal);controller.abort();
 await expect(pending).rejects.toMatchObject({name:'AbortError'});
});

const cleanups:(()=>Promise<void>)[]=[];
afterEach(async()=>{for(const clean of cleanups.splice(0))await clean();});
async function setup(provider:SpeechProvider){
 const repository=new Repository();const {app,closeStreams}=createApp(repository,undefined,provider);
 const server:Server=await new Promise(resolve=>{const value=app.listen(0,'127.0.0.1',()=>resolve(value));});
 const url=`http://127.0.0.1:${(server.address() as {port:number}).port}/api/speech`;
 cleanups.push(async()=>{closeStreams();server.closeAllConnections();await new Promise<void>(resolve=>server.close(()=>resolve()));repository.close();});
 return (body:unknown)=>fetch(url,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
}
it('returns MP3 bytes over HTTP',async()=>{
 const synthesize=vi.fn().mockResolvedValue(audio);const post=await setup({synthesize});const response=await post({text:' Đi lên tầng 2 '});
 expect(response.status).toBe(200);expect(response.headers.get('content-type')).toBe('audio/mpeg');expect(response.headers.get('cache-control')).toBe('no-store');
 expect(Buffer.from(await response.arrayBuffer())).toEqual(audio);expect(synthesize).toHaveBeenCalledWith('Đi lên tầng 2',expect.any(AbortSignal));
});
it('returns recorded WAV bytes with the correct MIME type over HTTP',async()=>{
 const recorded=Buffer.from('RIFF-recorded-test');
 const post=await setup({configured:true,source:'recorded-omnivoice',recordings:1,synthesize:async()=>({data:recorded,contentType:'audio/wav'})});
 const response=await post({text:'Đi lên tầng hai.'});
 expect(response.status).toBe(200);expect(response.headers.get('content-type')).toBe('audio/wav');
 expect(Buffer.from(await response.arrayBuffer())).toEqual(recorded);
});
it('validates text and does not accept client voice overrides',async()=>{
 const synthesize=vi.fn();const post=await setup({synthesize});
 for(const body of [{text:''},{text:' '},{text:'a'.repeat(1001)},{text:12},{text:'Đi lên',voice:'en-US-JennyNeural'}])expect((await post(body)).status).toBe(400);
 expect(synthesize).not.toHaveBeenCalled();
});
it('returns a controlled unavailable response when credentials are absent',async()=>{
 const post=await setup(new AzureSpeechProvider('','',''));const response=await post({text:'Đi lên'});
 expect(response.status).toBe(503);expect(await response.json()).toEqual({ok:false,code:'SPEECH_NOT_CONFIGURED'});
});
it('does not expose upstream errors or credentials to the browser',async()=>{
 const post=await setup({synthesize:async()=>{throw new Error('secret-key and upstream body');}});const response=await post({text:'Đi lên'});
 expect(response.status).toBe(503);expect(await response.json()).toEqual({ok:false,code:'SPEECH_UNAVAILABLE'});
});
