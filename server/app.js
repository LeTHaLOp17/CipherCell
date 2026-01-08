import express from "express";
import cors from "cors";
import helmet from "helmet";

import healthRoute from "./routes/health.js";
import vaultRoute from "./routes/vault.js"; // 👈 MUST

const app = express();

app.use(helmet());
app.use(cors({
  origin: "http://localhost:5173",
}));
app.use(express.json());

// ROUTES
app.use("/api", healthRoute);
app.use("/api", vaultRoute); // 👈 MUST

export default app;
