import { useState } from "react";

export default function Vault({ vault, onAdd }) {
  const [title, setTitle] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [notes, setNotes] = useState("");

  function handleAdd(e) {
    e.preventDefault();
    if (!title || !password) return;

    onAdd({
      id: crypto.randomUUID(),
      title,
      username,
      password,
      notes,
    });

    setTitle("");
    setUsername("");
    setPassword("");
    setNotes("");
  }

  return (
    <div style={{ padding: 24, maxWidth: 700 }}>
      <h2>🔑 Passwords</h2>

      <form onSubmit={handleAdd}>
        <input
          placeholder="Title (Gmail / Bank / Instagram)"
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
          placeholder="Notes / hints / bank details / IFSC / recovery info"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <button>Add Entry</button>
      </form>

      <hr />

      {(vault.items || []).map((item) => (
        <div
          key={item.id}
          style={{
            marginBottom: 16,
            padding: 12,
            border: "1px solid #333",
            borderRadius: 8,
          }}
        >
          <strong>{item.title}</strong>
          <div>ID: {item.username}</div>
          <div>Password: {item.password}</div>

          {item.notes && (
            <pre style={{ whiteSpace: "pre-wrap", marginTop: 8 }}>
              {item.notes}
            </pre>
          )}
        </div>
      ))}
    </div>
  );
}
