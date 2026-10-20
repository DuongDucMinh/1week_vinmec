import { useEffect, useState, type ReactNode } from 'react';
import type { ActionOption, CommandType, DepartmentDefinition, DepartmentId, Mode, Snapshot, Visit } from '../shared/contracts';
import type { SimulationApi } from './api';
import { Icon } from './icons';
import { Dialog } from './Dialog';
import { clinicForVisit, departmentForVisit } from '../shared/journey';
import { ResetJourney } from './ResetJourney';
import { CommandFeedback } from './CommandFeedback';
import { normalize, PersonIdentity, StaffEmpty, ViewSwitch } from './StaffUi';
export { Doctor, Procedure } from './Clinicians';

export function DashboardFrame({ snapshot, api, control, procedure, department, subtitle, toolbar, children }: {
  snapshot: Snapshot; api: SimulationApi; control?: boolean; procedure?: boolean;
  department?: DepartmentDefinition; subtitle?: string; toolbar?: ReactNode; children: ReactNode;
}) {
  const role = control ? 'Tiếp tân' : procedure ? 'Phòng thủ tục' : 'Bác sĩ';
  const room = snapshot.graph.locations.find(l => l.id === department?.locationId);
  const address = subtitle || (room ? `Phòng ${room.roomNumber} · ${room.building} · Tầng ${room.floor}` : '');
  const links = <><a className={!control && !procedure ? 'selected' : ''} aria-current={!control && !procedure ? 'page' : undefined} href="/doctor"><Icon name="doctor" size={19} />Bác sĩ</a><a className={procedure ? 'selected' : ''} aria-current={procedure ? 'page' : undefined} href="/procedure"><Icon name="lab" size={19} />Phòng thủ tục</a><a className={control ? 'selected' : ''} aria-current={control ? 'page' : undefined} href="/control"><Icon name="user" size={19} />Tiếp tân</a><a href="/patient" target="_blank" rel="noreferrer"><Icon name="map" size={19} />Người bệnh<Icon name="exit" size={14} /></a></>;
  return <div className="desktop-app staff-app">
    <aside className="desktop-sidebar">
      <a className="brand" href="/patient"><span className="brand-mark" aria-hidden="true">+</span><span>My<span>Vinmec</span><small>Ocean Park 2</small></span></a>
      <details className="staff-menu"><summary><Icon name="menu" size={20} /><span>Menu</span></summary><nav aria-label="Chuyển màn hình">{links}</nav></details>
      <span className="sidebar-label">KHÔNG GIAN LÀM VIỆC</span><nav className="staff-navigation" aria-label="Không gian làm việc">{links}</nav>
      <div className="sidebar-bottom"><span className="sidebar-status-dot" />Ngoại trú</div>
    </aside>
    <div className="desktop-content">
      <header className="desktop-header"><span>Ngoại trú <span className="breadcrumb-divider">/</span> {role}</span><span className={`connection-pill ${api.connected ? 'online' : ''}`}><i />{api.connected ? 'Đã đồng bộ' : 'Đang kết nối lại'}<time dateTime={snapshot.updatedAt}>{new Date(snapshot.updatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</time></span></header>
      <main className="desktop-body"><div className="page-title"><div><h1>{control ? 'Tiếp nhận & điều phối' : procedure ? 'Phòng thủ tục' : `Khám ${department?.shortName || 'chuyên khoa'}`}</h1>{address && <p>{address}</p>}</div><div className="staff-page-tools">{toolbar}</div></div>{children}</main>
    </div>
  </div>;
}

const actionNames: Partial<Record<CommandType, string>> = { REGISTER: 'Xác nhận tiếp nhận', CONFIRM_RESULT: 'Công bố kết quả', COLLECT_PAPER: 'Xác nhận giao bản giấy' };
const eventNames: Partial<Record<CommandType, string>> = { CHECK_IN_SERVICE: 'Đã ghi nhận đến phòng thủ tục', SET_TRANSPORT_MODE: 'Đã đổi cách di chuyển giữa các tầng', REGISTER: 'Đã tiếp nhận tại quầy', CALL_INITIAL: 'Gọi vào khám chuyên khoa', BEGIN_ENCOUNTER: 'Bắt đầu trao đổi với bác sĩ', ASSIGN_SERVICES: 'Đã chốt chỉ định thủ tục', ASSIGN_DEMO_SERVICES: 'Đã chốt chỉ định thủ tục', START_SERVICE: 'Bắt đầu làm thủ tục', COMPLETE_SERVICE: 'Đã xác nhận hoàn thành thủ tục', CONFIRM_RESULT: 'Đã công bố kết quả', COLLECT_PAPER: 'Đã giao bản giấy', CONFIRM_LOCATION: 'Người bệnh xác nhận vị trí', START_RETURN: 'Người bệnh bắt đầu quay lại', MARK_READY: 'Người bệnh sẵn sàng khám lại', STAFF_MARK_READY: 'Nhân viên xác nhận sẵn sàng khám lại', WITHDRAW_READY: 'Người bệnh rời khu chờ', CALL_REVIEW: 'Gọi vào trao đổi kết quả', COMPLETE_ENCOUNTER: 'Đã hoàn tất lượt khám', MARK_NOTIFICATION_READ: 'Đã đọc thông báo', RESET_VISIT: 'Đã reset hành trình người bệnh', SET_PROCEDURE_QUEUE_METHOD: 'Đã cập nhật cách lấy lượt tại phòng' };
const executionLabels = { NOT_STARTED: 'Chưa làm', IN_PROGRESS: 'Đang thực hiện', COMPLETED: 'Đã thực hiện' };
const resultLabels = { NOT_AVAILABLE: 'Chưa có kết quả', WAITING: 'Chờ kết quả', AVAILABLE: 'Đã có kết quả' };
const phaseLabels: Record<Visit['phase'], string> = { UNREGISTERED: 'Chưa tiếp nhận', WAITING_INITIAL: 'Chờ khám', INITIAL_ENCOUNTER: 'Đang khám', SERVICES: 'Làm thủ tục', READY: 'Quay lại bác sĩ', REVIEW_ENCOUNTER: 'Đang khám lại', COMPLETED: 'Hoàn tất' };

export function Control({ snapshot, api }: { snapshot: Snapshot; api: SimulationApi }) {
  const [selected, setSelected] = useState('DEMO-P01');
  const [departmentId, setDepartmentId] = useState<DepartmentId | ''>('');
  const [query, setQuery] = useState('');
  const [mobileView, setMobileView] = useState<'patients' | 'details'>('details');
  const [detailView, setDetailView] = useState<'services' | 'activity'>('services');
  const [mode, setMode] = useState<Mode>(snapshot.mode);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsView, setSettingsView] = useState<'rooms' | 'mode' | 'connection'>('rooms');
  const [resetDialog, setResetDialog] = useState(false);
  useEffect(() => { setSelected('DEMO-P01'); setMode(snapshot.mode); setResetDialog(false); }, [snapshot.runId]);
  const view = snapshot.views[selected];
  const v = view.visit;
  const disabled = api.pending || !api.connected;
  useEffect(() => setDepartmentId(''), [snapshot.runId, selected, v.journeyVersion]);
  const patients = snapshot.visits.filter(patient => normalize(`${patient.displayName} ${patient.visitId}`).includes(normalize(query.trim())));
  const actionButton = (option: ActionOption) => <button key={option.type + (option.serviceId || '')} className={option.type === 'REGISTER' ? 'primary' : 'secondary'} disabled={!option.enabled || disabled || (option.type === 'REGISTER' && !departmentId)} title={option.reason} onClick={() => api.command(option.type, selected, 'control', option.serviceId ? { serviceId: option.serviceId } : option.type === 'REGISTER' ? { departmentId: departmentId as DepartmentId } : {})}>{actionNames[option.type]}</button>;
  const dismissSettings = () => { setSettingsOpen(false); setResetDialog(false); };
  return <DashboardFrame snapshot={snapshot} api={api} control toolbar={<button className="secondary" aria-label="Cài đặt & kiểm tra" title="Cài đặt & kiểm tra" onClick={() => setSettingsOpen(true)}><Icon name="settings" size={17} />Cài đặt & kiểm tra</button>}>
    <ViewSwitch className="staff-mobile-switch" label="Không gian tiếp tân" value={mobileView} onChange={setMobileView} options={[{ value: 'patients', label: 'Người bệnh', count: snapshot.visits.length }, { value: 'details', label: 'Tiếp nhận' }]} />
    <div className="staff-workspace control-layout" data-mobile-view={mobileView}>
      <section className="staff-panel reception-roster" data-pane="patients">
        <div className="staff-panel-heading"><h2>Người bệnh <span className="count-badge">{snapshot.visits.length}</span></h2></div>
        <div className="roster-search"><label className="sr-only" htmlFor="reception-search">Tìm người bệnh tiếp nhận</label><input id="reception-search" type="search" value={query} placeholder="Tìm tên hoặc mã…" onChange={e => setQuery(e.target.value)} /></div>
        <div className="staff-scroll" tabIndex={0} aria-label="Danh sách người bệnh tiếp nhận">{patients.length ? patients.map(patient => <button className="reception-person" aria-pressed={selected === patient.visitId} key={patient.visitId} onClick={() => { setSelected(patient.visitId); setMobileView('details'); }}><PersonIdentity visit={patient} /><span className={`badge ${patient.phase === 'UNREGISTERED' ? 'neutral' : 'success'}`}>{phaseLabels[patient.phase]}</span><small>{departmentForVisit(patient)?.name || 'Chưa chọn khoa'}</small></button>) : <StaffEmpty title="Không tìm thấy người bệnh" />}</div>
        <div className="staff-panel-footnote">{snapshot.visits.filter(patient => patient.phase === 'UNREGISTERED').length} chưa tiếp nhận</div>
      </section>
      <section className="staff-panel reception-detail" data-pane="details">
        <div className="staff-panel-heading"><h2>Hồ sơ tiếp nhận</h2><span className={`badge ${v.phase === 'UNREGISTERED' ? 'neutral' : 'success'}`}>{phaseLabels[v.phase]}</span></div>
        <div className="reception-identity"><PersonIdentity visit={v} /><span className="muted small">{v.outsideHospital ? 'Ngoài viện' : 'Trong viện'}</span></div>
        <div className="reception-intake">
          {v.phase === 'UNREGISTERED' ? <><label>Khoa khám ban đầu<select aria-label="Khoa khám ban đầu" value={departmentId} disabled={disabled} onChange={e => setDepartmentId(e.target.value as DepartmentId)}><option value="" disabled>Chọn khoa khám…</option>{snapshot.departmentCatalog.map(d => <option value={d.id} key={d.id}>{d.name}</option>)}</select></label><div className="intake-action">{view.controlActions.filter(o => o.type === 'REGISTER').map(actionButton)}</div></> : <dl className="intake-facts"><div><dt>Khoa khám</dt><dd>{departmentForVisit(v)?.shortName}</dd></div><div><dt>Phòng khám</dt><dd>{clinicForVisit(v)?.roomNumber}</dd></div><div><dt>Số khám</dt><dd>{v.queueNumber ?? '—'}</dd></div></dl>}
        </div>
        <div className="current-fact"><Icon name="arrow" size={18} /><div><small>Bước tiếp theo</small><strong>{view.nextAction.title}</strong></div></div>
        <ViewSwitch label="Chi tiết lượt khám" value={detailView} onChange={setDetailView} options={[{ value: 'services', label: 'Thủ tục', count: v.services.length }, { value: 'activity', label: 'Hoạt động gần đây' }]} />
        <div className="control-services staff-scroll" hidden={detailView !== 'services'} tabIndex={0} aria-label="Thủ tục được chỉ định">
          {v.services.length ? v.services.map(s => <article className="control-service" key={s.id}><div><strong>{s.name}</strong><small>{executionLabels[s.executionStatus]}{snapshot.mode === 'COLLECT_PAPER' && ` · ${s.paperStatus === 'COLLECTED' ? 'Đã giao giấy' : 'Chưa giao giấy'}`}</small></div><span className={`badge ${s.resultStatus === 'AVAILABLE' ? 'success' : 'neutral'}`}>{resultLabels[s.resultStatus]}</span><div className="control-service-actions">{view.controlActions.filter(o => o.serviceId === s.id && (o.type === 'CONFIRM_RESULT' && s.executionStatus === 'COMPLETED' && s.resultStatus !== 'AVAILABLE' || o.type === 'COLLECT_PAPER' && snapshot.mode === 'COLLECT_PAPER' && s.resultStatus === 'AVAILABLE' && s.paperStatus !== 'COLLECTED')).map(actionButton)}</div></article>) : <StaffEmpty title="Chưa có chỉ định" detail="Bác sĩ sẽ chỉ định thủ tục sau khám." icon="lab" />}
        </div>
        <section className="event-log staff-scroll" hidden={detailView !== 'activity'} tabIndex={0} aria-label="Hoạt động gần đây">{[...snapshot.events].reverse().map(e => <article key={e.id}><time dateTime={e.at}>{new Date(e.at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</time><div>{e.visitId && <strong>{snapshot.visits.find(patient => patient.visitId === e.visitId)?.displayName}</strong>}<p>{e.message === 'Đã xác nhận thao tác.' ? eventNames[e.type as CommandType] || e.message : e.message}</p></div></article>)}{!snapshot.events.length && <StaffEmpty title="Chưa có hoạt động" icon="clock" />}</section>
        <footer className="reception-footer"><a className="text-button" href="/procedure">Mở phòng thủ tục <Icon name="arrow" size={15} /></a><ResetJourney visit={v} api={api} /></footer>
      </section>
    </div>
    {settingsOpen && <Dialog label={resetDialog ? 'Bắt đầu lượt khám mới?' : 'Cài đặt & kiểm tra'} onDismiss={dismissSettings}><section className={`modal staff-settings ${resetDialog ? 'reset-confirmation' : ''}`}>
      <button className="icon-button modal-close" aria-label="Đóng cài đặt" onClick={dismissSettings}><Icon name="close" size={20} /></button>
      {resetDialog ? <><h2>Bắt đầu lượt khám mới?</h2><p>Đặt lại tiến độ của {snapshot.visits.length} người bệnh. Chế độ mới: <strong>{mode === 'COLLECT_PAPER' ? 'Nhận kết quả bản giấy' : 'Kết quả điện tử'}</strong>.</p><CommandFeedback api={api} inline onRetrySuccess={() => setResetDialog(false)} /><button className="primary" disabled={disabled || api.uncertain} onClick={async () => { if (await api.reset(mode)) setResetDialog(false); }}>Xác nhận tạo lượt mới</button><button className="secondary" onClick={() => setResetDialog(false)}>Tiếp tục lượt hiện tại</button></> : <>
        <h2>Cài đặt & kiểm tra</h2>
        <ViewSwitch label="Nhóm cài đặt" value={settingsView} onChange={setSettingsView} options={[{ value: 'rooms', label: 'Lấy lượt' }, { value: 'mode', label: 'Trả kết quả' }, { value: 'connection', label: 'Kết nối' }]} />
        <section hidden={settingsView !== 'rooms'}><p>Thứ tự gọi theo giấy hoặc số tại cửa phòng.</p><div className="room-settings-list">{snapshot.serviceCatalog.map(s => <label className="room-method-setting" key={s.id}>{s.name}<select aria-label={`Cách lấy lượt ${s.name}`} value={snapshot.procedureQueueMethods[s.id]} disabled={disabled} onChange={e => api.command('SET_PROCEDURE_QUEUE_METHOD', selected, 'control', { serviceId: s.id, queueMethod: e.target.value as 'PAPER_TRAY' | 'TAKE_NUMBER' })}><option value="PAPER_TRAY">Xếp giấy trong khay</option><option value="TAKE_NUMBER">Lấy số tại cửa phòng</option></select></label>)}</div></section>
        <section hidden={settingsView !== 'mode'}><div className="mode-options"><label className={mode === 'RETURN_TO_DOCTOR' ? 'chosen' : ''}><input type="radio" name="mode" checked={mode === 'RETURN_TO_DOCTOR'} onChange={() => setMode('RETURN_TO_DOCTOR')} /><strong>Kết quả điện tử</strong><span>Chuyển kết quả tới bác sĩ.</span></label><label className={mode === 'COLLECT_PAPER' ? 'chosen' : ''}><input type="radio" name="mode" checked={mode === 'COLLECT_PAPER'} onChange={() => setMode('COLLECT_PAPER')} /><strong>Nhận kết quả bản giấy</strong><span>Thêm xác nhận giao giấy tại phòng thủ tục.</span></label></div><button className="secondary" disabled={disabled} onClick={() => setResetDialog(true)}>Tạo lượt mới / đặt lại với chế độ đã chọn</button><p>Áp dụng cho lượt mới; xóa tiến độ và hội thoại hiện tại.</p></section>
        <section className="technical-panel" hidden={settingsView !== 'connection'}><dl><dt>Phiên</dt><dd>{snapshot.runId}</dd><dt>Bản cập nhật</dt><dd>{snapshot.revision}</dd><dt>Trợ lý</dt><dd>{snapshot.ai.configured ? 'Đã cấu hình kết nối' : 'Hướng dẫn theo tiến độ'}</dd><dt>Đồng bộ</dt><dd>{api.connected ? 'Đã kết nối' : 'Đang kết nối lại'}</dd></dl><a className="text-button" href="/patient?tools=1" target="_blank" rel="noreferrer">Kiểm tra kết nối ứng dụng <Icon name="exit" size={15} /></a></section>
      </>}
    </section></Dialog>}
  </DashboardFrame>;
}
