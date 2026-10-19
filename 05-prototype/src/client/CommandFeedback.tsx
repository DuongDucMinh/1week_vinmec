import type { SimulationApi } from './api';
import { Icon } from './icons';

/** Keep command recovery controls inside the active modal's interactive surface. */
export function CommandFeedback({ api, inline = false, onRetrySuccess }: { api: SimulationApi; inline?: boolean; onRetrySuccess?: () => void }) {
  return <>{api.error && <div className={inline ? 'error-toast inline-feedback' : 'error-toast'} role="alert"><Icon name="help" /><div><strong>{api.uncertain ? 'Chưa rõ kết quả xác nhận' : 'Cần kiểm tra lại'}</strong><p>{api.error}</p>{api.uncertain && <button className="text-button" disabled={api.pending || !api.connected} onClick={async () => { if (await api.retry()) onRetrySuccess?.(); }}>Gửi lại cùng xác nhận</button>}</div>{!api.uncertain && <button className="icon-button" aria-label="Đóng thông báo lỗi" onClick={api.clearError}><Icon name="close" size={18} /></button>}</div>}{api.pending && <div className={inline ? 'pending-indicator inline-feedback' : 'pending-indicator'} role="status">Đang gửi xác nhận…</div>}</>;
}
