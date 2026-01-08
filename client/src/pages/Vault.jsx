import { useState, useMemo } from "react";

const CATEGORIES = ["Bank", "Social", "Work", "Other"];

export default function Vault({ vault, onAdd, onUpdate, onDelete }) {
  const [form, setForm] = useState({
    title: "",
    username: "",
    password: "",
    notes: "",
    category: "Other",
  });

  const [editingId, setEditingId] = useState(null);
  const [edit, setEdit] = useState({});
  const [visible, setVisible] = useState({});
  const [copiedId, setCopiedId] = useState(null);
  const [search, setSearch] = useState("");

  /* ---------- ADD ---------- */
  function submit(e) {
    e.preventDefault();
    if (!form.title || !form.password) return;

    onAdd({ id: crypto.randomUUID(), ...form });
    setForm({
      title: "",
      username: "",
      password: "",
      notes: "",
      category: "Other",
    });
  }

  /* ---------- FILTER ---------- */
  const items = useMemo(() => {
    const q = search.toLowerCase();
    return vault.items.filter((i) =>
      [i.title, i.username, i.notes, i.category]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [search, vault.items]);

  /* ---------- UTILS ---------- */
  function togglePassword(id) {
    setVisible((v) => ({ ...v, [id]: !v[id] }));
  }

  async function copyPassword(item) {
    await navigator.clipboard.writeText(item.password);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  return (
    <div className="vault-layout">
      {/* ---------- ADD ENTRY ---------- */}
      <div className="vault-sidebar glass">
        <h3 style={{ marginBottom: 16 }}>➕ Add Entry</h3>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            placeholder="Title (Gmail / Bank / Insta)"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <input
            placeholder="Username / ID"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />

          <input
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>

          <textarea
            rows={2}
            placeholder="Notes / IFSC / hints"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />

          <button type="submit">Add Entry</button>
        </form>
      </div>

      {/* ---------- LIST ---------- */}
      <div>
        <h2 style={{ marginBottom: 12 }}>🔐 Saved Passwords</h2>

        <input
          placeholder="🔍 Search anything"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginBottom: 20 }}
        />

        <div className="vault-list">
          {items.map((item) => {
            const isEdit = editingId === item.id;
            const isVisible = visible[item.id];

            return (
              <div key={item.id} className="vault-card">
                <div className="card-header">
                  {isEdit ? (
                    <input
                      value={edit.title}
                      onChange={(e) => setEdit({ ...edit, title: e.target.value })}
                    />
                  ) : (
                    <h3 style={{ margin: 0 }}>{item.title}</h3>
                  )}

                  <span className="chip">{item.category || "Other"}</span>
                </div>

                <p style={{ marginTop: 12 }}>
                  <b>ID:</b>{" "}
                  {isEdit ? (
                    <input
                      value={edit.username || ""}
                      onChange={(e) => setEdit({ ...edit, username: e.target.value })}
                    />
                  ) : (
                    item.username || "—"
                  )}
                </p>

                <div className="password-row">
                  <b>Password:</b>

                  {isEdit ? (
                    <input
                      value={edit.password}
                      onChange={(e) => setEdit({ ...edit, password: e.target.value })}
                    />
                  ) : (
                    <code className="password-text">
                      {isVisible ? item.password : "••••••••"}
                    </code>
                  )}

                  {!isEdit && (
                    <div className="password-actions">
                      <button onClick={() => togglePassword(item.id)}>
                        {isVisible ? "🙈" : "👁"}
                      </button>
                      <button onClick={() => copyPassword(item)}>
                        {copiedId === item.id ? "✅" : "📋"}
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: 12 }}>
                  <b>Notes:</b>
                  {isEdit ? (
                    <textarea
                      rows={2}
                      value={edit.notes || ""}
                      onChange={(e) => setEdit({ ...edit, notes: e.target.value })}
                    />
                  ) : (
                    <p style={{ opacity: 0.85, marginTop: 4 }}>
                      {item.notes || "—"}
                    </p>
                  )}
                </div>

                <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
                  {isEdit ? (
                    <>
                      <button
                        onClick={() => {
                          onUpdate(edit);
                          setEditingId(null);
                        }}
                      >
                        💾 Save
                      </button>
                      <button onClick={() => setEditingId(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingId(item.id);
                          setEdit(item);
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Delete this entry?")) {
                            onDelete(item.id);
                          }
                        }}
                      >
                        🗑 Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
