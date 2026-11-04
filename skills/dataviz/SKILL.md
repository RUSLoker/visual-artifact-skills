---
name: dataviz
description: Choose and build honest tables, charts, or offline SVG/HTML visuals when a user asks to visualize data, compare measurements, explain a trend, or select a visual encoding for a question.
---

# Dataviz

See the [worked synthetic examples](../hosted-artifacts/references/examples.md) for complete calculations and value equivalents, including the accessible [distribution figure](references/distribution.svg).

Start with the question a reader needs to answer. Choose an encoding that makes the relevant comparison visible and preserves what the data can support. This is an original workflow adapter, not a Claude or Qwen implementation or port.

## Establish the data contract

Identify the source, observation dates, population, units, and meaning of each field. Check whether rows are observations, aggregates, estimates, or forecasts. Record filters, missing values, duplicate handling, and any grouping or transformation used in the result.

Use existing analysis tools for computation. If `data-scientist` is installed and applies to the analysis needed, read it for guidance. Its presence doesn't require another agent or analysis system. Otherwise use the host's available tools. Don't install a new engine or chart framework by default. Keep simple answers simple and the visual layer focused on presenting results.

Verify the prepared values against the source before drawing, using checks suited to the transformation. Reconcile additive totals over the same population; for rates, recompute from source numerators and denominators rather than averaging percentages. Check weights, grouping keys, units, and row counts. For joins, establish the expected key cardinality and check unmatched records and row multiplication before aggregating. Multiple memberships mustn't count the same observation more than once in a population total.

Record excluded rows, their count and reasons, and how exclusions affect the population and denominator. Explain intended differences from source totals, such as filtering or normalization. Report unresolved discrepancies and mark affected results unverified. Agreement between a table and chart isn't proof when both use the same incorrect prepared data.

Separate a real zero from missing data, an unknown category, or an empty result. Distinguish totals from rates and state the denominator for percentages. Preserve declared time intervals even when observations are absent. Never silently drop records or replace failed calculations with plausible values.

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

Use color with labels, shapes, patterns, or line styles so meaning survives grayscale and color vision differences. Provide an accessible summary and a table or text equivalent containing all relevant values, units, and missing or unknown markers. Keep requested rows, columns, and full labels available; disclose any subset and its selection rule. For SVG, include a meaningful title and description and connect them to the graphic's accessible name.

Create offline SVG or standalone HTML with embedded graphics and styles. Define local spacing, typography, and light/dark colors; don't assume the host supplies them. An installed `frontend` skill can guide presentation but isn't a dependency on other hosts. Avoid required external scripts, fonts, or services.

An empty dataset should produce a readable explanation of the current filters and the absence of observations. Invalid or failed input should produce a clear error state that names what couldn't be computed. Don't show a blank plot, fabricated sample data, or a zero-valued chart as a substitute.

## Check and hand off

Compare plotted values and labels with the prepared analysis. Check units, aggregation, scale, missing values, and uncertainty against the source. Inspect the actual output at desktop and mobile widths, in light and dark themes, including legends, long labels, and empty or error states that apply.

For interactions already present, exercise each distinct data-changing action, such as a filter, sort, or selection. After each action, reconcile the active data with the source and check that any chart, values equivalent, summary, labels, and population or denominator notes describe the same current state. Reach an empty outcome where the interaction allows one; clear stale values and explain the active filters and absence of observations. Don't add controls just to perform these checks.

Use existing preview tools. If visual inspection isn't available, say exactly what remains unverified. Never claim a rendered check from source inspection alone.

Hand off the finished visual together with its accessible summary and full values equivalent, source references, transformation and exclusion notes, assumptions and limitations, and verification results. Record what was checked, the outcome, unresolved discrepancies, and anything left unverified. Keep these companions with the exported visual so a correct table or a qualification isn't lost during composition.

For a shareable report or publication, pass this complete bundle to `hosted-artifacts`. That workflow owns the page, privacy review, publication, and user-reachable links. Keep answers and follow-up questions in chat; this skill doesn't add a feedback backend.
