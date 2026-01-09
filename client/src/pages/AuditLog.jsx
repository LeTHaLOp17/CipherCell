export default function AuditLog({ audit = [] }) {
  return (
    <div className="glass" style={{ padding: 20, marginTop: 24 }}>
      <h3>Security Activity</h3>
      {audit.length === 0 && (
        <p style={{ opacity: 0.6 }}>No activity yet</p>
      )}
      {audit.map((a, i) => (
        <div key={i} style={{ fontSize: 13, marginTop: 6 }}>
          • {a.type.replace("_", " ")} —{" "}
          {new Date(a.time).toLocaleString()}
        </div>
      ))}
    </div>
  );
}
