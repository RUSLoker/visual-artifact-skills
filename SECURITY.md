# Security review

This repository contains skill source files and a publishing tool.
Keep server addresses, machine-specific configuration, real reports, private inputs, store contents and generated evaluation evidence outside the repository and package.
Authored fixtures and reference examples under `skills/*/references/` may ship only when explicitly labeled synthetic and free of real or private data, secrets, internal addresses and machine-specific paths.
`.gitignore` prevents some accidental additions; it does not inspect file contents.

## Repository release review

Before every public push or package release:

1. Inspect the full outgoing diff and file list.
2. Scan working files with Gitleaks using `--redact`.
3. Scan the complete outgoing Git history with Gitleaks using `--redact`.
4. Inspect `npm pack --dry-run` output. The package uses an explicit `files` allowlist.
5. Check for `.env` files, keys, machine-specific addresses, home-directory paths, customer data, and actual reports.

Run these checks locally. Keep reports and any findings out of the public repository.
A clean scanner result does not prove that every possible secret is absent.
If a real secret is found, stop publication and revoke it before correcting files and history.

## Page review

Review each final HTML or SVG document before delivery and again after changes affecting its content. Inspect visible content, embedded datasets, metadata, comments, hidden elements, scripts and outgoing URLs. Remove secrets, personal details, internal addresses and unnecessary private data; review untrusted active content before opening or publishing it. Keep required value equivalents, sources and limitations with the document.

Apply the final-page preview, measured contrast, keyboard, overflow and offline checks in `skills/hosted-artifacts/SKILL.md`. Record unavailable checks as UNVERIFIED. Repository scanner and package checks don't establish page readability or safety, and page review doesn't replace repository release review.

Publication requires a user request. An artifact request includes publication on the configured server by default; don't ask for publication consent again for each artifact. Explicitly local requests and private material stay local. Creating an unsolicited file doesn't authorize publication. Check deployment prerequisites early for the publication workflow. Local file delivery needs no server; an agent-side HTTP success doesn't establish that a user can reach a published page.
The server does not provide password authentication; access depends on the network and external proxy.
Published pages can run local JavaScript; CSP restricts network requests, forms, and frames.
