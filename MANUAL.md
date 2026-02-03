# System J: Operational Manual & Deployment Guide

## 1. System Architecture
System J is a "Headless" terminal-themed portfolio. It consists of two parts:
1.  **The Admin Station (Local)**: Where you write content and manage keys (`/admin`).
2.  **The Public Terminal (Remote)**: The PHP/HTML frontend that visitors see (`/public_html`).

## 2. Initial Setup (One-Time)

### A. Key Generation
Security relies on an RSA key pair. You must generate these before anything else.
Run these commands in your terminal:

```bash
# 1. Create the key directories if they don't exist
mkdir -p admin/keys public_html/keys

# 2. Generate Private Key (KEEP SAFE in admin/keys)
openssl genrsa -out admin/keys/private.pem 2048

# 3. Extract Public Key (Deploy this to public_html/keys)
openssl rsa -in admin/keys/private.pem -pubout -out public_html/keys/public.pem
```

> **WARNING**: Never upload `private.pem` to your web server. It stays on your computer.

### B. Configuration
Open `admin/publish.js` and check the `CONFIG` object.
- Default `apiUrl`: `http://localhost:8080/api/gatekeeper.php`
- Change this to your live domain when deploying (e.g., `https://your-site.com/api/gatekeeper.php`).

---

## 3. Daily Workflow (Writing & Publishing)

### Step 1: Write Content
1.  Create standard Markdown files in `admin/content/` (e.g., `admin/content/blog/new-post.md`).
2.  You can use standard Markdown. Code blocks and Math are supported.

### Step 2: Update Manifest
The system only knows about files listed in the manifest.
Edit `admin/content/manifest.json`:

```json
{
    "id": "new-post",
    "title": "My New Post",
    "path": "blog/new-post.md",
    "type": "file"
}
```

### Step 3: Publish (Sync)
Run the publisher script to sync changes to the server.

```bash
# Default sync (Smart Sync - checks timestamps)
node admin/publish.js

# Force checking file hashes (slower, more accurate)
node admin/publish.js --force-hash

# Dry run (see what would change without uploading)
node admin/publish.js --dry-run
```

---

## 4. Local Development (Testing)

To test the site on your machine before deploying:

1.  Open a terminal in the `public_html` folder.
2.  Start a PHP built-in server:
    ```bash
    cd public_html
    php -S localhost:8080
    ```
3.  Visit `http://localhost:8080` in your browser.
4.  Ensure `admin/publish.js` is targeting `http://localhost:8080/api/gatekeeper.php`.

---

## 5. Deployment Instructions

To go live on a static shared host (with PHP support):

### File Upload
Upload the **entire contents** of the `public_html` folder to your web server's public folder (usually named `public_html` or `www`).
*   Do NOT upload the `admin` folder.
*   Do NOT upload the `.git` folder.

### Permissions
The PHP script needs to write to the `content` and `assets` directories. Step into your server (via FTP or SSH) and ensure:

1.  `content/` folder is Writable (755 or 777 depending on host).
2.  `assets/uploads/` folder is Writable.
3.  `keys/public.pem` is Readable.

### Final Check
1.  Change `apiUrl` in your local `admin/publish.js` to your real domain.
2.  Run `node admin/publish.js` locally.
3.  If successful, the terminal will report "Upload complete".
