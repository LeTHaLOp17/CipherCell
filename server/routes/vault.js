import express from "express";

const router = express.Router();

// TEMP in-memory vault (single-user)
let vaultRecord = null;

// GET vault (check if exists)
router.get("/vault", (req, res) => {
  if (!vaultRecord) {
    return res.json({ exists: false });
  }

  res.json({
    exists: true,
    vault: vaultRecord,
  });
});

// CREATE vault (signup)
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

export default router;
