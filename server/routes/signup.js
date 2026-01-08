import express from "express";
import { randomUUID } from "crypto";

const router = express.Router();

let vaultMetadata = null; // in-memory for now

router.post("/signup", (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Invalid email" });
  }

  vaultMetadata = {
    ownerId: "owner-1",
    email,
    createdAt: new Date().toISOString(),
  };

  res.json({ success: true });
});

export default router;
