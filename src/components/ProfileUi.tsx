import type { ReactNode } from "react";
import Icon from "./Icon";

export function Avatar({ name, small = false }: { name: string; small?: boolean }) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0] ?? "").join("").toUpperCase();
  return <span className={`avatar ${small ? "avatar-small" : ""}`}>{initials}</span>;
}

export function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{action}</div>;
}

export function CompletionItem({ complete, label, onClick }: { complete: boolean; label: string; onClick: () => void }) {
  return <button className="completion-item" onClick={onClick}><span className={`completion-check ${complete ? "complete" : ""}`}>{complete && <Icon name="check" size={12} />}</span><span>{label}</span><Icon name="chevron" size={14} /></button>;
}

export function DetailItem({ label, value }: { label: string; value: string }) {
  return <div className="detail-item"><span className="eyebrow">{label}</span><p>{value}</p></div>;
}

export function EmptyState({ title, description, action, onClick }: { title: string; description: string; action?: string; onClick?: () => void }) {
  return <div className="empty-state"><span className="empty-icon"><Icon name="sparkles" size={20} /></span><h3>{title}</h3><p>{description}</p>{action && onClick && <button className="button button-outline" onClick={onClick}><Icon name="plus" size={15} /> {action}</button>}</div>;
}
