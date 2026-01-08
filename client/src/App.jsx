import { useState, useEffect } from "react";
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

  // 🔥 Check backend on app load
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

  // 🆕 Signup → encrypt empty vault → save to backend
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

    setVaultState(VAULT_STATE.LOCKED);
  }

  // 🔓 Unlock → decrypt vault → load data
  async function handleUnlock(masterPassword) {
    try {
      const res = await fetch("http://localhost:4000/api/vault");
      const data = await res.json();

      const salt = new Uint8Array(data.vault.salt);
      const encryptedVault = data.vault.encryptedVault;

      const key = await deriveKey(masterPassword, salt);
      const decryptedVault = await decryptData(key, encryptedVault);

      // 🛡 normalize (old vault safety)
      const normalizedVault = {
        version: decryptedVault.version ?? 1,
        createdAt: decryptedVault.createdAt ?? Date.now(),
        items: decryptedVault.items ?? [],
      };

      setVaultData(normalizedVault);
      setVaultState(VAULT_STATE.UNLOCKED);
    } catch {
      alert("Wrong master password");
    }
  }

  // ➕ Add password + notes entry
  async function addVaultItem(item) {
    const updatedVault = {
      ...vaultData,
      items: [...vaultData.items, item],
    };

    await saveUpdatedVault(updatedVault);
  }

  // 🔐 Helper: re-encrypt + save vault
  async function saveUpdatedVault(updatedVault) {
    const res = await fetch("http://localhost:4000/api/vault");
    const data = await res.json();

    const salt = new Uint8Array(data.vault.salt);
    const password = prompt("Enter master password to save changes");

    if (!password) return;

    const key = await deriveKey(password, salt);
    const encryptedVault = await encryptData(key, updatedVault);

    await fetch("http://localhost:4000/api/vault", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        encryptedVault,
        salt: Array.from(salt),
      }),
    });

    setVaultData(updatedVault);
  }

  // ⏳ Loading screen
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
          <h1 style={{ padding: 24 }}>🔐 CipherCell Vault</h1>
          <Vault vault={vaultData} onAdd={addVaultItem} />
        </>
      )}
    </>
  );
}
