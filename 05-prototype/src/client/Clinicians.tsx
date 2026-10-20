import { useEffect, useState } from 'react';
import type { DepartmentId, ServiceId, Snapshot, Visit } from '../shared/contracts';
import type { SimulationApi } from './api';
import { DashboardFrame } from './Dashboards';
import { procedureArrivalInstruction } from '../shared/procedure-arrival';
import { departmentForVisit } from '../shared/journey';
import { Icon } from './icons';
import { Dialog } from './Dialog';
import { normalize, PersonIdentity, StaffEmpty, ViewSwitch } from './StaffUi';

function Orders({ snapshot, api, visit }: { snapshot: Snapshot; api: SimulationApi; visit: Visit }) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<ServiceId[]>([]);
  const [mobileView, setMobileView] = useState<'catalog' | 'selected'>('catalog');
  const disabled = api.pending || !api.connected;
  const matches = snapshot.serviceCatalog.filter(s => normalize(`${s.name} ${s.department} ${s.keywords}`).includes(normalize(query)));
  const toggle = (id: ServiceId) => setSelected(ids => ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]);
  const move = (index: number, direction: number) => setSelected(ids => {
    const next = [...ids];
    [next[index], next[index + direction]] = [next[index + direction], next[index]];
    return next;
  });
  return <section className="order-editor" aria-label="Chỉ định thủ tục">
    <div className="section-heading"><h3>Chỉ định thủ tục</h3><span className="muted small">Đã chọn {selected.length}</span></div>
    <ViewSwitch className="orders-mobile-switch" label="Danh sách thủ tục" value={mobileView} onChange={setMobileView} options={[{ value: 'catalog', label: 'Danh mục' }, { value: 'selected', label: 'Đã chọn', count: selected.length }]} />
    <div className="order-columns" data-order-view={mobileView}>
      <div className="order-catalog">
        <label className="sr-only" htmlFor="service-search">Tìm thủ tục</label>
        <input id="service-search" type="search" placeholder="Tìm thủ tục…" value={query} onChange={e => setQuery(e.target.value)} />
        <div className="catalog-results staff-scroll" tabIndex={0} aria-label="Danh mục thủ tục">{matches.length ? matches.map(s => <label className={`catalog-row ${selected.includes(s.id) ? 'is-selected' : ''}`} key={s.id}>
          <input type="checkbox" checked={selected.includes(s.id)} onChange={() => toggle(s.id)} disabled={disabled} />
          <span><strong>{s.name}</strong><small>{s.department} · {snapshot.graph.locations.find(l => l.id === s.locationId)?.roomNumber}</small></span>
        </label>) : <StaffEmpty title="Không tìm thấy thủ tục" detail="Thử tên khác hoặc từ khóa không dấu." icon="lab" />}</div>
      </div>
      <div className="order-preview"><h4>Đã chọn <span className="count-badge">{selected.length}</span></h4>
        {selected.length ? <ol className="staff-scroll" tabIndex={0} aria-label="Thứ tự chỉ định">{selected.map((id, index) => {
          const name = snapshot.serviceCatalog.find(s => s.id === id)!.name;
          return <li key={id}><span>{name}</span><div>
            <button className="icon-button" aria-label={`Đưa ${name} lên trước`} disabled={disabled || index === 0} onClick={() => move(index, -1)}>↑</button>
            <button className="icon-button" aria-label={`Đưa ${name} xuống sau`} disabled={disabled || index === selected.length - 1} onClick={() => move(index, 1)}>↓</button>
            <button className="icon-button" aria-label={`Bỏ ${name}`} disabled={disabled} onClick={() => toggle(id)}><Icon name="close" size={15} /></button>
          </div></li>;
        })}</ol> : <StaffEmpty title="Chưa có chỉ định" detail="Chọn từ danh mục bên cạnh." icon="file" />}
      </div>
    </div>
    <div className="order-footer">
      <button className="text-button" disabled={disabled || !!selected.length} onClick={() => api.command('COMPLETE_ENCOUNTER', visit.visitId, 'doctor')}>Hoàn tất khám, không cần thủ tục</button>
      <button className="primary" disabled={disabled || !selected.length} onClick={() => api.command('ASSIGN_SERVICES', visit.visitId, 'doctor', { serviceIds: selected })}>Chốt {selected.length || ''} chỉ định <Icon name="arrow" size={17} /></button>
    </div>
  </section>;
}

