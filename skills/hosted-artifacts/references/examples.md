# Worked synthetic examples

These are authored reference outputs built from explicitly synthetic inputs.
They are not real analysis, observed model outputs or evaluation results.
Open each file locally; no server, account, download or external asset is
required. Keep the HTML intact so its values, accessible equivalents and notes
travel with its visual. The SVG has a complete text equivalent below.

The examples use one local visual system: warm neutral surfaces, ink text,
teal data marks, serif headings, system body text and a 4 px spacing scale.
Each file embeds its own theme tokens and styles. Color is paired with
labels, positions or line styles; it never supplies the only meaning.

## Analytical report

Open [analytical-report.html](analytical-report.html).

**Request.** Explain a combined conversion rate, show a missing monthly
observation and let the reader inspect a year without leaving the document.
These are three independent synthetic populations, not parts of one total.

**Inputs.**

| Fixture | Complete synthetic input |
| --- | --- |
| Cohorts | A: 9 successes in 10 attempts. B: 10 successes in 100 attempts. |
| Monthly units | Declared period January–April 2026; January 100, February 120, March absent, April 90. |
| Yearly units | 2025: A = 10, B = 20. 2026: C = 5. No observations supplied for 2024. |

The fixture supplies no real observation dates, sample design or uncertainty
estimates. The month and year labels are synthetic calendar fields.

**Calculation and transformation.** Combine source counts before dividing:
`(9 + 10) / (10 + 100) = 19/110`, or `17.272727…%`. Display `17.27%`,
rounded to two decimal places. The denominator is 110 attempts; the cohort
rates of 90% and 10% cannot be averaged with equal weight.

Align the three monthly observations to the declared four-month calendar.
Retain March as missing. Do not insert zero, impute a value or connect a line
across the gap. No monthly observations are excluded.

For the year view, filter the three source rows by exact year and sum their
values. 2025 includes two rows, excludes one and totals 30 units; 2026 includes
one, excludes two and totals 5 units. 2024 includes none and excludes three.
It has no measured total. Selecting it clears the previous bars, values and
total, then explains how to return to an observed year.

**Encoding.** The cohort table preserves the denominators. The monthly line
uses equal chronological spacing and a labeled zero-to-120 units axis; only
January and February are connected. April is an isolated observed point.
An adjacent table gives all four intervals. The year bars start at zero and
keep a fixed 0–20 units scale. Direct labels, a current-year summary, complete
table and population notes describe the same selection. A native, visibly
labeled selector supports the keyboard. The default 2025 values remain
readable without JavaScript; changing the year needs local JavaScript.

**QA.** Independently recompute 19/110 from the two counts. Check monthly
positions and values against the input, including absent March. Select 2025,
2026 and 2024, then return to 2026 and 2025. Confirm the summary, table,
chart, accessible description, caption and included/excluded counts update
together. A 2026 summary still showing 30 is a failure even if its chart and
table show 5. The empty chart must actually disappear; a hidden-property
assignment alone does not establish that an SVG is hidden.

**Delivery.** Deliver the whole HTML file, including its source and
transformation notes and all tables. Its three sections must stay separate.
The illustration supports no causal explanation or population inference.

## Categorical comparison and dense table

Open [comparison.html](comparison.html).

**Request.** Compare the supplied categorical features, then preserve every
field and row in a separate dense synthetic dataset.

**Inputs.** Cedar has export = yes, offline = no, support = unknown.
Birch has export = no, offline = yes, support = yes. These names identify
fictional options. Unknown means the fixture does not establish the answer.

The dense fixture has exactly eight fields and 40 rows. Its deterministic
construction is:

```js
const rows = Array.from({ length: 40 }, (_, index) => {
  const i = index + 1;
  return {
    id: i,
    label: "Synthetic observation " + i + ": long descriptive label retained in full",
    region: i % 2 === 0 ? "North" : "South",
    segment: i % 3 === 0 ? "Research" : "Operations",
    status: i % 5 === 0 ? "Unknown" : "Observed",
    period: "2026-01",
    unit: "units",
    value: i
  };
});
```

**Calculation and transformation.** Categorical values are transcribed
without scores, ranks or percentages. All dense rows remain in source order;
no join, deduplication, top-N, hidden column or exclusion is applied.
Sum the value column: `1 + 2 + … + 40 = 40 × 41 / 2 = 820 units`.
The Unknown status on every fifth dense row is a categorical field; that
row's supplied numeric value remains part of the total.

**Encoding.** Use semantic tables because the first question concerns
categories and the second requires exact values. The dense table preserves
the full long label, wraps it within a deliberate column width and keeps
all eight columns in a named horizontal scroll region. Tab reaches the
region; arrow keys scroll it. The page itself should not overflow sideways.
Headers and the full values stay legible rather than shrinking to fit.

