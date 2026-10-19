import express from 'express';
import type { Response } from 'express';
import { join } from 'node:path';
import { commandSchema, resetSchema, assistantSchema } from '../shared/contracts';
import { DomainError, makeSnapshot } from '../domain/engine';
import { Repository } from './repository';
import { answerAssistant, ResponsesProvider, type AiProvider } from './ai/assistant';
export function createApp(repository:Repository,provider:AiProvider=new ResponsesProvider()){
 const app=express();app.disable('x-powered-by');app.use(express.json({limit:'16kb'}));const subscribers=new Set<Response>();
 const snapshot=()=>makeSnapshot(repository.read(),repository.events(),{configured:provider.configured,model:provider.model});
 const publish=()=>{const value=snapshot();for(const res of subscribers)res.write(`id: ${value.runId}:${value.revision}\nevent: snapshot\ndata: ${JSON.stringify(value)}\n\n`);};
 app.get('/api/health',(_req,res)=>res.json({ok:true,storage:'sqlite',aiConfigured:provider.configured}));
 app.get('/api/snapshot',(_req,res)=>res.json(snapshot()));
 app.get('/api/events',(req,res)=>{
  res.set({'Content-Type':'text/event-stream','Cache-Control':'no-cache, no-transform','Connection':'keep-alive','X-Accel-Buffering':'no'});res.flushHeaders();subscribers.add(res);
  // Subscribe and read synchronously in one JS turn: no command can interleave a missing revision.
  const value=snapshot();res.write(`id: ${value.runId}:${value.revision}\nevent: snapshot\ndata: ${JSON.stringify(value)}\n\n`);
  const heartbeat=setInterval(()=>res.write(': keepalive\n\n'),15000);heartbeat.unref();req.on('close',()=>{clearInterval(heartbeat);subscribers.delete(res);});
 });
 const commandHandler=(reset:boolean):express.RequestHandler=>(req,res)=>{const parsed=(reset?resetSchema:commandSchema).safeParse(req.body);if(!parsed.success){res.status(400).json({ok:false,code:'INVALID_COMMAND',message:'Dữ liệu thao tác không hợp lệ.',snapshot:snapshot()});return;}try{const receipt=reset?repository.reset(parsed.data as any):repository.command(parsed.data as any);if(receipt.changed)publish();res.json({ok:true,duplicate:receipt.duplicate,snapshot:snapshot()});}catch(e){if(e instanceof DomainError){res.status(e.code.startsWith('STALE')||e.code==='COMMAND_ID_REUSED'?409:422).json({ok:false,code:e.code,message:e.message,snapshot:snapshot()});}else{console.error('Command failed (details suppressed)');res.status(500).json({ok:false,code:'SERVER_ERROR',message:'Không xác nhận được thao tác. Đồng bộ hoặc thử lại cùng mã thao tác.',snapshot:snapshot()});}}};
 app.post('/api/commands',commandHandler(false));app.post('/api/demo/reset',commandHandler(true));
 app.post('/api/assistant',async(req,res)=>{const parsed=assistantSchema.safeParse(req.body);if(!parsed.success){res.status(400).json({ok:false,code:'INVALID_QUESTION',message:'Câu hỏi không hợp lệ.'});return;}try{res.json(await answerAssistant(parsed.data,()=>repository.read(),provider));}catch(e){res.status(e instanceof DomainError&&e.code==='STALE_CONTEXT'?409:422).json({ok:false,code:e instanceof DomainError?e.code:'AI_ERROR',message:e instanceof DomainError?e.message:'Không thể trả lời lúc này.',snapshot:snapshot()});}});
 app.use('/api',(_req,res)=>res.status(404).json({ok:false,code:'NOT_FOUND'}));
 app.use(express.static(join(process.cwd(),'dist')));app.get('/{*path}',(_req,res)=>res.sendFile(join(process.cwd(),'dist','index.html')));
 return {app,snapshot,closeStreams:()=>{for(const r of subscribers)r.end();subscribers.clear();}};
}
