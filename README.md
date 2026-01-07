# CipherCell
An encrypted, isolated personal cell where your secrets are stored securely.

A **personal, zero-knowledge encrypted password vault** designed for **manual password storage**, **sensitive data protection**, and **access monitoring** — without autofill, without trackers, and without trusting a server.

This project is built for people who **do not trust memory, browsers, or blind automation**, and who want **full control** over their credentials.

---

## ❗ What This Project Is (and Is NOT)

### ✅ This project IS:

* A **manual password vault** (you add and manage passwords yourself)
* **Client-side encrypted** (zero-knowledge server)
* Accessible from **any device** (phone, desktop, tablet)
* Designed for **single-user personal use**
* Focused on **security, discipline, and visibility**

### ❌ This project is NOT:

* An autofill or key-capturing tool
* A spyware / background password sniffer
* A multi-user SaaS
* A password recovery service
* A replacement for OS-level keychains

---

## 🔑 Core Security Principles

This project strictly follows these rules:

* **Client-side encryption only**
* **Server never sees plaintext data**
* **Encryption key is derived from the master password**
* **Encryption key is never stored**
* **No password recovery**
* **HTTPS only**
* **Manual password entry only**

If any of these principles are violated, the security model breaks.

---

## 🔐 How Encryption Works (High-Level)

1. You create a **master password**
2. A cryptographic key is derived **locally** using:

   * PBKDF2 (high iteration count)
3. Your entire vault is encrypted using:

   * AES-256-GCM
4. Only the **encrypted vault** is sent to the server
5. The server stores **encrypted data only**
6. Decryption happens **only in memory**, on your device

**The server cannot decrypt your data — even if compromised.**

---

## 🧠 Important Rule (Read Carefully)

> **If you forget your master password, your vault is permanently inaccessible.**

There is:

* ❌ No reset
* ❌ No backdoor
* ❌ No recovery email

This is intentional and required for real security.

---

## 🏦 Sensitive (Bank) Password Protection

Passwords marked as **Bank / Sensitive** follow stricter rules:

* ❌ Hidden from the default vault list
* ❌ Excluded from normal search
* ✅ Visible only after:

  * Explicit search **or**
  * Manual confirmation
* 🔔 Triggers additional access alerts

This prevents:

* Accidental exposure
* Shoulder surfing
* Casual browsing of critical credentials

---

## 🔔 Access Alerts & Monitoring

The system sends alerts when:

* The vault is unlocked
* A new device accesses the vault
* Bank / sensitive entries are accessed

Alerts include:

* Time
* Device information
* Approximate location
* Action performed

If your vault is accessed — **you know immediately**.

---

## ⏳ Password Expiry & Discipline

* Bank passwords: **60–90 days (forced reminders)**
* Other passwords: configurable
* Notifications sent **before expiry**

This vault is not just storage — it enforces **good security habits**.

---

## 🧱 Threat Model (Honest & Transparent)

### ✅ Protected against:

* Database breaches
* Server compromise
* Network sniffing
* Rogue administrators
* Accidental exposure

### ❌ NOT protected against:

* Malware on your device
* Keyloggers
* Fully compromised operating systems
* Physical access to an unlocked device

No software can protect against these. This is reality.

---

## 🧩 Architecture Overview

* **Client (Web App / PWA)**

  * Encryption & decryption
  * Vault UI
  * Manual password management

* **Server**

  * Stores encrypted vault blobs
  * Sends notifications
  * Logs access events
  * Cannot decrypt data

---

## 📂 Repository Structure

```
vault/
├── client/        # Frontend (crypto happens here)
├── server/        # Backend (zero-knowledge storage)
├── docs/          # Security & design documentation
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started (Safe Setup)

1. Clone the repository
2. Install dependencies
3. Run client and server locally
4. Initialize your vault with a master password
5. Start adding passwords manually

⚠️ **Never commit real passwords, vault data, or secrets.**

---

## 🔓 Open-Source & Security

This project is intentionally **open-source**.

Security does **not** rely on code secrecy.
It relies on:

* Correct cryptography
* Proper architecture
* Zero-knowledge design

Anyone can audit the code.
No one can decrypt your vault without your master password.

---

## ⚠️ Final Warning

This project is for people who:

* Understand the risks
* Accept responsibility for their own data
* Prefer control over convenience

If you want autofill, recovery emails, or cloud-managed security —
**this project is not for you.**

---

## 📜 License

MIT — use it, fork it, improve it.
Just don’t weaken the security model.