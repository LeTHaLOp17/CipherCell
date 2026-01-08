export async function decryptData(key, encrypted) {
  const iv = new Uint8Array(encrypted.iv);
  const data = new Uint8Array(encrypted.data);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );

  return JSON.parse(new TextDecoder().decode(decrypted));
}
