import { useState } from "react";

export default function InitVault({ onInit }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    if (password.length < 12) {
      setError("Use at least 12 characters. Longer = safer.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords don’t match.");
      return;
    }

    setError("");
    onInit(password);
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.glassCard}>
        <h2 style={styles.title}>Your Vault</h2>
        <p style={styles.subtitle}>
          Encrypted locally.  
          No recovery. No second chances.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            style={styles.input}
            type="password"
            placeholder="Master password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            style={styles.input}
            type="password"
            placeholder="Confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />

          {error && <p style={styles.error}>{error}</p>}

          <button style={styles.button} type="submit">
            Initialize Vault
          </button>
        </form>

        <p style={styles.footnote}>
          Zero-knowledge • Client-side encryption • Private by design
        </p>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    position: "fixed",
    inset: 0,              // top:0 right:0 bottom:0 left:0
    display: "grid",
    placeItems: "center",  // TRUE center (best method)
    padding: 16,
    },

  glassCard: {
    width: "100%",
    maxWidth: 420,
    maxHeight: "100%",
    padding: 24,
    borderRadius: 20,
    background: "var(--glass-bg)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid var(--glass-border)",
    boxShadow: "0 30px 60px rgba(0,0,0,0.5)",
    },

  title: {
    fontSize: 26,
    fontWeight: 600,
    letterSpacing: -0.4,
  },
  subtitle: {
    marginBottom: 20,
    fontSize: 14,
    color: "var(--muted)",
    lineHeight: 1.6,
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    marginBottom: 14,
    borderRadius: 14,
    border: "1px solid var(--glass-border)",
    background: "rgba(255,255,255,0.06)",
    color: "var(--text)",
    outline: "none",
    fontSize: 16, // 👈 prevents iOS zoom
    },

  button: {
    width: "100%",
    padding: 14,
    marginTop: 8,
    borderRadius: 14,
    border: "none",
    background:
      "linear-gradient(180deg, #6fa3ff 0%, #4f7dff 100%)",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
  },
  error: {
    color: "var(--danger)",
    fontSize: 13,
    marginBottom: 8,
  },
  footnote: {
    marginTop: 22,
    fontSize: 12,
    color: "var(--muted)",
    textAlign: "center",
  },
};