**QA.** Compare every categorical cell with the input, especially Cedar's
unknown support. Compare all 40 dense rows and all eight fields with the
construction above and independently sum values to 820. At phone width,
reach the last column with the keyboard, inspect the last row and confirm
the long labels wrap in full. Unknown must never silently become No.

**Delivery.** Deliver the complete HTML, including both tables, the total,
source, construction and limitations. The two datasets have no relationship;
the dense fixture is not evidence for choosing Cedar or Birch.

## Questions answered in chat

Open [questions.html](questions.html).

**Request.** Organize three synthetic document-planning questions so a reader
can answer in chat with numbered choices.

**Inputs.** A fictional planning exercise asks about the reader's priority,
the desired level of detail and the intended delivery. Each numbered prompt
provides lettered options with their meaning. No response is preselected.

**Calculation and transformation.** None. The options are authored prompts,
not observations or claims about a real reader. They are not weighted or scored.

**Encoding.** An ordered list gives the prompts a stable reading order;
descriptive option lists retain their letter identifiers. The page asks
the reader to send a reply such as `1B, 2A, 3A` in chat. It has no form,
submit button, captured selection or feedback backend.

**QA.** Check that prompts are numbered and each option is readable in both
themes at both widths. Confirm the response example matches valid options.
Inspect the page and source for accidental controls, submission endpoints,
network calls or claims that a page selection reaches the agent.

**Delivery.** Deliver the HTML as a reading companion and collect answers in
chat. Nothing is sent from the page.

## A small distribution

Open [distribution.svg](../../dataviz/references/distribution.svg).

**Request.** Show how one long synthetic duration shifts the arithmetic mean
away from the typical observation.

**Inputs and complete value equivalent.**

| Observation, source order | Duration (seconds) |
| --- | --- |
| 1 | 1 |
| 2 | 1 |
| 3 | 1 |
| 4 | 1 |
| 5 | 16 |

**Calculation.** The sample size is `n = 5`; sum = `20 seconds`;
median = the third sorted observation = `1 second`;
arithmetic mean = `(1 + 1 + 1 + 1 + 16) / 5 = 4 seconds`.
No weights, exclusions, bins, inferred intervals or rounding are used.

**Encoding.** A stacked dot plot preserves all five observations: four dots
at 1 second and one at 16 seconds. The horizontal axis is linear, in seconds,
and starts at zero. Stacking separates coincident observations and encodes no
second variable. A dashed median marker and solid mean marker have direct
labels and distinct line styles. The SVG's title and description name the
graphic and include the complete data and calculation.

**QA.** Count five dots, check their exact positions, inspect the accessible
name and description, and reconcile all labels with the values above. Check
the standalone SVG at both widths and themes. The mean is an exact sample
summary; no confidence interval or real-world timing claim is supported.

**Delivery.** Deliver the SVG together with this text equivalent and its
source/limit notes. For a page publication, embed the SVG and preserve the
equivalent in the HTML; the publisher accepts an HTML input.

## Verify a changed copy before delivery

These instructions describe checks to perform, not evidence that any future
copy has passed. Keep actual QA screenshots, assertions and results outside
the package.

1. Reconcile each representation directly with its synthetic input, including
   denominator, units, full labels, missing/unknown markers and empty states.
   Reuse data checks only while inputs and transformations stay unchanged.
2. Render at actual 375 × 812 and 1280 × 900 CSS viewports in light and dark.
   Inspect viewport, full content and scrolled-end screenshots. Confirm no
   page horizontal overflow, clipping or overlapping text. A named table
   region may scroll; every row, column and cell must remain reachable.
3. Measure normal text at least 4.5:1 and essential graphical distinctions at
   least 3:1 against their backgrounds in both themes. These are project
   acceptance thresholds, not a claim of complete accessibility compliance.
4. Use real keyboard input for the year selector and table scroll regions.
   Exercise every year, empty-to-populated return and repeated changes.
   Check accessible graphic names and complete values equivalents.
5. Disable browser networking, reload each file and inspect request events.
   Required content and local year changes must work with no outgoing
   document requests. Review embedded data, scripts and metadata for privacy.
6. Hand off the complete files and companions, source and transformation
   notes, limitations and actual PASS/FAIL/UNVERIFIED results. Use N/A with
   reasons for absent behavior, such as chart checks on the questions page.
   An artifact request defaults to publication through `hosted-artifacts`;
   explicitly local requests and private material stay local. Creating an
   unsolicited file does not authorize publication.
