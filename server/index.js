import app from "./app.js";

const PORT = 4000;

app.listen(PORT, () => {
  console.log(`Vault server running on http://localhost:${PORT}`);
});
