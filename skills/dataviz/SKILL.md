---
name: dataviz
description: Choose and build honest tables, charts, or offline SVG/HTML visuals when a user asks to visualize data, compare measurements, explain a trend, or select a visual encoding for a question.
---

# Dataviz

Start with the question a reader needs to answer. Choose an encoding that makes the relevant comparison visible and preserves what the data can support. This is an original workflow adapter, not a Claude or Qwen implementation or port.

## Establish the data contract

Identify the source, observation dates, population, units, and meaning of each field. Check whether rows are observations, aggregates, estimates, or forecasts. Record filters, missing values, duplicate handling, and any grouping or transformation used in the result.

Use existing analysis tools for computation. If `data-scientist` is installed, read it and delegate the analysis work to that workflow. Otherwise use the host's available tools. Don't install a new engine or chart framework by default. Keep the visual layer focused on presenting results, rather than introducing another computation system.

Verify the prepared values before drawing. Separate a real zero from missing data, distinguish totals from rates, and state the denominator for percentages. Never silently drop records or replace failed calculations with plausible values.

## Match the encoding to the question

| Reader's question | Useful starting point | Conditions |
| --- | --- | --- |
| What are the exact values? | Table | Show units and sensible precision. |
| How do categories differ in measured magnitude? | Bar or dot chart | Use comparable quantities and a meaningful order. |
| How does a value change over time? | Line chart | Preserve chronological spacing and expose missing intervals. |
| How are numeric observations distributed? | Histogram, dot plot, or box plot | Explain bins or summaries and retain sample size. |
| Do two numeric measurements vary together? | Scatter plot | Label units and avoid implying causation. |
| What parts make up a total? | Table or stacked bars | Verify that parts share a denominator and form a meaningful total. |
| Which option supports which feature or policy? | Comparison table | Categories and prose aren't quantitative scores. |

Treat this table as a starting point. Choose a simpler display when it answers the question more clearly. Don't turn categorical comparisons into fake quantitative charts by assigning invented scores, percentages, ranks, or bar lengths.

## Preserve meaning

- Label every axis with its quantity and units. State currency, time zone, normalization, and inflation basis when relevant.
- Start bar length encodings at zero. If a line or scatter plot uses a restricted range, make the range clear and explain why it serves the question.
- Keep scales consistent across panels intended for comparison. Disclose log scales, breaks, or independent ranges; avoid unexplained dual axes and decorative 3D.
- Name the aggregation, such as sum, median, or weighted mean, with its grouping interval and denominator. Don't average percentages without checking their weights.
- Show uncertainty when the source supports it. Label intervals and their meaning, give sample sizes where relevant, and distinguish forecasts from observations. Don't invent confidence bounds or imply certainty because no bounds were supplied.
- Use enough precision to answer the question. Avoid digits unsupported by the source and explain rounding when displayed totals differ.

Attach source references and transformation notes to the visual itself so they travel with exported files. Mark assumptions and data limits beside the claims they affect. An association alone doesn't establish a causal explanation.

## Make the result readable

Write a title that names the question or finding without overstating it. Prefer direct labels to a distant legend where space permits. Keep text legible at the intended viewing size and prevent long labels from being cut off.

Use color with labels, shapes, patterns, or line styles so meaning survives grayscale and color vision differences. Provide an accessible summary and a table or text equivalent for values needed to understand the result. For SVG, include a meaningful title and description and connect them to the graphic's accessible name.

Create offline SVG or standalone HTML with embedded graphics and styles. Define local spacing, typography, and light/dark colors; don't assume the host supplies them. An installed `frontend` skill can guide presentation but isn't a dependency on other hosts. Avoid required external scripts, fonts, or services.

An empty dataset should produce a readable explanation of the current filters and the absence of observations. Invalid or failed input should produce a clear error state that names what couldn't be computed. Don't show a blank plot, fabricated sample data, or a zero-valued chart as a substitute.

## Check and hand off

Compare plotted values and labels with the prepared analysis. Check units, aggregation, scale, missing values, and uncertainty against the source. Inspect the actual output at desktop and mobile widths, in light and dark themes, including legends, long labels, and empty or error states that apply.

Use existing preview tools. If visual inspection isn't available, say exactly what remains unverified. Never claim a rendered check from source inspection alone.

For a shareable report or publication, pass the finished visual and its source notes to `hosted-artifacts`. That workflow owns the page, privacy review, publication, and user-reachable links. Keep answers and follow-up questions in chat; this skill doesn't add a feedback backend.
