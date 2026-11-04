# visual-artifact-skills

A skill package for OmO: standalone report pages and clear data visualizations. It provides an original workflow adapter, without implementing or porting Claude or Qwen features.

## Skills

| Skill | When to use it |
| --- | --- |
| `hosted-artifacts` | A report, plan, comparison, or set of questions would be clearer as a standalone HTML/SVG page, optionally published at a shareable URL. |
| `dataviz` | A data question needs a table or chart with clear units, labels, and limitations. |

`hosted-artifacts` handles the page and publication; `dataviz` chooses the visual representation. The skills use `frontend` or `data-scientist` when those are already installed. They are optional on other hosts: documents remain self-contained, and calculations use the available analysis tools.

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

The operator configures machine-specific paths and network settings outside the package. Keep actual reports, input data, deployment configuration, and store contents out of Git and package archives.

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

Before publishing:

1. Verify facts, labels, and source links. Separate calculations from assumptions and state the data date.
2. Open the page at desktop and phone widths, in light and dark themes. Check wrapping, tables, labels, and keyboard access.
3. Confirm that styles, spacing, colors, fonts, and graphics work independently of a host theme.
4. Review HTML, SVG, embedded data, metadata, and scripts for secrets and personal information. Remove unnecessary data before publication.
5. After publication, verify the returned URL and the user's access to it.

The server has no built-in authentication. The operator controls access through the network and proxy. HTML can run local JavaScript; CSP restricts network requests, forms, and frames, but does not replace content review before publication. See `SECURITY.md` for source and package review requirements.

## License

MIT. See `LICENSE` for the full text.
