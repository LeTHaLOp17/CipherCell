import { useState, useEffect, useRef } from "react";
import SignupVault from "./pages/SignupVault";
import UnlockVault from "./pages/UnlockVault";
import Vault from "./pages/Vault";

import { VAULT_STATE } from "./vault/vaultState";
import { deriveKey } from "./crypto/deriveKey";
import { encryptData } from "./crypto/encrypt";
import { decryptData } from "./crypto/decrypt";
import { EMPTY_VAULT } from "./vault/vaultHeader";

/* ---------------- SECURITY CONFIG ---------------- */

const BACKOFF_DELAYS = [
  15 * 1000,
  30 * 1000,
  60 * 1000,
  2 * 60 * 1000,
  5 * 60 * 1000,
];

export default function App() {
  const [vaultState, setVaultState] = useState(VAULT_STATE.LOADING);
  const [vaultData, setVaultData] = useState(null);
  const [sessionKey, setSessionKey] = useState(null);
  const [vaultSalt, setVaultSalt] = useState(null);

  const [failedAttempts, setFailedAttempts] = useState(
    Number(localStorage.getItem("cc_failures") || 0)
  );
  const [lockedUntil, setLockedUntil] = useState(
    Number(localStorage.getItem("cc_locked_until") || 0)
  );

  const lockTimer = useRef(null);

  /* ---------------- AUTO LOCK (SESSION) ---------------- */

  function lockVault() {
    setVaultData(null);
    setSessionKey(null);
    setVaultSalt(null);
    setVaultState(VAULT_STATE.LOCKED);

    if (lockTimer.current) {
      clearTimeout(lockTimer.current);
      lockTimer.current = null;
    }
  }

  function resetAutoLock() {
    if (lockTimer.current) clearTimeout(lockTimer.current);
    lockTimer.current = setTimeout(lockVault, 3 * 60 * 1000);
  }

  /* ---------------- CLEANUP ---------------- */

  useEffect(() => {
    return () => {
      if (lockTimer.current) {
        clearTimeout(lockTimer.current);
      }
    };
  }, []);

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

    setVaultSalt(salt);
    setVaultState(VAULT_STATE.LOCKED);
  }

  /* ---------------- UNLOCK (iOS STYLE) ---------------- */

  async function handleUnlock(masterPassword) {
    const now = Date.now();

    if (lockedUntil && now < lockedUntil) {
      const seconds = Math.ceil((lockedUntil - now) / 1000);
      alert(`Too many attempts. Try again in ${seconds}s`);
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/api/vault");
      const data = await res.json();

      const salt = new Uint8Array(data.vault.salt);
      const key = await deriveKey(masterPassword, salt);
      const decrypted = await decryptData(key, data.vault.encryptedVault);

      setVaultData({
        version: decrypted.version ?? 1,
        createdAt: decrypted.createdAt ?? Date.now(),
        items: decrypted.items ?? [],
      });

      setSessionKey(key);
      setVaultSalt(salt);
      setVaultState(VAULT_STATE.UNLOCKED);

      setFailedAttempts(0);
      setLockedUntil(0);
      localStorage.removeItem("cc_failures");
      localStorage.removeItem("cc_locked_until");

      resetAutoLock();
    } catch {
      const nextFailures = failedAttempts + 1;
      const delay =
        BACKOFF_DELAYS[Math.min(nextFailures - 1, BACKOFF_DELAYS.length - 1)];

      const lockUntil = Date.now() + delay;

      setFailedAttempts(nextFailures);
      setLockedUntil(lockUntil);

      localStorage.setItem("cc_failures", nextFailures);
      localStorage.setItem("cc_locked_until", lockUntil);

      alert(
        `Wrong password.\nNext attempt allowed in ${Math.ceil(
          delay / 1000
        )} seconds`
      );
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
    resetAutoLock();
  }

  /* ---------------- UI STATES ---------------- */

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

  /* ---------------- MAIN UI ---------------- */

  return (
    <div onClick={resetAutoLock} onKeyDown={resetAutoLock}>
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
        <strong>CipherCell</strong>
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
