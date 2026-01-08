import { useState } from "react";

export default function UnlockVault({ onUnlock }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    if (!password) {
      setError("Enter your master password");
      return;
    }

    setError("");
    onUnlock(password); // password used later for crypto
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.glassCard}>
        <h2 style={styles.title}>Unlock Vault</h2>
        <p style={styles.subtitle}>
          Enter your master password to continue.
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

          {error && <p style={styles.error}>{error}</p>}

          <button style={styles.button} type="submit">
            Unlock
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    position: "fixed",
    inset: 0,
    display: "grid",
    placeItems: "center",
    padding: 16,
  },
  glassCard: {
    width: "100%",
    maxWidth: 420,
    padding: 24,
    borderRadius: 20,
    background: "var(--glass-bg)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid var(--glass-border)",
  },
  title: {
    margin: 0,
    fontSize: 24,
    fontWeight: 600,
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 20,
    fontSize: 14,
    color: "var(--muted)",
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    marginBottom: 14,
    borderRadius: 14,
    border: "1px solid var(--glass-border)",
    background: "rgba(255,255,255,0.06)",
    color: "var(--text)",
    fontSize: 16,
  },
  button: {
    width: "100%",
    padding: 14,
    borderRadius: 14,
    border: "none",
    background:
      "linear-gradient(180deg, #6fa3ff 0%, #4f7dff 100%)",
    color: "#fff",
    fontWeight: 600,
  },
  error: {
    color: "var(--danger)",
    fontSize: 13,
    marginBottom: 8,
  },
};
