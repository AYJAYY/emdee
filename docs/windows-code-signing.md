# Windows Code Signing Guide — EmDee

Code signing removes the "Unknown Publisher" SmartScreen warning when users install EmDee on Windows.

---

## 1. Choose a Certificate

| Type | SmartScreen | Cost/yr | Notes |
|------|-------------|---------|-------|
| **EV (Extended Validation)** | Instant trust, no warning | ~$279–$580 | Best option. Requires hardware token (HSM). |
| **OV (Organization Validated)** | Warning until reputation builds | ~$210–$290 | Cheaper. Reputation grows with download count. |
| **Self-signed** | Always warns | Free | Not recommended for distribution. |

**Recommended:** Buy an EV certificate from [Sectigo](https://www.sectigo.com) (~$279/yr) or [DigiCert](https://www.digicert.com) (~$499/yr). The vendor ships a USB hardware token (HSM) — you must plug it in to sign.

---

## 2. Prerequisites (Windows Host)

1. **Windows SDK** — install via [Visual Studio](https://visualstudio.microsoft.com/downloads/) or the standalone [Windows SDK](https://developer.microsoft.com/en-us/windows/downloads/windows-sdk/). Provides `signtool.exe`.
2. **Rust + Cargo** — [rustup.rs](https://rustup.rs)
3. **Node.js 20+** — [nodejs.org](https://nodejs.org)
4. **Tauri CLI** — already in `devDependencies`, installed via `npm install`
5. **Your code signing certificate** — `.pfx` file or HSM token plugged in

---

## 3. Locate signtool.exe

After installing the Windows SDK:

```
C:\Program Files (x86)\Windows Kits\10\bin\10.0.xxxxx.0\x64\signtool.exe
```

Confirm it works:

```powershell
& "C:\Program Files (x86)\Windows Kits\10\bin\10.0.19041.0\x64\signtool.exe" /?
```

---

## 4. Import Your Certificate

### Option A — PFX file

```powershell
# Import the .pfx into the Windows Certificate Store
certutil -f -importpfx "C:\path\to\your-cert.pfx" MyPassword
```

### Option B — HSM token (EV certs)

Plug in the USB token. Windows will auto-detect it and add it to the certificate store. No import needed.

---

## 5. Find Your Certificate Thumbprint

```powershell
# List code-signing certs in your store
Get-ChildItem Cert:\CurrentUser\My | Where-Object { $_.EnhancedKeyUsageList -match "Code Signing" } | Select-Object Thumbprint, Subject
```

Copy the `Thumbprint` value — a 40-character hex string like `A1B2C3D4E5F6...`.

---

## 6. Configure tauri.conf.json

Open `src-tauri/tauri.conf.json` and add a `windows` block inside `bundle`:

```json
{
  "bundle": {
    "windows": {
      "certificateThumbprint": "YOUR_40_CHAR_THUMBPRINT_HERE",
      "digestAlgorithm": "sha256",
      "timestampUrl": "http://timestamp.comodoca.com"
    }
  }
}
```

> **Note:** The built-in `certificateThumbprint` method works for OV certificates issued **before June 2023** and all EV certificates. For newer OV certs use the `signCommand` approach in Section 7.

---

## 7. Alternative — Custom signCommand

If the thumbprint approach doesn't work (newer OV cert, or you want explicit control):

```json
{
  "bundle": {
    "windows": {
      "signCommand": {
        "cmd": "signtool.exe",
        "args": [
          "sign",
          "/v",
          "/fd",  "SHA256",
          "/tr",  "http://timestamp.comodoca.com",
          "/td",  "SHA256",
          "/sha1", "%CERT_THUMBPRINT%",
          "/d",   "EmDee",
          "%1"
        ]
      }
    }
  }
}
```

`%1` is replaced by Tauri with the path to the file being signed. `%CERT_THUMBPRINT%` is read from your environment.

Set the variable before building:

```powershell
$env:CERT_THUMBPRINT = "A1B2C3D4E5F6..."
npm run tauri build
```

---

## 8. Build the Signed Installer

```powershell
# From the project root
npm run tauri build
```

The signed installer will appear at:

```
src-tauri\target\release\bundle\nsis\EmDee_0.2.0_x64-setup.exe
```

Verify the signature:

```powershell
signtool verify /pa /v "src-tauri\target\release\bundle\nsis\EmDee_0.2.0_x64-setup.exe"
```

You should see `Successfully verified`.

Then copy to `releases\`:

```powershell
copy "src-tauri\target\release\bundle\nsis\EmDee_0.2.0_x64-setup.exe" releases\
```

---

## 9. GitHub Actions CI Signing

Store the `.pfx` as a base64 secret in your GitHub repo settings (`Settings → Secrets → Actions`):

```powershell
# Encode locally and copy the output into the secret
[Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\path\to\cert.pfx")) | clip
```

Add secrets:
- `WIN_CERTIFICATE` — base64-encoded `.pfx`
- `WIN_CERT_PASSWORD` — the `.pfx` password
- `CERT_THUMBPRINT` — the certificate thumbprint

Then in your workflow:

```yaml
jobs:
  build-windows:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Node
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install Rust
        uses: dtolnay/rust-toolchain@stable

      - name: Install dependencies
        run: npm install

      - name: Import signing certificate
        run: |
          $cert_bytes = [Convert]::FromBase64String("${{ secrets.WIN_CERTIFICATE }}")
          [IO.File]::WriteAllBytes("$env:TEMP\cert.pfx", $cert_bytes)
          certutil -f -importpfx "$env:TEMP\cert.pfx" "${{ secrets.WIN_CERT_PASSWORD }}"
          Remove-Item "$env:TEMP\cert.pfx"

      - name: Build signed installer
        env:
          CERT_THUMBPRINT: ${{ secrets.CERT_THUMBPRINT }}
        run: npm run tauri build

      - name: Upload installer
        uses: actions/upload-artifact@v4
        with:
          name: EmDee-windows-installer
          path: src-tauri/target/release/bundle/nsis/*.exe
```

---

## 10. Timestamp Servers

Always include a timestamp so the signature remains valid after the certificate expires.

| Provider | URL |
|----------|-----|
| Comodo / Sectigo | `http://timestamp.comodoca.com` |
| DigiCert | `http://timestamp.digicert.com` |
| GlobalSign | `http://timestamp.globalsign.com/tsa/r6advanced1` |
| Microsoft | `http://timestamp.acs.microsoft.com` |

---

## Quick Reference

```powershell
# 1. Find thumbprint
Get-ChildItem Cert:\CurrentUser\My | Where-Object { $_.EnhancedKeyUsageList -match "Code Signing" } | Select Thumbprint, Subject

# 2. Set env var
$env:CERT_THUMBPRINT = "PASTE_THUMBPRINT_HERE"

# 3. Build
npm run tauri build

# 4. Verify
signtool verify /pa "src-tauri\target\release\bundle\nsis\EmDee_0.2.0_x64-setup.exe"

# 5. Copy to releases
copy "src-tauri\target\release\bundle\nsis\EmDee_0.2.0_x64-setup.exe" releases\
```
