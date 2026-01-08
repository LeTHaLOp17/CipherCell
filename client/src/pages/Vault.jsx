import { useState } from "react";

export default function Vault({ vault, onAdd }) {
  const [title, setTitle] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [notes, setNotes] = useState("");

  // 👁️ track visible passwords (per item)
  const [visible, setVisible] = useState({});

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

  function toggleVisibility(id) {
    setVisible((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }

  return (
    <div style={{ padding: 24, maxWidth: 720 }}>
      <h2>🔑 Passwords</h2>

      {/* ADD FORM */}
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
          placeholder="Notes / bank details / IFSC / hints"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <button>Add Entry</button>
      </form>

      <hr />

      {/* LIST */}
      {(vault.items || []).map((item) => {
        const isVisible = visible[item.id];
        console.log("VAULT ITEMS:", vault.items);

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

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span>
                Password:{" "}
                {isVisible ? item.password : "••••••••"}
              </span>

              <button
                type="button"
                onClick={() => toggleVisibility(item.id)}
              >
                {isVisible ? "🙈 Hide" : "👁 Show"}
              </button>
            </div>

            {item.notes && (
              <pre style={{ whiteSpace: "pre-wrap", marginTop: 8 }}>
                {item.notes}
              </pre>
            )}
          </div>
          
        );
        
      })}
    </div>
  );
}
