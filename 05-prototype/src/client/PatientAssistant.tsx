import { useEffect, useRef, useState } from 'react';
import type { AssistantAnswer, Snapshot, VisitView } from '../shared/contracts';
import type { SimulationApi } from './api';
import { Icon } from './icons';
import { AssistantAvatar } from './AssistantAvatar';

interface ChatTurn { id:string; question:string; answer?:AssistantAnswer; error?:string; pending:boolean }
const suggestions=['Giờ tôi làm gì?','Tôi có phải lấy giấy không?','Có kết quả sao chưa được vào?','Tôi đang ngoài viện thì đi đâu?'];

export function PatientAssistant({api,view,snapshot,active}:{api:SimulationApi;view:VisitView;snapshot:Snapshot;active:boolean}) {
  const [question,setQuestion]=useState('');
  const [messages,setMessages]=useState<ChatTurn[]>([]);
  const [busy,setBusy]=useState(false);
  const sending=useRef(false),generation=useRef(0);
  const scroll=useRef<HTMLDivElement>(null);
  useEffect(()=>()=>{generation.current++;},[]);
  useEffect(()=>{if(active&&scroll.current)scroll.current.scrollTop=messages.length?scroll.current.scrollHeight:0;},[messages,active]);

  async function submit(value:string,retryId?:string) {
    const text=value.trim();
    if(!text||text.length>1000||sending.current||!api.connected)return;
    const id=retryId||crypto.randomUUID(),token=generation.current;
    const previousIntent=[...messages].reverse().find(message=>message.answer)?.answer?.intent;
    sending.current=true;setBusy(true);
    if(!retryId)setQuestion('');
    setMessages(previous=>retryId?previous.map(message=>message.id===id?{...message,pending:true,error:undefined}:message):[...previous,{id,question:text,pending:true}]);
    try{
      const answer=await api.ask(view.visit.visitId,text,previousIntent);
      if(token===generation.current)setMessages(previous=>previous.map(message=>message.id===id?{...message,answer,pending:false}:message));
    }catch(error){
      if(token===generation.current)setMessages(previous=>previous.map(message=>message.id===id?{...message,pending:false,error:error instanceof Error?error.message:'Chưa nhận được câu trả lời. Bạn có thể thử lại.'}:message));
    }finally{
      if(token===generation.current){sending.current=false;setBusy(false);}
    }
  }

  return <section className="assistant-panel" aria-label="Trò chuyện với trợ lý">
    <div className="chat-heading"><span className="chat-avatar"><AssistantAvatar/></span><div><h2>Trợ lý hướng dẫn</h2><p className="assistant-availability">{snapshot.ai.configured?'Hỏi đáp về thủ tục khám':'Hướng dẫn theo lượt khám'}</p></div><span className="chat-status" aria-label={api.connected?'Đã kết nối ứng dụng':'Chưa có kết nối'}/></div>
    <div className="chat-context"><Icon name="pin" size={18}/><div><span>Bước hiện tại của bạn</span><strong>{view.nextAction.title}</strong></div></div>
    <div className="chat-scroll" ref={scroll}>
      <div className="chat-date">Cuộc trò chuyện của bạn</div>
      <div className="chat-welcome"><span className="chat-avatar small-avatar"><AssistantAvatar/></span><div className="chat-greeting"><strong>Chào bạn, mình có thể giúp gì?</strong><p>Mình có thể hướng dẫn bạn về giấy tờ, đường đi, kết quả và bước khám tiếp theo.</p></div></div>
      <div className="chat-messages" role="log" aria-label="Nội dung hội thoại" aria-live="polite" aria-relevant="additions text">
        {messages.map(message=><div className="chat-turn" key={message.id}>
          <div className="user-message"><span className="sr-only">Bạn: </span><p className="question-bubble">{message.question}</p></div>
          <div className="assistant-message"><span className="chat-avatar small-avatar"><AssistantAvatar/></span><div className="answer-bubble">
            {message.pending?<div className="typing-indicator" role="status"><i/><i/><i/><span className="sr-only">Trợ lý đang trả lời…</span></div>:message.answer?<><span className="answer-source">{message.answer.source==='LIVE'?'Trợ lý hướng dẫn':'Hướng dẫn theo tiến độ lượt khám'}</span><p>{message.answer.answer}</p>{message.answer.revision!==snapshot.revision&&<small className="chat-stale">Tiến độ đã cập nhật. Hỏi lại để xem hướng dẫn mới.</small>}</>:<><p role="alert">{message.error}</p><button className="text-button" disabled={busy||!api.connected} onClick={()=>void submit(message.question,message.id)}>Thử lại câu hỏi</button></>}
          </div></div>
        </div>)}
      </div>
    </div>
    <div className="chat-composer">
      {messages.length===0&&<div className="chat-suggestions"><p>Bạn có thể hỏi</p><div className="faq-chips">{suggestions.map(text=><button key={text} disabled={busy||!api.connected} onClick={()=>void submit(text)}>{text}</button>)}</div></div>}
      <form className="assistant-form" onSubmit={event=>{event.preventDefault();void submit(question);}}><label className="sr-only" htmlFor="question">Câu hỏi hướng dẫn</label><textarea id="question" rows={1} value={question} maxLength={1000} onChange={event=>setQuestion(event.target.value)} onKeyDown={event=>{if(event.key==='Enter'&&!event.shiftKey&&!event.nativeEvent.isComposing){event.preventDefault();void submit(question);}}} placeholder="Nhập câu hỏi của bạn…"/><button aria-label="Gửi câu hỏi" disabled={busy||!question.trim()||!api.connected}><Icon name="arrow" size={21}/></button></form><p>{!api.connected?'Kết nối lại ứng dụng để gửi câu hỏi.':'Hỗ trợ thủ tục khám · Câu hỏi sức khỏe cần trao đổi với bác sĩ'}</p>
    </div>
  </section>;
}
