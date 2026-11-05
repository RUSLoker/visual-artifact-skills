# visual-artifact-skills

A skill package for OmO: standalone report pages and clear data visualizations. It provides an original workflow adapter, without implementing or porting Claude or Qwen features.

## Skills

| Skill | When to use it |
| --- | --- |
| `hosted-artifacts` | A report, plan, comparison, or set of questions needs a standalone HTML/SVG page, published on the configured server with a final clickable URL by default. Explicitly local or private material stays local. |
| `dataviz` | A data question needs a table or chart with clear units, labels, and limitations. |

The initiating document workflow owns final composition and review; `hosted-artifacts` handles pages and publication, while `dataviz` chooses the visual representation. An artifact request includes publication by default; no repeated consent is needed for each publication on the configured server. Honor explicitly local delivery and keep private material local. Preserve visual files, accessible summaries, complete value equivalents, sources, dates, units, transformations, assumptions, limitations and verification results through the handoff. The skills use `frontend` or `data-scientist` when those are already installed. They are optional on other hosts: documents remain self-contained, and calculations use the available analysis tools.

Authored, explicitly labeled synthetic fixtures and reference examples may ship under `skills/*/references/`. See the [fixed evaluation protocol](skills/dataviz/references/evaluation.md) for cases and acceptance criteria. Real reports, private inputs and generated evaluation evidence stay outside the repository and package.

Browse the [worked synthetic examples](skills/hosted-artifacts/references/examples.md): a filtered analytical report, a categorical comparison with a complete dense table, questions answered in chat, and an accessible distribution SVG.

Users answer in chat. The package does not provide server-side form handling or send page interactions back to the agent.

## Installation

Install through OmO's native Git package mechanism:

```sh
omo install git:github.com/RUSLoker/visual-artifact-skills@v0.1.1
```

This command pins release `v0.1.1`. Specify a different tag explicitly to install another release.

OmO discovers the skills through `pi.skills` in `package.json`. Installation requires no manual file copying, `postinstall` script, or global npm installation.

The CLI requires Node.js 24 or newer. `private: true` prevents accidental publication to the npm registry; Git package installation remains the intended distribution method.

## Storage and addresses

Set these environment variables before running the CLI:

| Variable | Purpose |
| --- | --- |
| `ARTIFACTS_DIR` | Required absolute path to a separate store outside the package, source tree, and Git working tree. |
| `ARTIFACTS_BASE_URL` | Required for `publish`: a user-facing HTTP(S) origin without credentials, path, query, or fragment. Reserved example: `https://example.test`. |
| `HOST` | Server bind address. Defaults to the local loopback interface. |
| `PORT` | Server port. Defaults to `29004`. |

The operator configures machine-specific paths and network settings outside the package. Keep real reports, private inputs, deployment configuration, and store contents out of Git and package archives. The authored synthetic reference exception above doesn't permit private data.

## Publishing and viewing

Follow the [publishing runbook](skills/hosted-artifacts/references/publishing.md) for concrete setup and publication commands. It uses the bundled CLI in a locally pinned Docker image, one persistent service named `omo-artifacts`, an external stable store, host port `29004` mapped to container port `8080`, and restart policy `unless-stopped`. Inspect and reuse a matching service; a conflicting service or occupied port needs resolution without overwriting configuration or stopping unrelated containers. Keep deployment configuration outside Git.

The direct CLI contract, from the installed package root, is:

```sh
node skills/hosted-artifacts/scripts/artifacts.mjs publish INPUT.html --slug lowercase-hyphenated-id --title TITLE
```

Replace `INPUT.html` with the prepared HTML file, `TITLE` with its title, and `lowercase-hyphenated-id` with a lowercase, hyphenated identifier. Quote titles containing spaces.

Each publication creates an immutable revision without overwriting an existing one:

| Route | Content |
| --- | --- |
| `/a/SLUG/` | The latest published revision of a page. |
| `/a/SLUG/REVISION/` | A specific immutable revision. |
| `/` | A catalogue derived from the versions in the store. |

The server command is:

```sh
node skills/hosted-artifacts/scripts/artifacts.mjs serve
```

The server serves only known pages and routes, without directory listings. In Docker, mount input read-only and the store writable, with ownership prepared for the image's `USER node`. Leave the persistent service running after delivery and remove short-lived publish containers with `--rm`. Regular CLI execution retains its loopback default.

Inspect local configuration before asking for a missing base URL, then ask once for the address the user can open. A user-supplied base identifies the intended network; it doesn't prove the user's browser was tested. Parse `latest` and `revision` from the CLI JSON, follow redirects, require HTTP 200 and an HTML content type, and compare the response bytes or hash with the reviewed input. Server-side HTTP verifies the service only.

If the requested base refuses connections while a LAN or loopback address serves the artifact, keep the requested base and ask once to confirm the intended address or forwarding route. A local service check doesn't verify user routing or complete link delivery. Don't silently substitute a private fallback.

The final response must include a Markdown link to the verified URL. A local path, `show_html_page`, or an agent-only URL doesn't complete default delivery. If publication or verification fails, report URL delivery as incomplete. Explicitly local or private material uses file delivery instead.

The CLI accepts HTML. Wrap a standalone SVG in an offline HTML page for default publication; file delivery is available for the local/private exception.

An existing link deployment may use a separate or legacy server. Don't assume it runs this CLI. An approved migration must preserve existing reports and routes, including legacy routes the bundled server doesn't implement; see the runbook before changing service ownership or routing.

## Page verification

Review every final document before delivery, including local files that need no deployment:

1. Verify facts, labels, and source links. Separate calculations from assumptions and state the data date.
2. Preview at 375 x 812 and 1280 x 900 CSS pixels, each in light and dark, unless the request sets other sizes. Record actual dimensions, themes, screenshots and PASS, FAIL or UNVERIFIED per check. Check all content for overflow, clipped labels, overlap, usable table headers and keyboard access, including controls and table scrolling.
3. Measure normal text contrast at least 4.5:1 and essential graphical distinctions at least 3:1 in both themes. These project thresholds don't establish complete accessibility compliance. Mark unavailable checks UNVERIFIED and inapplicable checks N/A with reasons.
4. Confirm local styles and graphics work without a host theme. Reload offline, inspect outgoing requests, and check that content and local controls survive without required remote assets.
5. Preserve the full handoff in the final composition. For dense tables, wrap or group content or use a labeled keyboard-accessible scroll region without page-level overflow. Any subset needs an explicit rule, visible omissions and access to full values; an all-values request forbids a subset. Reuse unchanged data checks, repeating affected checks only after inputs, transformations or values change.
6. Follow `SECURITY.md`, section "Page review", for source and privacy inspection. An artifact request is the publication request described there unless delivery is explicitly local or the material is private. Check publication prerequisites early and verify the returned URL before the mandatory final link. Ordinary page publication doesn't require a whole Git-history scan; the separate repository release review applies to public pushes and package releases.

The server has no built-in authentication. The operator controls access through the network and proxy. HTML can run local JavaScript; CSP restricts network requests, forms, and frames, but doesn't replace content review. `SECURITY.md`, section "Repository release review", separately covers public pushes and package releases.

## License

MIT. See `LICENSE` for the full text.
