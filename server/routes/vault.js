import express from "express";

const router = express.Router();

// SINGLE USER VAULT (in-memory for now)
let vaultRecord = null;

// CHECK VAULT
router.get("/vault", (req, res) => {
  if (!vaultRecord) {
    return res.json({ exists: false });
  }

  res.json({
    exists: true,
    vault: vaultRecord,
  });
});

// CREATE VAULT (signup)
router.post("/vault", (req, res) => {
  const { encryptedVault, salt } = req.body;

  if (!encryptedVault || !salt) {
    return res.status(400).json({ error: "Invalid vault data" });
  }

  vaultRecord = {
    encryptedVault,
    salt,
    createdAt: Date.now(),
  };

  res.json({ success: true });
});

// DELETE VAULT (reset)
router.delete("/vault", (req, res) => {
  vaultRecord = null;
  res.json({ success: true });
});

export default router;
