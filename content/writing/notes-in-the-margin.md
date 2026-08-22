---
title: Notes in the margin
date: 2026-08-22
description: Every mark this site knows how to make — body type, asides, notices, redaction, quotes, lists, code, and images.
---

This page is a working sample, not an essay. Walk it when you change type, color, or a content component. The **description** above is the article lead — bold, then the body.

Ordinary copy sits in the column. You can *emphasize*, **stress**, or [link out](https://jaronpate.com). A thought that does not belong in the sentence can sit beside it. :margin-note[(A margin note. Wide screens put it in the right gutter. Narrow screens drop it under the paragraph.)] Parentheticals you can actually skip.

## Headings

`h2` and `h3` share one italic, muted style. Use them as section marks, not display type.

### A third-level mark

Still the same size and color. Hierarchy is the word, not the weight.

## Margin notes

Two notes in one stretch of text, so you can see them stack.

The first is a mutter. :margin-note[(First note — should sit next to this sentence.)] A little later, a second one arrives. :margin-note[(Second note. On a wide screen these should not collide with the column.)] Between them the column keeps moving.

```md
:margin-note[(like this)]
```

## Notices

A notice interrupts on purpose. It stays in the column.

::notice
**In-column.** Use this when the aside *is* the point for a minute. Navy, hard to miss, still inside the measure.
::

```md
::notice
**In-column.**
::
```

And when it needs to break the column:

::notice{bleed}
**Bleed.** Same idea, edge to edge. Save it for the one time in a piece you actually want to shout.
::

```md
::notice{bleed}
**Bleed.**
::
```

## Redaction

A span can be set in Redaction. `strength` is a grade: `0` is the clean face, `100` is almost gone. Other numbers snap to `0`, `10`, `20`, `35`, `50`, `70`, or `100`. Default is `35`.

```md
:redacted[these words]{strength="50"}
```

Same phrase, every grade:

- 0 — :redacted[the record is still intact]{strength="0"}
- 10 — :redacted[the record is still intact]{strength="10"}
- 20 — :redacted[the record is still intact]{strength="20"}
- 35 — :redacted[the record is still intact]{strength="35"}
- 50 — :redacted[the record is still intact]{strength="50"}
- 70 — :redacted[the record is still intact]{strength="70"}
- 100 — :redacted[the record is still intact]{strength="100"}

Inline, mixed into a sentence: the filing names :redacted[a person we will not repeat]{strength="20"}, then later :redacted[almost nothing remains]{strength="100"}.

**Bold around** :redacted[a redacted span]{strength="50"} should pick Redaction Bold.

## Blockquote

The pointing hand sits in the gutter. Use it for a quote, or a line you want pointed at.

> The best sticking point is the way using the thing *feels*. Everything else is infrastructure.

## Lists

Unordered, for a pile of equals:

- Plantin for reading
- Space Mono for the wordmark, footer, and code
- Redaction only where you ask for it

Ordered, when sequence matters:

1. Write the sentence
2. Park the mutter in a margin note
3. Redact what should stay almost-said

## Code

Inline: the helper is `resolveRedactionStrength`, and the shortcode is `:redacted`.

A block:

```ts
const grade = resolveRedactionStrength(strength);
const family = redactionFamily(grade);
```

## Image

A figure in the column. This is an old Edlink shot, just to see the matte and radius.

![Billing overview](/work/edlink/billing-overview.png)

---

That’s the set. Margin for a mutter. Notice for a point. Redaction when the words should still be there, barely. Everything else is ordinary prose.
