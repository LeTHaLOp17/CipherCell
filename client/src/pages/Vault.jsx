import { useState } from "react";

export default function Vault({ vault, onAdd, onUpdate, onDelete }) {
  const [title, setTitle] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [notes, setNotes] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [visibleMap, setVisibleMap] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  function resetForm() {
    setTitle("");
    setUsername("");
    setPassword("");
    setNotes("");
    setEditingId(null);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!title || !password) return;

    if (editingId) {
      onUpdate({
        id: editingId,
        title,
        username,
        password,
        notes,
      });
    } else {
      onAdd({
        id: crypto.randomUUID(),
        title,
        username,
        password,
        notes,
      });
    }

    resetForm();
  }

  function startEdit(item) {
    setEditingId(item.id);
    setTitle(item.title);
    setUsername(item.username || "");
    setPassword(item.password);
    setNotes(item.notes || "");
  }

  function togglePassword(id) {
    setVisibleMap((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  async function copyPassword(item) {
    await navigator.clipboard.writeText(item.password);
    setCopiedId(item.id);

    setTimeout(async () => {
      await navigator.clipboard.writeText("");
      setCopiedId(null);
    }, 15000);
  }

  return (
    <div style={{ padding: 24, maxWidth: 760 }}>
      <h2>🔑 Passwords</h2>

      {/* FORM */}
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Title (Bank / Gmail / Insta)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          placeholder="Username / ID"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <textarea
          placeholder="Notes (IFSC, account no, hints)"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <button type="submit">
          {editingId ? "Update Entry" : "Add Entry"}
        </button>

        {editingId && (
          <button type="button" onClick={resetForm}>
            Cancel
          </button>
        )}
      </form>

      <hr />

      {/* LIST */}
      {(vault.items || []).map((item) => {
        const isVisible = visibleMap[item.id];

        return (
          <div
            key={item.id}
            style={{
              marginBottom: 16,
              padding: 12,
              border: "1px solid #333",
              borderRadius: 10,
            }}
          >
            <strong>{item.title}</strong>
            {item.username && <div>ID: {item.username}</div>}

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span>
                Password:&nbsp;
                {isVisible ? (
                  <code>{item.password}</code>
                ) : (
                  <code>••••••••</code>
                )}
              </span>

              <button onClick={() => togglePassword(item.id)}>
                {isVisible ? "🙈 Hide" : "👁 Show"}
              </button>

              <button onClick={() => copyPassword(item)}>
                {copiedId === item.id ? "✅ Copied" : "📋 Copy"}
              </button>
            </div>

            {item.notes && (
              <pre style={{ whiteSpace: "pre-wrap", marginTop: 8 }}>
                {item.notes}
              </pre>
            )}

            <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
              <button onClick={() => startEdit(item)}>✏️ Edit</button>
              <button
                onClick={() => {
                  if (confirm("Delete this entry?")) {
                    onDelete(item.id);
                  }
                }}
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
