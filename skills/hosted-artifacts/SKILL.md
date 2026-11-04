---
name: hosted-artifacts
description: Create standalone HTML or SVG reports, plans, comparisons, and question pages when a user asks for a visual document, an artifact, or a shareable page; preview it and publish only when requested.
---

# Hosted artifacts

Turn an answer into a document that can be read outside the chat. This skill is an original workflow adapter. It doesn't implement or port a Claude or Qwen feature.

Use it for reports, plans, comparisons, decision documents, and pages that organize questions. Keep short answers in chat when a separate document adds no value. Writing a page doesn't authorize publication.

## Build the document

1. Identify the reader, the question, and the decision the page should support. Use the request and available context before asking for missing information.
2. Keep facts traceable. Cite sources beside the claims they support, identify data dates and units, and distinguish observations, calculations, assumptions, and proposals. Don't invent a source or imply that an unchecked claim was verified.
3. Choose a compact structure with a clear title, readable sections, and a useful reading order. For comparisons, use a table when the differences are categorical. Apply `dataviz` when choosing a chart or table from data.
4. If `frontend` is installed, use it for layout and visual implementation. An installed `data-scientist` can handle data analysis. Read those skills before using them. Neither is required on another host: use available analysis tools and implement the page directly without installing a framework or analysis engine by default.
5. Produce a standalone HTML document or SVG. Inline the styles and graphics needed to read it offline. Avoid required remote fonts, scripts, CDNs, and image services. For CLI publication, embed SVG in HTML because the publisher accepts an HTML input.

A host theme or design system may be absent. Define local spacing, typography, colors, and light/dark theme defaults in the document itself. CSS variables should have usable values; optional host variables need fallbacks. Give tables a usable narrow-screen treatment, wrap long labels, and keep controls large enough to operate.

Use semantic headings and table headers, descriptive links, readable contrast, and text alternatives for meaningful graphics. Preserve a logical keyboard and reading order. Never make color the only way to identify a value or status.

Questions belong in the document as numbered prompts or clearly described options. Tell the user to answer in chat using those numbers. Don't create a pretend working form, submit button, or claim that selections reach the agent. This package has no backend for form feedback.

## Preview before delivery

Render the actual output at desktop and mobile widths, in both light and dark themes. Inspect all four combinations for overflow, clipped labels, unreadable contrast, missing content, and overlap. Check tables, links, keyboard navigation, and offline rendering where applicable.

Use preview tools already available on the host. If rendering isn't available, state that visual preview remains unverified; don't claim a screenshot review or silently install a browser. Report that limit when handing off the file.

Review the source as well as the visible page. Inspect embedded datasets, SVG metadata, comments, hidden elements, scripts, and outgoing URLs. Remove credentials, personal details, internal addresses, and information unnecessary for the document. Don't load untrusted active content into a publication without reviewing it. Follow the package's `SECURITY.md` before publication.

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

For Docker, bind to all container interfaces and listen on `8080`, with an explicit host port mapping. Mount a separate store outside the source tree. Keep actual reports, input data, store contents, and deployment configuration out of Git and package contents.

Every publish creates an immutable revision. The latest page is at `/a/SLUG/`; a fixed revision is at `/a/SLUG/REVISION/`. The root catalogue derives its versions from the store. Existing revisions aren't overwritten. The server serves only known pages and routes and doesn't list directories.

The server has no authentication. Its operator controls access through the network or a proxy and must inspect pages before publication. Local page JavaScript can run; CSP restrictions on networking, forms, and frames don't establish that a page is safe.

## Deliver the result

Check the actual URL returned by publication. Confirm that the configured base and network path work for the user, rather than assuming that an address reachable inside the agent's environment is sufficient. Send only user-reachable links. Use the revision URL when the user needs a stable reference and the latest URL when they need subsequent versions.

If user access can't be established, state the limit and use an available file attachment mechanism instead of presenting an internal address as a working link. Report what was previewed, what remains unverified, and where the sources can be found. Keep follow-up answers in chat.
