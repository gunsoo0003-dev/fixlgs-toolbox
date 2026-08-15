# TOOL 034 Third-party OSS

- `qpdf-wasm-esm-embedded` 1.1.1
- Purpose: browser-local QPDF CLI compiled to WebAssembly for real PDF opening-password encryption/decryption and encryption-state verification.
- License: Apache-2.0 as published for the package distribution.
- Network/API/account/key/usage fee: none required by product flow.
- User files: written only to the module's in-memory virtual filesystem; no server upload path is added.
- Integration: `package.json` and `package-lock.json` only, plus TOOL034-specific wrapper/type declaration.
- Existing `pdf-lib` 1.17.1 remains unchanged and handles document-info metadata and PDF reserialization.
- Existing `pdfjs-dist` 5.4.54 remains unchanged.

Security boundary: no brute-force, password guessing, permission bypass, DRM circumvention, or certificate-signature feature is implemented.