export function Doctor({ snapshot, api }: { snapshot: Snapshot; api: SimulationApi }) {
  const initial = new URLSearchParams(location.search).get('department');
  const [departmentId, setDepartmentId] = useState<DepartmentId>(snapshot.departmentCatalog.find(d => d.id === initial)?.id || 'DEMO-INTERNAL');
  const [mobileView, setMobileView] = useState<'encounter' | 'queues'>('encounter');
  const [queueView, setQueueView] = useState<'initial' | 'review' | 'results'>('initial');
  const department = snapshot.departmentCatalog.find(d => d.id === departmentId)!;
  const room = snapshot.graph.locations.find(l => l.id === department.locationId)!;
  useEffect(() => { const url = new URL(location.href); url.searchParams.set('department', departmentId); history.replaceState(null, '', url); }, [departmentId]);
  const encounter = snapshot.activeEncounters[departmentId];
  const active = snapshot.visits.find(v => v.visitId === encounter?.visitId);
  const disabled = api.pending || !api.connected;
  const inDepartment = (v: Visit) => departmentForVisit(v)?.id === departmentId;
  const waiting = snapshot.queues.initial.map(id => snapshot.visits.find(v => v.visitId === id)!).filter(inDepartment);
  const returning = snapshot.queues.review.map(id => snapshot.visits.find(v => v.visitId === id)!).filter(inDepartment);
  const tracked = snapshot.visits.filter(v => inDepartment(v) && v.services.length > 0);
  const queue = (patients: Visit[], review: boolean) => <section className="queue-column staff-scroll" hidden={queueView !== (review ? 'review' : 'initial')} tabIndex={0} aria-label={review ? 'Người bệnh quay lại' : 'Người bệnh chờ khám'}>
    {patients.length ? patients.map(v => <article className="queue-person" key={v.visitId}>
      <PersonIdentity visit={v} />
      <div className="queue-detail"><span className="muted small">{review ? `${v.services.length}/${v.services.length} thủ tục · ${v.locationId === room.id ? 'Đã quay lại phòng' : 'Đang quay lại phòng'}` : `Số ${v.queueNumber ?? '—'} · ${v.locationId === room.id ? 'Đã đến phòng' : 'Đang đến phòng'}`}</span>
        {!review && <button className="secondary" aria-label="Gọi vào khám ban đầu" disabled={disabled || !!encounter} onClick={async () => { if (await api.command('CALL_INITIAL', v.visitId, 'doctor')) setMobileView('encounter'); }}>Gọi khám <Icon name="arrow" size={15} /></button>}
      </div>
    </article>) : <StaffEmpty title={review ? 'Chưa có người quay lại' : 'Chưa có người chờ khám'} detail={review ? 'Tự cập nhật khi hoàn tất thủ tục.' : 'Danh sách cập nhật sau tiếp nhận.'} />}
  </section>;
  return <DashboardFrame snapshot={snapshot} api={api} department={department} toolbar={<label className="staff-room-select">Khoa làm việc<select value={departmentId} onChange={e => setDepartmentId(e.target.value as DepartmentId)}>{snapshot.departmentCatalog.map(d => <option value={d.id} key={d.id}>{d.name}</option>)}</select></label>}>
    <ViewSwitch className="staff-mobile-switch" label="Không gian bác sĩ" value={mobileView} onChange={setMobileView} options={[{ value: 'encounter', label: 'Đang khám' }, { value: 'queues', label: 'Danh sách', count: waiting.length + returning.length }]} />
    <div className="staff-workspace clinician-layout" data-mobile-view={mobileView}>
      <section className="encounter-card staff-panel" data-pane="encounter">
        <div className="staff-panel-heading"><h2>Lượt đang khám</h2><span className={`badge ${active ? 'success' : 'neutral'}`}>{active ? encounter?.status === 'CALLED' ? 'Đã gọi' : 'Đang khám' : 'Chưa có lượt'}</span></div>
        {active && encounter ? <>
          <div className="active-identity"><PersonIdentity visit={active} /><span className="ticket-label">Số khám <strong>{active.queueNumber ?? '—'}</strong></span></div>
          {encounter.status === 'CALLED' ? <div className="encounter-actions"><StaffEmpty title="Đã mời người bệnh vào phòng" icon="doctor" /><button className="primary" disabled={disabled} onClick={() => api.command('BEGIN_ENCOUNTER', active.visitId, 'doctor')}>Bắt đầu trao đổi <Icon name="arrow" size={17} /></button></div> : <Orders key={snapshot.runId + active.visitId + active.journeyVersion} snapshot={snapshot} api={api} visit={active} />}
        </> : <div className="empty-encounter"><StaffEmpty title="Sẵn sàng khám" detail="Gọi người bệnh từ danh sách chờ khám." icon="doctor" /><button className="secondary staff-mobile-switch" onClick={() => { setQueueView('initial'); setMobileView('queues'); }}>Mở danh sách chờ</button></div>}
      </section>
      <aside className="staff-panel doctor-roster" data-pane="queues">
        <div className="staff-panel-heading"><h2>Người bệnh</h2><span className="muted small">{department.shortName}</span></div>
        <ViewSwitch label="Danh sách bác sĩ" value={queueView} onChange={setQueueView} options={[{ value: 'initial', label: 'Chờ khám', count: waiting.length }, { value: 'review', label: 'Quay lại', count: returning.length }, { value: 'results', label: 'Kết quả', count: tracked.length }]} />
        {queue(waiting, false)}{queue(returning, true)}
        <section className="background-updates staff-scroll" hidden={queueView !== 'results'} tabIndex={0} aria-label="Kết quả đang theo dõi">
          {tracked.length ? tracked.map(v => <article className="tracked-patient" key={v.visitId}><PersonIdentity visit={v} /><div className="result-progress"><span>{v.services.filter(s => s.resultStatus === 'AVAILABLE').length}/{v.services.length} kết quả</span><span className="muted small">{v.phase === 'READY' ? 'Quay lại phòng khám' : v.phase === 'COMPLETED' ? 'Đã hoàn tất' : 'Đang làm thủ tục'}</span></div></article>) : <StaffEmpty title="Chưa có kết quả theo dõi" detail="Kết quả cập nhật sau khi có chỉ định." icon="file" />}
        </section>
        <div className="staff-panel-footnote">Mỗi phòng khám tiếp nhận một người bệnh.</div>
      </aside>
    </div>
  </DashboardFrame>;
}

