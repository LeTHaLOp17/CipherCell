import { useState, useMemo } from "react";

export default function Vault({ vault, onAdd, onUpdate, onDelete }) {
  const [newItem, setNewItem] = useState({
    title: "",
    username: "",
    password: "",
    notes: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [editItem, setEditItem] = useState({});
  const [visibleMap, setVisibleMap] = useState({});
  const [copiedId, setCopiedId] = useState(null);
  const [search, setSearch] = useState("");

  /* ---------------- ADD ---------------- */

  function handleAdd(e) {
    e.preventDefault();
    if (!newItem.title || !newItem.password) return;

    onAdd({
      id: crypto.randomUUID(),
      ...newItem,
    });

    setNewItem({ title: "", username: "", password: "", notes: "" });
  }

  /* ---------------- EDIT ---------------- */

  function startEdit(item) {
    setEditingId(item.id);
    setEditItem({ ...item });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditItem({});
  }

  function saveEdit() {
    onUpdate(editItem);
    cancelEdit();
  }

  /* ---------------- UTILS ---------------- */

  function togglePassword(id) {
    setVisibleMap((p) => ({ ...p, [id]: !p[id] }));
  }

  async function copyPassword(item) {
    await navigator.clipboard.writeText(item.password);
    setCopiedId(item.id);

    setTimeout(() => {
      navigator.clipboard.writeText("");
      setCopiedId(null);
    }, 15000);
  }

  /* ---------------- SEARCH ---------------- */

  const filteredItems = useMemo(() => {
    const q = search.toLowerCase();
    return (vault.items || []).filter((item) =>
      [item.title, item.username, item.notes]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [search, vault.items]);

  /* ---------------- UI ---------------- */

  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      <h2>🔑 Saved Passwords</h2>

      {/* SEARCH */}
      <input
        placeholder="🔍 Search (bank, email, IFSC, hint...)"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: "100%", marginBottom: 16 }}
      />

      {/* ADD FORM */}
      <form onSubmit={handleAdd}>
        <input
          placeholder="Title (Bank / Gmail / Instagram)"
          value={newItem.title}
          onChange={(e) =>
            setNewItem({ ...newItem, title: e.target.value })
          }
        />

        <input
          placeholder="Username / ID"
          value={newItem.username}
          onChange={(e) =>
            setNewItem({ ...newItem, username: e.target.value })
          }
        />

        <input
          placeholder="Password"
          value={newItem.password}
          onChange={(e) =>
            setNewItem({ ...newItem, password: e.target.value })
          }
        />

        <textarea
          placeholder="Notes (account no, IFSC, security Q, hints)"
          rows={2}
          value={newItem.notes}
          onChange={(e) =>
            setNewItem({ ...newItem, notes: e.target.value })
          }
        />

        <button type="submit">➕ Add Entry</button>
      </form>

      <hr />

      {/* LIST */}
      {filteredItems.length === 0 && (
        <p style={{ opacity: 0.6 }}>No entries found</p>
      )}

      {filteredItems.map((item) => {
        const isEditing = editingId === item.id;
        const isVisible = visibleMap[item.id];

        return (
          <div
            key={item.id}
            style={{
              marginBottom: 16,
              padding: 14,
              border: "1px solid #333",
              borderRadius: 12,
              lineHeight: 1.6,
            }}
          >
            {/* TITLE */}
            <div>
              <strong>Title:</strong>{" "}
              {isEditing ? (
                <input
                  value={editItem.title}
                  onChange={(e) =>
                    setEditItem({ ...editItem, title: e.target.value })
                  }
                />
              ) : (
                item.title
              )}
            </div>

            {/* USERNAME */}
            <div>
              <strong>Username / ID:</strong>{" "}
              {isEditing ? (
                <input
                  value={editItem.username || ""}
                  onChange={(e) =>
                    setEditItem({
                      ...editItem,
                      username: e.target.value,
                    })
                  }
                />
              ) : (
                item.username || "—"
              )}
            </div>

            {/* PASSWORD */}
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <strong>Password:</strong>

              {isEditing ? (
                <input
                  value={editItem.password}
                  onChange={(e) =>
                    setEditItem({
                      ...editItem,
                      password: e.target.value,
                    })
                  }
                />
              ) : (
                <code>
                  {isVisible ? item.password : "••••••••"}
                </code>
              )}

              {!isEditing && (
                <>
                  <button onClick={() => togglePassword(item.id)}>
                    {isVisible ? "🙈" : "👁"}
                  </button>
                  <button onClick={() => copyPassword(item)}>
                    {copiedId === item.id ? "✅" : "📋"}
                  </button>
                </>
              )}
            </div>

            {/* NOTES */}
            <div>
              <strong>Notes:</strong>
              {isEditing ? (
                <textarea
                  rows={2}
                  value={editItem.notes || ""}
                  onChange={(e) =>
                    setEditItem({
                      ...editItem,
                      notes: e.target.value,
                    })
                  }
                />
              ) : (
                <pre style={{ whiteSpace: "pre-wrap", marginTop: 4 }}>
                  {item.notes || "—"}
                </pre>
              )}
            </div>

            {/* ACTIONS */}
            <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
              {isEditing ? (
                <>
                  <button onClick={saveEdit}>💾 Save</button>
                  <button onClick={cancelEdit}>✖ Cancel</button>
                </>
              ) : (
                <>
                  <button onClick={() => startEdit(item)}>
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Delete this entry?")) {
                        onDelete(item.id);
                      }
                    }}
                  >
                    🗑️ Delete
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
