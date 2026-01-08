import { useState, useEffect, useRef } from "react";
import SignupVault from "./pages/SignupVault";
import UnlockVault from "./pages/UnlockVault";
import Vault from "./pages/Vault";

import { VAULT_STATE } from "./vault/vaultState";
import { deriveKey } from "./crypto/deriveKey";
import { encryptData } from "./crypto/encrypt";
import { decryptData } from "./crypto/decrypt";
import { EMPTY_VAULT } from "./vault/vaultHeader";

export default function App() {
  const [vaultState, setVaultState] = useState(VAULT_STATE.LOADING);
  const [vaultData, setVaultData] = useState(null);
  const [sessionKey, setSessionKey] = useState(null);
  const [vaultSalt, setVaultSalt] = useState(null);

  const lockTimer = useRef(null);

  /* ---------------- AUTO LOCK ---------------- */

  function lockVault() {
    setVaultData(null);
    setSessionKey(null);
    setVaultSalt(null);
    setVaultState(VAULT_STATE.LOCKED);
    if (lockTimer.current) clearTimeout(lockTimer.current);
  }

  function resetAutoLock() {
    if (lockTimer.current) clearTimeout(lockTimer.current);
    lockTimer.current = setTimeout(lockVault, 3 * 60 * 1000);
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

    setVaultSalt(salt);
    setVaultState(VAULT_STATE.LOCKED);
  }

  /* ---------------- UNLOCK ---------------- */

  async function handleUnlock(masterPassword) {
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
      resetAutoLock();
    } catch {
      alert("Wrong master password");
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
  }

  /* ---------------- UI STATES ---------------- */

  if (vaultState === VAULT_STATE.LOADING)
    return <p style={{ padding: 24 }}>Loading CipherCell…</p>;

  if (vaultState === VAULT_STATE.UNINITIALIZED)
    return <SignupVault onSignup={handleSignup} />;

  if (vaultState === VAULT_STATE.LOCKED)
    return <UnlockVault onUnlock={handleUnlock} />;

  /* ---------------- MAIN UI ---------------- */

  return (
    <div onClick={resetAutoLock} onKeyDown={resetAutoLock}>
      {/* ================= FIXED HEADER ================= */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          height: 64,

          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",

          padding: "0 28px",

          background:
            "linear-gradient(180deg, rgba(155,124,255,0.18), rgba(155,124,255,0.05))",
          backdropFilter: "blur(34px) saturate(140%)",
          WebkitBackdropFilter: "blur(34px) saturate(140%)",

          borderBottom: "1px solid rgba(200,170,255,0.25)",
          boxShadow: "0 8px 28px rgba(155,124,255,0.28)",
        }}
      >
        <div
          style={{
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: 0.5,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          🔐 CipherCell
        </div>

        <button
          onClick={lockVault}
          style={{
            background:
              "linear-gradient(180deg, rgba(179,140,255,0.35), rgba(155,124,255,0.22))",
            border: "1px solid rgba(200,170,255,0.35)",
            padding: "8px 14px",
            borderRadius: 12,
          }}
        >
          Logout
        </button>
      </header>

      {/* ================= SCROLLABLE CONTENT ================= */}
      <main
        style={{
          padding: 24,
          paddingTop: 64 + 24, // header height + spacing
        }}
      >
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