export function Procedure({ snapshot, api }: { snapshot: Snapshot; api: SimulationApi }) {
  const initial = new URLSearchParams(location.search).get('service');
  const [serviceId, setServiceId] = useState<ServiceId>(snapshot.serviceCatalog.find(s => s.id === initial)?.id || snapshot.serviceCatalog[0].id);
  const [query, setQuery] = useState('');
  const [mobileView, setMobileView] = useState<'queue' | 'results'>('queue');
  const [showHelp, setShowHelp] = useState(false);
  useEffect(() => { const url = new URL(location.href); url.searchParams.set('service', serviceId); history.replaceState(null, '', url); setQuery(''); }, [serviceId]);
  const definition = snapshot.serviceCatalog.find(s => s.id === serviceId)!;
  const room = snapshot.graph.locations.find(l => l.id === definition.locationId)!;
  const matches = (v: Visit) => normalize(`${v.displayName} ${v.visitId}`).includes(normalize(query.trim()));
  const assigned = snapshot.visits.filter(v => snapshot.procedureQueues[serviceId].includes(v.visitId));
  const visible = assigned.filter(matches);
  const allCompleted = snapshot.visits.flatMap(v => v.services.filter(s => s.id === serviceId && s.executionStatus === 'COMPLETED').map(s => ({ v, s })));
  const completed = allCompleted.filter(({ v }) => matches(v));
  const atRoom = assigned.filter(v => !v.outsideHospital && (v.locationId === room.id || v.services.some(s => s.id === serviceId && s.executionStatus === 'IN_PROGRESS'))).length;
  const disabled = api.pending || !api.connected;
  const queueMethod = snapshot.procedureQueueMethods[serviceId] === 'TAKE_NUMBER' ? 'Gọi theo số lấy tại cửa phòng' : 'Gọi theo thứ tự giấy trong khay';
  return <DashboardFrame snapshot={snapshot} api={api} procedure subtitle={`Phòng ${room.roomNumber} · ${room.building} · Tầng ${room.floor}`} toolbar={<label className="staff-room-select">Phòng làm việc<select value={serviceId} onChange={e => setServiceId(e.target.value as ServiceId)}>{snapshot.serviceCatalog.map(s => <option value={s.id} key={s.id}>{s.name}</option>)}</select></label>}>
    <div className="procedure-tools">
      <div className="procedure-search"><label className="sr-only" htmlFor="patient-search">Tìm người bệnh trong phòng này</label><input id="patient-search" type="search" placeholder="Tìm tên hoặc mã người bệnh…" value={query} onChange={e => setQuery(e.target.value)} /></div>
      <div className="procedure-arrival-note"><Icon name="file" size={17} /><span>{queueMethod}</span><button className="icon-button" aria-label="Hướng dẫn tại phòng" onClick={() => setShowHelp(true)}><Icon name="help" size={18} /></button></div>
    </div>
    <ViewSwitch className="staff-mobile-switch" label="Không gian phòng thủ tục" value={mobileView} onChange={setMobileView} options={[{ value: 'queue', label: 'Thực hiện', count: assigned.length }, { value: 'results', label: 'Kết quả', count: allCompleted.length }]} />
    <div className="staff-workspace procedure-layout" data-mobile-view={mobileView}>
      <section className="procedure-queue staff-panel" data-pane="queue">
        <div className="staff-panel-heading"><h2>Chưa hoàn tất <span className="count-badge">{assigned.length}</span></h2><span className="presence-label"><i />{atRoom} tại phòng</span></div>
        <div className="procedure-table staff-scroll" tabIndex={0} aria-label="Danh sách được chỉ định">
          {visible.length ? visible.map(v => {
            const s = v.services.find(s => s.id === serviceId)!;
            const otherActive = v.services.some(x => x.id !== serviceId && x.executionStatus === 'IN_PROGRESS') || snapshot.visits.some(x => x.visitId !== v.visitId && x.services.some(y => y.id === serviceId && y.executionStatus === 'IN_PROGRESS'));
            return <article className={`assigned-row ${s.executionStatus === 'IN_PROGRESS' ? 'in-progress' : ''}`} key={v.visitId}>
              <div><PersonIdentity visit={v} /><span className={`procedure-presence ${s.executionStatus === 'IN_PROGRESS' ? 'is-active' : ''}`}>{s.executionStatus === 'IN_PROGRESS' ? 'Đang thực hiện' : v.locationId === room.id && !v.outsideHospital ? 'Đang chờ tại phòng' : 'Chưa đến phòng'}</span></div>
              <div className="procedure-row-actions">
                {s.executionStatus === 'NOT_STARTED' && v.locationId !== room.id && <button className="text-button" disabled={disabled || v.services.some(x => x.executionStatus === 'IN_PROGRESS')} onClick={() => api.command('CHECK_IN_SERVICE', v.visitId, 'procedure', { serviceId })}>Đã đến phòng</button>}
                {s.executionStatus === 'NOT_STARTED' && <button className="secondary" aria-label="Bắt đầu thực hiện" disabled={disabled || otherActive} onClick={() => api.command('START_SERVICE', v.visitId, 'procedure', { serviceId })}>Bắt đầu</button>}
                <button className={s.executionStatus === 'IN_PROGRESS' ? 'primary' : 'secondary'} aria-label="Đã hoàn thành" disabled={disabled || otherActive} title={otherActive ? 'Cần hoàn tất thủ tục đang thực hiện trước.' : undefined} onClick={() => api.command('COMPLETE_SERVICE', v.visitId, 'procedure', { serviceId })}><Icon name="check" size={16} />Hoàn thành</button>
              </div>
            </article>;
          }) : <StaffEmpty title={query ? 'Không tìm thấy người bệnh' : 'Chưa có chỉ định'} detail={query ? 'Thử tên không dấu hoặc mã người bệnh.' : 'Danh sách cập nhật khi bác sĩ chốt chỉ định.'} icon="lab" />}
        </div>
        <div className="staff-panel-footnote">Danh sách chỉ định · Thứ tự gọi theo giấy / số tại phòng.</div>
      </section>
      <section className="procedure-results staff-panel" data-pane="results">
        <div className="staff-panel-heading"><h2>Kết quả <span className="count-badge">{allCompleted.length}</span></h2><span className="muted small">Đã thực hiện</span></div>
        <div className="staff-scroll" tabIndex={0} aria-label="Kết quả đã thực hiện">{completed.length ? completed.map(({ v, s }) => <article className="completed-row" key={v.visitId}>
          <PersonIdentity visit={v} /><span className={`badge ${s.resultStatus === 'AVAILABLE' ? 'success' : 'neutral'}`}>{s.resultStatus === 'AVAILABLE' ? 'Đã có kết quả' : 'Chờ kết quả'}</span>
          {s.resultStatus !== 'AVAILABLE' && <button className="secondary" disabled={disabled} onClick={() => api.command('CONFIRM_RESULT', v.visitId, 'procedure', { serviceId })}>Công bố kết quả <Icon name="arrow" size={15} /></button>}
          {snapshot.mode === 'COLLECT_PAPER' && s.resultStatus === 'AVAILABLE' && (s.paperStatus !== 'COLLECTED' ? <button className="secondary" disabled={disabled} onClick={() => api.command('COLLECT_PAPER', v.visitId, 'procedure', { serviceId })}>Xác nhận giao bản giấy</button> : <span className="muted small">Đã giao bản giấy</span>)}
        </article>) : <StaffEmpty title={query ? 'Không có kết quả phù hợp' : 'Chưa có thủ tục hoàn tất'} detail="Kết quả được công bố tại đây." icon="file" />}</div>
      </section>
    </div>
    {showHelp && <Dialog label="Hướng dẫn tại phòng" onDismiss={() => setShowHelp(false)}><section className="modal"><button className="icon-button modal-close" aria-label="Đóng hướng dẫn" onClick={() => setShowHelp(false)}><Icon name="close" size={20} /></button><h2>Tiếp nhận tại phòng</h2><p>{procedureArrivalInstruction(snapshot, serviceId)}</p><p>Danh sách hiển thị mọi chỉ định, không phải thứ tự gọi. Tìm đúng người theo giấy hoặc số; có thể ghi nhận đến phòng cho người dùng giấy.</p></section></Dialog>}
  </DashboardFrame>;
}
