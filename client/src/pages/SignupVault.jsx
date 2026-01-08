import { useState } from "react";

export default function SignupVault({ onSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
  e.preventDefault();

  if (!email.includes("@")) {
    setError("Valid email required for security alerts.");
    return;
  }

  if (password.length < 12) {
    setError("Master password must be at least 12 characters.");
    return;
  }

  if (password !== confirm) {
    setError("Passwords do not match.");
    return;
  }

  setError("");

  // 🔥 BACKEND POST (THIS WAS MISSING)
  await fetch("http://localhost:4000/api/vault", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      encryptedVault: { dummy: true }, // TEMP
      salt: [1, 2, 3], // TEMP
    }),
  });

  // frontend state update
  onSignup({
    email,
    masterPassword: password,
  });
}


  return (
    <div style={styles.wrapper}>
      <div style={styles.glassCard}>
        <h2 style={styles.title}>Set Up Your Vault</h2>
        <p style={styles.subtitle}>
          Your email is used only for alerts.<br />
          Your master password is never stored.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            style={styles.input}
            type="email"
            placeholder="Email for alerts"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

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
            placeholder="Confirm master password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />

          {error && <p style={styles.error}>{error}</p>}

          <button style={styles.button} type="submit">
            Create Vault
          </button>
        </form>

        <p style={styles.footnote}>
          Zero-knowledge • No recovery • Client-side encryption
        </p>
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
    cursor: "pointer",
  },
  error: {
    color: "var(--danger)",
    fontSize: 13,
    marginBottom: 8,
  },
  footnote: {
    marginTop: 18,
    fontSize: 12,
    color: "var(--muted)",
    textAlign: "center",
  },
};
