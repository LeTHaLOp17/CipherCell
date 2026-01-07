import { useState } from "react";
import InitVault from "./pages/InitVault";

export default function App() {
  const [vaultInitialized, setVaultInitialized] = useState(false);

  function handleVaultInit(masterPassword) {
    // TEMP: we only acknowledge init for now
    console.log("Vault initialized (password NOT stored)");
    setVaultInitialized(true);
  }

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{
          fontSize: 16,
          fontWeight: 500,
          letterSpacing: 0.2,
          color: "var(--muted)",
          marginBottom: 24
      }}>
  CipherCell
</h1>



      {!vaultInitialized ? (
        <InitVault onInit={handleVaultInit} />
      ) : (
        <p>Vault initialized. (Next: encryption)</p>
      )}
    </div>
  );
}
