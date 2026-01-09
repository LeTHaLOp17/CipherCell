import { useState, useEffect } from "react";

export default function UnlockVault({
  onUnlock,
  lockedUntil = 0,
  failedAttempts = 0,
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // 🔐 single source of truth
  const [remaining, setRemaining] = useState(() =>
    lockedUntil > 0
      ? Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000))
      : 0
  );

  /* ---------------- COUNTDOWN (PURE & SAFE) ---------------- */

  useEffect(() => {
    if (!lockedUntil) return;

    const interval = setInterval(() => {
      const diff = lockedUntil - Date.now();

      setRemaining((prev) => {
        const next = diff > 0 ? Math.ceil(diff / 1000) : 0;
        return prev === next ? prev : next;
      });

      if (diff <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockedUntil]);

  /* ✅ derived state — NO Date.now() here */
  const isLocked = remaining > 0;

  function handleSubmit(e) {
    e.preventDefault();
    if (isLocked) return;

    if (!password) {
      setError("Master password is required");
      return;
    }

    setError("");
    onUnlock(password);
    setPassword("");
  }

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.brand}>CipherCell</div>

        <h1 style={styles.heading}>Unlock Vault</h1>

        <p style={styles.description}>
          Enter your master password to access your encrypted data.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Master password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLocked}
            style={{
              ...styles.input,
              opacity: isLocked ? 0.5 : 1,
            }}
          />

          {isLocked && (
            <p style={styles.lockText}>
              Too many failed attempts. Try again in{" "}
              <strong>{formatTime(remaining)}</strong>.
            </p>
          )}

          {!isLocked && failedAttempts > 0 && (
            <p style={styles.warningText}>
              {failedAttempts} unsuccessful attempt
              {failedAttempts > 1 ? "s" : ""}.
            </p>
          )}

          {error && <p style={styles.errorText}>{error}</p>}

          <button
            type="submit"
            disabled={isLocked}
            style={{
              ...styles.button,
              opacity: isLocked ? 0.5 : 1,
              cursor: isLocked ? "not-allowed" : "pointer",
            }}
          >
            Unlock
          </button>
        </form>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    padding: "32px 28px",
    borderRadius: 20,
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
    backdropFilter: "blur(32px)",
    border: "1px solid rgba(200,170,255,0.25)",
    boxShadow:
      "0 24px 60px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.08)",
  },
  brand: {
    fontSize: 13,
    letterSpacing: 1.2,
    fontWeight: 600,
    textTransform: "uppercase",
    color: "var(--muted)",
    marginBottom: 12,
  },
  heading: {
    margin: 0,
    fontSize: 26,
    fontWeight: 600,
  },
  description: {
    marginTop: 8,
    marginBottom: 28,
    fontSize: 14,
    color: "var(--muted)",
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 14,
    border: "1px solid rgba(200,170,255,0.3)",
    background: "rgba(255,255,255,0.06)",
    color: "var(--text)",
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    width: "100%",
    marginTop: 18,
    padding: 14,
    borderRadius: 14,
    border: "none",
    background:
      "linear-gradient(180deg, rgba(179,140,255,0.9), rgba(155,124,255,0.9))",
    color: "#120b1f",
    fontWeight: 600,
    fontSize: 15,
  },
  lockText: {
    fontSize: 13,
    color: "var(--muted)",
    marginTop: 8,
  },
  warningText: {
    fontSize: 13,
    color: "#ffb4b4",
    marginTop: 8,
  },
  errorText: {
    fontSize: 13,
    color: "var(--danger)",
    marginTop: 8,
  },
};
