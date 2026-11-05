---
name: hosted-artifacts
description: Create standalone HTML or SVG reports, plans, comparisons, and question pages; preview and publish artifact requests on the configured server, then return a clickable URL, except for explicitly local or private material.
---

# Hosted artifacts

See the [worked synthetic examples](references/examples.md) for complete local reports, comparisons, questions and a distribution figure, with inputs, calculations and delivery checks.

Turn an answer into a document that can be read outside the chat. This skill is an original workflow adapter. It doesn't implement or port a Claude or Qwen feature.

Use it for reports, plans, comparisons, decision documents, and pages that organize questions. Keep short answers in chat when a separate document adds no value. An artifact request includes publication on the configured server and a final clickable URL by default. Don't ask for consent again for each configured publication. Honor explicitly local delivery and keep private material local.

The workflow that initiates the document owns final composition and final-page review. When that is `hosted-artifacts`, keep that ownership while using `dataviz` for a visual. Preserve the full handoff: visual files, accessible summary, complete values table or text equivalent, sources, dates, units, transformations, assumptions, limitations, and verification results. Embed required companions or deliver them together with working references; a missing companion table makes the handoff incomplete.

For the default publication workflow, inspect local configuration, service availability, and the intended user address early. Follow the [publishing runbook](references/publishing.md). If the base URL is missing, inspect local configuration first, then ask once for the address the user can open. Continue composing while that answer is pending. Missing deployment prerequisites don't block an explicitly local document.

## Build the document

1. Identify the reader, the question, and the decision the page should support. Use the request and available context before asking for missing information.
2. Keep facts traceable. Cite sources beside the claims they support, identify data dates and units, and distinguish observations, calculations, assumptions, and proposals. Don't invent a source or imply that an unchecked claim was verified.
3. Choose a compact structure with a clear title, readable sections, and a useful reading order. For comparisons, use a table when the differences are categorical. Apply `dataviz` when choosing a chart or table from data.
4. If `frontend` is installed, use it for layout and visual implementation. An installed `data-scientist` can handle data analysis. Read those skills before using them. Neither is required on another host: use available analysis tools and implement the page directly without installing a framework or analysis engine by default.
5. Produce a standalone HTML document or SVG. Inline the styles and graphics needed to read it offline. Avoid required remote fonts, scripts, CDNs, and image services. For CLI publication, embed SVG in HTML because the publisher accepts an HTML input.

A host theme or design system may be absent. Define local spacing, typography, colors, and light/dark theme defaults in the document itself. CSS variables should have usable values; optional host variables need fallbacks. Give tables a usable narrow-screen treatment, wrap long labels, and keep controls large enough to operate.

For dense tables, use wrapped labels, grouped sections or a labeled, keyboard-accessible horizontal scroll region. Keep every required row and column reachable without page-level horizontal overflow; don't shrink text to force a fit. A subset needs an explicit selection rule, visible scope and omissions, and access to the complete values. Honor requests for all values without a subset.

Use semantic headings and table headers, descriptive links, readable contrast, and text alternatives for meaningful graphics. Preserve a logical keyboard and reading order. Never make color the only way to identify a value or status.

Questions belong in the document as numbered prompts or clearly described options. Tell the user to answer in chat using those numbers. Don't create a pretend working form, submit button, or claim that selections reach the agent. This package has no backend for form feedback.

## Preview before delivery

Render the final composed page at these CSS viewport sizes unless the request specifies others:

| Width x height | Themes |
| --- | --- |
| 375 x 812 | Light and dark |
| 1280 x 900 | Light and dark |

Record actual viewport dimensions, theme, browser version, screenshots and a PASS, FAIL or UNVERIFIED result for each check in all four combinations. Inspect captures and all scrolling content for missing content, page-level horizontal overflow, clipped labels and overlapping text. Tables need usable headers and reachable cells; any table scroll region needs a name and actual keyboard scrolling. Use keyboard input to reach links and operate meaningful controls, including applicable empty/error states.

Measure foreground/background contrast in both themes: normal text must reach 4.5:1 and essential graphical distinctions 3:1. Record measured ratios and colors. These are project acceptance thresholds, not a claim of complete accessibility compliance; appearance alone can't establish a pass. Mark inapplicable checks N/A with a reason, such as graphical contrast when no essential graphic exists.

