import { useState, useEffect, useRef } from "react";
import SignupVault from "./pages/SignupVault";
import UnlockVault from "./pages/UnlockVault";
import Vault from "./pages/Vault";

import { VAULT_STATE } from "./vault/vaultState";
import { deriveKey } from "./crypto/deriveKey";
import { encryptData } from "./crypto/encrypt";
import { decryptData } from "./crypto/decrypt";
import { EMPTY_VAULT } from "./vault/vaultHeader";

/* ---------------- CONFIG ---------------- */

const BACKOFF_DELAYS = [
  15 * 1000,
  30 * 1000,
  60 * 1000,
  2 * 60 * 1000,
  5 * 60 * 1000,
];

const SESSION_DURATION = 3 * 60 * 1000; // 3 min

export default function App() {
  const [vaultState, setVaultState] = useState(VAULT_STATE.LOADING);
  const [vaultData, setVaultData] = useState(null);
  const [sessionKey, setSessionKey] = useState(null);
  const [vaultSalt, setVaultSalt] = useState(null);

  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);

  const [sessionExpiresAt, setSessionExpiresAt] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const sessionIntervalRef = useRef(null);

  /* ---------------- INIT SECURITY ---------------- */

  useEffect(() => {
    const fails = Number(localStorage.getItem("cc_failures") || 0);
    const lock = Number(localStorage.getItem("cc_locked_until") || 0);
    const now = Date.now();

    if (lock > now) {
      setFailedAttempts(fails);
      setLockedUntil(lock);
    } else {
      localStorage.removeItem("cc_failures");
      localStorage.removeItem("cc_locked_until");
    }
  }, []);

  /* ---------------- SESSION TIMER (SINGLE SOURCE) ---------------- */

  function startSessionTimer() {
    const expires = Date.now() + SESSION_DURATION;
    setSessionExpiresAt(expires);
    setRemainingSeconds(Math.ceil(SESSION_DURATION / 1000));
  }

  function clearSessionTimer() {
    if (sessionIntervalRef.current) {
      clearInterval(sessionIntervalRef.current);
      sessionIntervalRef.current = null;
    }
    setSessionExpiresAt(null);
    setRemainingSeconds(0);
  }

  useEffect(() => {
    if (!sessionExpiresAt) return;

    // clear old interval (safety)
    if (sessionIntervalRef.current) {
      clearInterval(sessionIntervalRef.current);
    }

    sessionIntervalRef.current = setInterval(() => {
      const diff = sessionExpiresAt - Date.now();

      if (diff <= 0) {
        clearSessionTimer();
        lockVault();
      } else {
        setRemainingSeconds(Math.ceil(diff / 1000));
      }
    }, 1000);

    return () => {
      if (sessionIntervalRef.current) {
        clearInterval(sessionIntervalRef.current);
        sessionIntervalRef.current = null;
      }
    };
  }, [sessionExpiresAt]);

  /* ---------------- RESET SESSION ON ACTIVITY ---------------- */

  function handleUserActivity() {
    if (vaultState !== VAULT_STATE.UNLOCKED) return;
    startSessionTimer();
  }

  /* ---------------- LOCK ---------------- */

  function lockVault() {
    clearSessionTimer();
    setVaultData(null);
    setSessionKey(null);
    setVaultSalt(null);
    setVaultState(VAULT_STATE.LOCKED);
  }

  /* ---------------- CHECK VAULT ---------------- */

  useEffect(() => {
    fetch("http://localhost:4000/api/vault")
      .then((r) => r.json())
      .then((d) =>
        setVaultState(
          d.exists ? VAULT_STATE.LOCKED : VAULT_STATE.UNINITIALIZED
        )
      )
      .catch(() => setVaultState(VAULT_STATE.UNINITIALIZED));
  }, []);

  /* ---------------- SIGNUP ---------------- */

  async function handleSignup({ masterPassword }) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const key = await deriveKey(masterPassword, salt);
    const encryptedVault = await encryptData(key, EMPTY_VAULT);

    await fetch("http://localhost:4000/api/vault", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ encryptedVault, salt: Array.from(salt) }),
    });

    setVaultState(VAULT_STATE.LOCKED);
  }

  /* ---------------- UNLOCK ---------------- */

  async function handleUnlock(masterPassword) {
    const now = Date.now();

    if (lockedUntil && now < lockedUntil) return;

    try {
      const res = await fetch("http://localhost:4000/api/vault");
      const data = await res.json();

      const salt = new Uint8Array(data.vault.salt);
      const key = await deriveKey(masterPassword, salt);
      const decrypted = await decryptData(key, data.vault.encryptedVault);

      setVaultData({
        version: decrypted.version ?? 1,
        createdAt: decrypted.createdAt ?? now,
        items: decrypted.items ?? [],
      });

      setSessionKey(key);
      setVaultSalt(salt);
      setVaultState(VAULT_STATE.UNLOCKED);

      // ✅ reset security
      setFailedAttempts(0);
      setLockedUntil(0);
      localStorage.removeItem("cc_failures");
      localStorage.removeItem("cc_locked_until");

      // ✅ START TIMER ONCE (IMPORTANT)
      startSessionTimer();
    } catch {
      const nextFails = failedAttempts + 1;
      const delay =
        BACKOFF_DELAYS[Math.min(nextFails - 1, BACKOFF_DELAYS.length - 1)];
      const until = now + delay;

      setFailedAttempts(nextFails);
      setLockedUntil(until);

      localStorage.setItem("cc_failures", nextFails);
      localStorage.setItem("cc_locked_until", until);
    }
  }

  /* ---------------- SAVE ---------------- */

  async function saveVault(updatedVault) {
    const encryptedVault = await encryptData(sessionKey, updatedVault);

    await fetch("http://localhost:4000/api/vault", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        encryptedVault,
        salt: Array.from(vaultSalt),
      }),
    });

    setVaultData(updatedVault);
    startSessionTimer(); // activity = reset
  }

  /* ---------------- UI ---------------- */

  if (vaultState === VAULT_STATE.LOADING)
    return <p style={{ padding: 24 }}>Loading CipherCell…</p>;

  if (vaultState === VAULT_STATE.UNINITIALIZED)
    return <SignupVault onSignup={handleSignup} />;

  if (vaultState === VAULT_STATE.LOCKED)
    return (
      <UnlockVault
        onUnlock={handleUnlock}
        lockedUntil={lockedUntil}
        failedAttempts={failedAttempts}
      />
    );

  const mins = Math.floor(remainingSeconds / 60);
  const secs = String(remainingSeconds % 60).padStart(2, "0");

  return (
    <div onClick={handleUserActivity} onKeyDown={handleUserActivity}>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 64,
          padding: "0 28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backdropFilter: "blur(34px)",
          background:
            "linear-gradient(180deg, rgba(155,124,255,0.18), rgba(155,124,255,0.05))",
          borderBottom: "1px solid rgba(200,170,255,0.25)",
          zIndex: 50,
        }}
      >
        <strong>
          🔐 CipherCell{" "}
          <span style={{ fontSize: 12, opacity: 0.7 }}>
            Auto-lock in {mins}:{secs}
          </span>
        </strong>
        <button onClick={lockVault}>Logout</button>
      </header>

      <main style={{ padding: 24, paddingTop: 88 }}>
        <Vault
          vault={vaultData}
          onAdd={(item) =>
            saveVault({ ...vaultData, items: [...vaultData.items, item] })
          }
          onUpdate={(item) =>
            saveVault({
              ...vaultData,
              items: vaultData.items.map((i) =>
                i.id === item.id ? item : i
              ),
            })
          }
          onDelete={(id) =>
            saveVault({
              ...vaultData,
              items: vaultData.items.filter((i) => i.id !== id),
            })
          }
        />
      </main>
    </div>
  );
}
