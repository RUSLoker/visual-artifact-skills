# Pre-publication review

This repository contains skill source files and a publishing tool.
Keep server addresses, machine-specific configuration, reports, and input data outside the repository.
`.gitignore` prevents some accidental additions; it does not inspect file contents.

Before every public push:

1. Inspect the full outgoing diff and file list.
2. Scan working files with Gitleaks using `--redact`.
3. Scan the complete outgoing Git history with Gitleaks using `--redact`.
4. Inspect `npm pack --dry-run` output. The package uses an explicit `files` allowlist.
5. Check for `.env` files, keys, machine-specific addresses, home-directory paths, customer data, and actual reports.

Run these checks locally. Keep reports and any findings out of the public repository.
A clean scanner result does not prove that every possible secret is absent.
If a real secret is found, stop publication and revoke it before correcting files and history.

Review HTML pages separately before publishing them.
The server does not provide password authentication; access depends on the network and external proxy.
Published pages can run local JavaScript; CSP restricts network requests, forms, and frames.
