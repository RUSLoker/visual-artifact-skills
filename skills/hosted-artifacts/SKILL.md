---
name: hosted-artifacts
description: Create standalone HTML or SVG reports, plans, comparisons, and question pages when a user asks for a visual document, an artifact, or a shareable page; preview it and publish only when requested.
---

# Hosted artifacts

See the [worked synthetic examples](references/examples.md) for complete local reports, comparisons, questions and a distribution figure, with inputs, calculations and delivery checks.

Turn an answer into a document that can be read outside the chat. This skill is an original workflow adapter. It doesn't implement or port a Claude or Qwen feature.

Use it for reports, plans, comparisons, decision documents, and pages that organize questions. Keep short answers in chat when a separate document adds no value. Writing a page doesn't authorize publication.

The workflow that initiates the document owns final composition and final-page review. When that is `hosted-artifacts`, keep that ownership while using `dataviz` for a visual. Preserve the full handoff: visual files, accessible summary, complete values table or text equivalent, sources, dates, units, transformations, assumptions, limitations, and verification results. Embed required companions or deliver them together with working references; a missing companion table makes the handoff incomplete.

Only when publication is requested, check store configuration, service availability, and the user's network path early. Missing deployment prerequisites don't block an ordinary local document.

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

## Publish when requested

The bundled CLI requires Node.js 24 or newer. Run commands from the installed package root:

```sh
node skills/hosted-artifacts/scripts/artifacts.mjs publish INPUT.html --slug lowercase-hyphenated-id --title TITLE
node skills/hosted-artifacts/scripts/artifacts.mjs serve
```

Replace the input filename, slug, and title with the document's values. Use a lowercase, hyphenated slug and quote titles containing spaces.

The operator must configure:

| Setting | Contract |
| --- | --- |
| `ARTIFACTS_DIR` | Required absolute store path outside the package, source root, and Git root. |
| `ARTIFACTS_BASE_URL` | Required for publication; an HTTP(S) base reachable by the user. Use `https://example.test` only as a documentation example. |
| `HOST` | Defaults to the local loopback interface. |
| `PORT` | Defaults to `29004`. |

For Docker, bind to all container interfaces and listen on `8080`, with an explicit host port mapping. Mount a separate store outside the source tree. Keep real reports, private inputs, store contents, and deployment configuration out of Git and package contents. Only authored, explicitly labeled synthetic fixtures and reference examples may ship as described in `SECURITY.md`.

Every publish creates an immutable revision. The latest page is at `/a/SLUG/`; a fixed revision is at `/a/SLUG/REVISION/`. The root catalogue derives its versions from the store. Existing revisions aren't overwritten. The server serves only known pages and routes and doesn't list directories.

The server has no authentication. Its operator controls access through the network or a proxy and must inspect pages before publication. Local page JavaScript can run; CSP restrictions on networking, forms, and frames don't establish that a page is safe.

## Deliver the result

For requested publication, check the actual URL returned. Confirm that the configured base and network path work for the user; an agent-side HTTP success doesn't establish user reachability. Send only user-reachable links. Use the revision URL when the user needs a stable reference and the latest URL when they need subsequent versions.

If user access can't be established, mark link delivery incomplete and use an available file attachment mechanism instead of presenting an internal address as a working link. Local documents need no deployment: deliver the file and required companions directly. Report actual preview sizes and themes, check results, what remains unverified, and where the sources can be found. Keep follow-up answers in chat.
