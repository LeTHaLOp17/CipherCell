import { useState } from "react";
import SignupVault from "./pages/SignupVault";
import UnlockVault from "./pages/UnlockVault";
import { VAULT_STATE } from "./vault/vaultState";

export default function App() {
  const [vaultState, setVaultState] = useState(VAULT_STATE.UNINITIALIZED);
  const [ownerEmail, setOwnerEmail] = useState(null);

  function handleSignup({ email }) {
    setOwnerEmail(email);
    setVaultState(VAULT_STATE.LOCKED);
  }

  function handleUnlock(masterPassword) {
    // ❌ Do not store password
    // Later: derive key + decrypt vault here
    setVaultState(VAULT_STATE.UNLOCKED);
  }

  return (
    <>
      {vaultState === VAULT_STATE.UNINITIALIZED && (
        <SignupVault onSignup={handleSignup} />
      )}

      {vaultState === VAULT_STATE.LOCKED && (
        <UnlockVault onUnlock={handleUnlock} />
      )}

      {vaultState === VAULT_STATE.UNLOCKED && (
        <p style={{ padding: 24 }}>
          Vault unlocked.<br />
          (Next: encrypted vault UI)
        </p>
      )}
    </>
  );
}
