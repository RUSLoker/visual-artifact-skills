# visual-artifact-skills

A skill package for OmO: standalone report pages and clear data visualizations. It provides an original workflow adapter, without implementing or porting Claude or Qwen features.

## Skills

| Skill | When to use it |
| --- | --- |
| `hosted-artifacts` | A report, plan, comparison, or set of questions would be clearer as a standalone HTML/SVG page, optionally published at a shareable URL. |
| `dataviz` | A data question needs a table or chart with clear units, labels, and limitations. |

The initiating document workflow owns final composition and review; `hosted-artifacts` handles pages and requested publication, while `dataviz` chooses the visual representation. Preserve visual files, accessible summaries, complete value equivalents, sources, dates, units, transformations, assumptions, limitations and verification results through the handoff. The skills use `frontend` or `data-scientist` when those are already installed. They are optional on other hosts: documents remain self-contained, and calculations use the available analysis tools.

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
| `ARTIFACTS_BASE_URL` | Required for `publish`: an HTTP(S) origin reachable by the user. Reserved example: `https://example.test`. |
| `HOST` | Server bind address. Defaults to the local loopback interface. |
| `PORT` | Server port. Defaults to `29004`. |

The operator configures machine-specific paths and network settings outside the package. Keep real reports, private inputs, deployment configuration, and store contents out of Git and package archives. The authored synthetic reference exception above doesn't permit private data.

## Publishing and viewing

From the installed package root:

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

Start the server separately:

```sh
node skills/hosted-artifacts/scripts/artifacts.mjs serve
```

The server serves only known pages and routes, without directory listings. For Docker, bind to all container interfaces, use internal port `8080`, and map a host port explicitly. Mount a separate store outside the source tree. Regular CLI execution retains its loopback default.

`ARTIFACTS_BASE_URL` must match the address the user can use to reach the server or proxy. Setting it does not establish network access. Check access from the user's side before sending a link; a container-only or agent-only address is insufficient.

The CLI accepts HTML. Deliver a standalone SVG as a file, or embed it in an HTML page to publish it through this CLI.

## Page verification

Review every final document before delivery, including local files that need no deployment:

1. Verify facts, labels, and source links. Separate calculations from assumptions and state the data date.
2. Preview at 375 x 812 and 1280 x 900 CSS pixels, each in light and dark, unless the request sets other sizes. Record actual dimensions, themes, screenshots and PASS, FAIL or UNVERIFIED per check. Check all content for overflow, clipped labels, overlap, usable table headers and keyboard access, including controls and table scrolling.
3. Measure normal text contrast at least 4.5:1 and essential graphical distinctions at least 3:1 in both themes. These project thresholds don't establish complete accessibility compliance. Mark unavailable checks UNVERIFIED and inapplicable checks N/A with reasons.
4. Confirm local styles and graphics work without a host theme. Reload offline, inspect outgoing requests, and check that content and local controls survive without required remote assets.
5. Preserve the full handoff in the final composition. For dense tables, wrap or group content or use a labeled keyboard-accessible scroll region without page-level overflow. Any subset needs an explicit rule, visible omissions and access to full values; an all-values request forbids a subset. Reuse unchanged data checks, repeating affected checks only after inputs, transformations or values change.
6. Follow `SECURITY.md`, section "Page review", for source and privacy inspection. Only requested publication needs early deployment prerequisites and a final check of the returned URL and user access. Agent-side HTTP success alone doesn't prove access; use file delivery if reachability remains unverified.

The server has no built-in authentication. The operator controls access through the network and proxy. HTML can run local JavaScript; CSP restricts network requests, forms, and frames, but doesn't replace content review. `SECURITY.md`, section "Repository release review", separately covers public pushes and package releases.

## License

MIT. See `LICENSE` for the full text.
