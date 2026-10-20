import type { Snapshot } from '../shared/contracts';
import type { SimulationApi } from './api';
import { Dialog } from './Dialog';
import { Icon } from './icons';

const clock = (value: string) => new Date(value).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
const dateTime = (value: string) => new Date(value).toLocaleString('vi-VN');

export function ConnectionIndicator({ api, onClick }: { api: SimulationApi; onClick: () => void }) {
  const stamp = api.lastSyncedAt;
  const description = api.connected ? stamp ? `Đã đồng bộ ${clock(stamp)}` : 'Đã kết nối' : `Mất kết nối${stamp ? ` · Lần cuối ${clock(stamp)}` : ''}`;
  return <button className={`sync-status ${api.connected ? 'is-connected' : 'is-disconnected'}`} aria-label="Chi tiết kết nối" aria-description={description} title={description} onClick={onClick}>
    <Icon name={api.connected ? 'wifi' : 'wifi-off'} size={18} /><i aria-hidden="true" />
    <span className="sr-only">{api.connected ? stamp ? <>Đã đồng bộ <time dateTime={stamp}>{clock(stamp)}</time></> : 'Đã kết nối' : description}</span>
  </button>;
}

export function ConnectionStatus({ snapshot, api, reconnect, open, close }: { snapshot: Snapshot; api: SimulationApi; reconnect: () => void; open: boolean; close: () => void }) {
  const stamp = api.lastSyncedAt;
  return <>
    {!api.connected && <aside className="connection-banner" role="status"><div><strong>Chưa nhận được tiến độ mới</strong><p>Dùng giấy đã lưu hoặc nhờ nhân viên hướng dẫn. Các xác nhận đang tạm khóa.</p><button className="text-button" onClick={reconnect}>Kết nối lại</button></div></aside>}
    {open && <Dialog contained labelledBy="connection-title" onDismiss={close}><section className="modal connection-details">
      <button className="icon-button modal-close" aria-label="Đóng chi tiết kết nối" onClick={close}><Icon name="close" /></button>
      <h2 id="connection-title">Trạng thái kết nối</h2>
      <p>{api.connected ? 'Đang nhận cập nhật từ hệ thống.' : 'Mất kết nối. Tiến độ và kết quả mới có thể chưa được nhận.'}</p>
      <dl><div><dt>Đồng bộ thành công lần cuối</dt><dd>{stamp ? <time dateTime={stamp}>{dateTime(stamp)}</time> : 'Chưa ghi nhận'}</dd></div><div><dt>Dữ liệu hệ thống thay đổi gần nhất</dt><dd><time dateTime={snapshot.updatedAt}>{dateTime(snapshot.updatedAt)}</time></dd></div></dl>
      {!api.connected && <><p>Dùng giấy đã in/lưu từ trước hoặc nhờ nhân viên kiểm tra bước tiếp theo.</p><button className="primary" onClick={reconnect}>Kết nối lại</button></>}
    </section></Dialog>}
  </>;
}
