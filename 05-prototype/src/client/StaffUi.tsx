import type { Visit } from '../shared/contracts';
import { Icon } from './icons';

export const normalize = (value: string) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');

export function PersonIdentity({ visit }: { visit: Visit }) {
  const initials = visit.displayName.split(' ').slice(-2).map(part => part[0]).join('');
  return <div className="person-heading"><span className={`person-avatar person-${visit.visitId.slice(-1)}`}>{initials}</span><div><strong>{visit.displayName}</strong><small>{visit.visitId.replace('DEMO-', '')} · {visit.age} tuổi</small></div></div>;
}

export function StaffEmpty({ title, detail, icon = 'user' }: { title: string; detail?: string; icon?: string }) {
  return <div className="staff-empty"><span className="staff-empty-icon"><Icon name={icon} size={24} /></span><strong>{title}</strong>{detail && <p>{detail}</p>}</div>;
}

/** View buttons keep primary actions within the workspace on smaller screens. */
export function ViewSwitch<T extends string>({ label, value, onChange, options, className = '' }: {
  label: string; value: T; onChange: (value: T) => void;
  options: { value: T; label: string; count?: number }[]; className?: string;
}) {
  return <div className={`staff-view-switch ${className}`} role="group" aria-label={label}>{options.map(option => <button key={option.value} type="button" aria-pressed={value === option.value} onClick={() => onChange(option.value)}>{option.label}{option.count !== undefined && <span className="count-badge">{option.count}</span>}</button>)}</div>;
}