Reload with network disabled and inspect request events: content and local controls must survive offline, with no outgoing document requests or required remote assets. After composition, confirm the full handoff is present and representations remain synchronized after any data-changing action. Reuse recorded data checks when inputs, transformations and values are unchanged; repeat affected checks when those change.

Use preview tools already available on the host. If rendering isn't available, state that visual preview remains unverified; don't claim a screenshot review or silently install a browser. Report that limit when handing off the file.

Review the source as well as the visible page. Inspect embedded datasets, SVG metadata, comments, hidden elements, scripts, and outgoing URLs. Remove credentials, personal details, internal addresses, and information unnecessary for the document. Don't load untrusted active content into a publication without reviewing it. Follow `SECURITY.md`, section "Page review"; its separate "Repository release review" applies to public repository pushes and package releases.

## Publish the artifact

The [publishing runbook](references/publishing.md) gives the Docker setup, reuse checks, publication commands, HTTP verification, and migration rules. Prefer its locally pinned built image with one persistent `omo-artifacts` service, an external store, host port `29004` mapped to `8080`, and restart policy `unless-stopped`. Keep that service running after delivery; remove short-lived publish containers with `--rm`.

The bundled CLI requires Node.js 24 or newer. Its direct command contract, from the installed package root, is:

```sh
node skills/hosted-artifacts/scripts/artifacts.mjs publish INPUT.html --slug lowercase-hyphenated-id --title TITLE
node skills/hosted-artifacts/scripts/artifacts.mjs serve
```

Replace the input filename, slug, and title with the document's values. Use a lowercase, hyphenated slug and quote titles containing spaces.

The operator must configure:

| Setting | Contract |
| --- | --- |
| `ARTIFACTS_DIR` | Required absolute store path outside the package, source root, and Git root. |
| `ARTIFACTS_BASE_URL` | Required for publication; a user-facing HTTP(S) origin without credentials, path, query, or fragment. Use `https://example.test` only as a documentation example. |
| `HOST` | Defaults to the local loopback interface. |
| `PORT` | Defaults to `29004`. |

For Docker, bind to all container interfaces and listen on `8080`, with an explicit host port mapping. Mount input read-only and the separate store writable. The image runs as `node`; prepare store ownership for that image's UID and GID without root runtime or `chmod 777`. Keep real reports, private inputs, store contents, and deployment configuration out of Git and package contents. Only authored, explicitly labeled synthetic fixtures and reference examples may ship as described in `SECURITY.md`.

Every publish creates an immutable revision. The latest page is at `/a/SLUG/`; a fixed revision is at `/a/SLUG/REVISION/`. The root catalogue derives its versions from the store. Existing revisions aren't overwritten. The server serves only known pages and routes and doesn't list directories.

The server has no authentication. Its operator controls access through the network or a proxy and must inspect pages before publication. Local page JavaScript can run; CSP restrictions on networking, forms, and frames don't establish that a page is safe.

## Deliver the result

Parse the CLI's JSON fields `latest` and `revision` exactly. Follow redirects and require HTTP 200, an HTML content type, and bytes or a hash matching the reviewed input before reporting publication success. Return a Markdown link using the actual verified URL. Use the revision URL for a stable reference and the latest URL for subsequent versions.

A base supplied by the user is evidence of the intended user network. Server-side HTTP checks verify the service, not the user's browser; state that limit without requiring another consent or browser confirmation for each publication. If the requested base fails while a LAN or loopback check succeeds, preserve the requested base and ask once to confirm the intended address or forwarding route. Don't silently replace it with a private fallback or declare delivery from agent-local HTTP alone. Don't invent a public URL or substitute a local path, `show_html_page`, or an agent-only address for the final link. If publication or verification fails, report the failure and mark URL delivery incomplete; an interim file attachment doesn't complete the default delivery.

For explicitly local or private material, deliver the file and required companions directly without publication. Report actual preview sizes and themes, check results, what remains unverified, and where the sources can be found. Keep follow-up answers in chat.
