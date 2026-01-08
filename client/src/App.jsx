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
  const [vaultSalt, setVaultSalt] = useState(null); // 🔥 IMPORTANT

  const lockTimer = useRef(null);

  /* -------------------- AUTO LOCK -------------------- */

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

    lockTimer.current = setTimeout(() => {
      alert("Vault auto-locked due to inactivity");
      lockVault();
    }, 3 * 60 * 1000); // ✅ 3 minutes
  }

  /* -------------------- CHECK VAULT ON LOAD -------------------- */

  useEffect(() => {
    async function checkVault() {
      try {
        const res = await fetch("http://localhost:4000/api/vault");
        const data = await res.json();

        if (data.exists) {
          setVaultState(VAULT_STATE.LOCKED);
        } else {
          setVaultState(VAULT_STATE.UNINITIALIZED);
        }
      } catch {
        setVaultState(VAULT_STATE.UNINITIALIZED);
      }
    }

    checkVault();
  }, []);

  /* -------------------- SIGNUP -------------------- */

  async function handleSignup({ masterPassword }) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const key = await deriveKey(masterPassword, salt);

    const encryptedVault = await encryptData(key, EMPTY_VAULT);

    await fetch("http://localhost:4000/api/vault", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        encryptedVault,
        salt: Array.from(salt),
      }),
    });

    setVaultSalt(salt); // ✅ STORE SALT
    setVaultState(VAULT_STATE.LOCKED);
  }

  /* -------------------- UNLOCK -------------------- */

  async function handleUnlock(masterPassword) {
    try {
      const res = await fetch("http://localhost:4000/api/vault");
      const data = await res.json();

      const salt = new Uint8Array(data.vault.salt);
      const encryptedVault = data.vault.encryptedVault;

      const key = await deriveKey(masterPassword, salt);
      const decryptedVault = await decryptData(key, encryptedVault);

      const normalizedVault = {
        version: decryptedVault.version ?? 1,
        createdAt: decryptedVault.createdAt ?? Date.now(),
        items: decryptedVault.items ?? [],
      };

      setVaultData(normalizedVault);
      setSessionKey(key);
      setVaultSalt(salt); // 🔥 CRITICAL FIX
      setVaultState(VAULT_STATE.UNLOCKED);

      resetAutoLock();
    } catch {
      alert("Wrong master password");
    }
  }

  /* -------------------- ADD ITEM -------------------- */

  async function addVaultItem(item) {
    if (!sessionKey || !vaultSalt) {
      lockVault();
      return;
    }

    const updatedVault = {
      ...vaultData,
      items: [...vaultData.items, item],
    };

    setVaultData(updatedVault); // show immediately
    await saveUpdatedVault(updatedVault);
    resetAutoLock();
  }

  /* -------------------- SAVE VAULT -------------------- */

  async function saveUpdatedVault(updatedVault) {
    if (!sessionKey || !vaultSalt) {
      lockVault();
      return;
    }

    const encryptedVault = await encryptData(sessionKey, updatedVault);

    await fetch("http://localhost:4000/api/vault", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        encryptedVault,
        salt: Array.from(vaultSalt), // 🔥 THIS FIXES 400 ERROR
      }),
    });

    setVaultData(updatedVault);
  }

  /* -------------------- UI -------------------- */

  if (vaultState === VAULT_STATE.LOADING) {
    return <p style={{ padding: 24 }}>Loading CipherCell…</p>;
  }

  return (
    <>
      {vaultState === VAULT_STATE.UNINITIALIZED && (
        <SignupVault onSignup={handleSignup} />
      )}

      {vaultState === VAULT_STATE.LOCKED && (
        <UnlockVault onUnlock={handleUnlock} />
      )}

      {vaultState === VAULT_STATE.UNLOCKED && vaultData && (
        <>
          <div style={{ padding: 24, display: "flex", gap: 16 }}>
            <h1>🔐 CipherCell Vault</h1>
            <button onClick={lockVault}>🔒 Logout</button>
          </div>

          <div onClick={resetAutoLock} onKeyDown={resetAutoLock}>
            <Vault
  vault={vaultData}
  onAdd={addVaultItem}
  onUpdate={(item) => {
    const updated = {
      ...vaultData,
      items: vaultData.items.map((i) =>
        i.id === item.id ? item : i
      ),
    };
    saveUpdatedVault(updated);
  }}
  onDelete={(id) => {
    const updated = {
      ...vaultData,
      items: vaultData.items.filter((i) => i.id !== id),
    };
    saveUpdatedVault(updated);
  }}
/>

          </div>
        </>
      )}
    </>
  );
}
