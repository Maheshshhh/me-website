export default function LoadingScreen({ message, action, onAction }: { message: string; action?: string; onAction?: () => void }) {
  return (
    <main className="loading-screen">
      <div className="loading-card" role="status">
        {!action && <span className="loading-spinner" />}
        <p>{message}</p>
        {action && onAction && <button className="button button-primary" onClick={onAction}>{action}</button>}
      </div>
    </main>
  );
}
