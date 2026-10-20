import { useState } from 'react';
import type { Snapshot, VisitView } from '../shared/contracts';
import type { SimulationApi } from './api';
import { Dialog } from './Dialog';
import { Icon } from './icons';
import { CommandFeedback } from './CommandFeedback';

export function LocationUpdate({ snapshot, view, api, close }: { snapshot: Snapshot; view: VisitView; api: SimulationApi; close: () => void }) {
  const [building, setBuilding] = useState('');
  const [floor, setFloor] = useState('');
  const [location, setLocation] = useState('');
  const [help, setHelp] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const points = snapshot.graph.locations.filter(point => !point.id.includes('HALL'));
  const floors = [...new Set(points.filter(point => point.buildingId === building).map(point => point.floor))].sort((a, b) => a - b);
  const choices = points.filter(point => point.buildingId === building && point.floor === Number(floor));
  const disabled = submitting || api.pending || !api.connected || api.uncertain;
  async function confirm() {
    if (disabled || !location) return;
    setSubmitting(true);
    try {
      if (await api.command('CONFIRM_LOCATION', view.visit.visitId, 'patient', { locationId: location, outsideHospital: false })) close();
    } finally { setSubmitting(false); }
  }
  return <Dialog contained label="Cập nhật vị trí" labelledBy="location-update-title" onDismiss={close}><section className="modal location-update">
    <button className="icon-button modal-close" aria-label="Đóng cập nhật vị trí" onClick={close}><Icon name="close" /></button>
    <h2 id="location-update-title">Bạn đang ở đâu?</h2>
    <p>Đi nhầm hoặc vừa quay lại viện? Đối chiếu biển tên và chọn mốc bạn đang đứng để cập nhật đường đi.</p>
    <label htmlFor="location-building">Tòa nhà</label><select id="location-building" value={building} disabled={disabled} onChange={event => { setBuilding(event.target.value); setFloor(''); setLocation(''); }}><option value="">Chọn tòa nhà</option>{snapshot.graph.buildings.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
    <label htmlFor="location-floor">Tầng</label><select id="location-floor" value={floor} disabled={disabled || !building} onChange={event => { setFloor(event.target.value); setLocation(''); }}><option value="">Chọn tầng</option>{floors.map(item => <option key={item} value={item}>Tầng {item}</option>)}</select>
    <label htmlFor="location-landmark">Mốc đang đứng</label><select id="location-landmark" value={location} disabled={disabled || !floor} onChange={event => setLocation(event.target.value)}><option value="">Chọn mốc theo biển tên</option>{choices.map(point => <option key={point.id} value={point.id}>{point.name}</option>)}</select>
    {!api.connected && <p role="status">Chưa có kết nối. Nhờ nhân viên xác định vị trí và hướng dẫn tiếp.</p>}
    <CommandFeedback api={api} inline onRetrySuccess={close} />
    <button className="primary" disabled={disabled || !location} onClick={() => void confirm()}>{submitting || api.pending ? 'Đang cập nhật…' : 'Tôi đang tại mốc này'}</button>
    <button className="text-button" onClick={() => setHelp(true)}>Tôi không xác định được vị trí</button>
    {help && <p className="location-help" role="status">Nhờ nhân viên gần bạn xác định tòa, tầng và mốc đang đứng. Chưa tiếp tục theo đường cũ nếu vị trí không khớp.</p>}
  </section></Dialog>;
}
