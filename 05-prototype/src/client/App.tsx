import { useState } from 'react';
import { useSimulation } from './api';
import { Patient } from './Patient';
import { Control, Doctor, Procedure } from './Dashboards';
import { CommandFeedback } from './CommandFeedback';

export function App() {
  const role = location.pathname.startsWith('/procedure') ? 'procedure' : location.pathname.startsWith('/doctor') ? 'doctor' : location.pathname.startsWith('/control') ? 'control' : 'patient';
  const [offline, setOffline] = useState(false);
  const api = useSimulation(role === 'patient' && offline);
  return <>{!api.snapshot ? <main className="loading-screen"><span className="brand-mark">+</span><h1>Đang kết nối lượt khám</h1><p>Đang lấy tiến độ mới nhất của bạn.</p><div className="loading-placeholder" /><p className="muted small">Nếu kết nối không phục hồi, dùng giấy hướng dẫn hoặc báo nhân viên tiếp nhận.</p><button className="secondary" onClick={() => location.reload()}>Thử kết nối lại</button></main> : role === 'procedure' ? <Procedure snapshot={api.snapshot} api={api} /> : role === 'doctor' ? <Doctor snapshot={api.snapshot} api={api} /> : role === 'control' ? <Control snapshot={api.snapshot} api={api} /> : <Patient snapshot={api.snapshot} api={api} offline={offline} setOffline={setOffline} />}<CommandFeedback api={api} /></>;
}
