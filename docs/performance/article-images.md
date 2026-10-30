# Article image sizing comparison

Measured on October 30, 2026 with Chromium and fresh browser contexts on
`/posts/shading-motion/`. The baseline used the previous `120vw`/`75vw`,
quality-100 settings; the new settings were verified against the production
build. Figures retain their original layout;
the 2px frame border on each side accounts for the 4px difference between
the declared slot and the image's rendered width.

## Selected widths

Widths below are the `w` query parameter from `currentSrc`, before → after.
The browser selects from Next.js's existing width candidates; these are not
arbitrary new resize widths. Inline and fullbleed images share the article
column at viewports up to 850px. Above that, fullbleed sizing also accounts for
its configurable percentage, maximum width, and 700px minimum.

| Viewport    | DPR | Fullbleed rendered width | Fullbleed selected width | Inline rendered width | Inline selected width |
| ----------- | --- | ------------------------ | ------------------------ | --------------------- | --------------------- |
| 390 × 844   | 1   | 354                      | 640 → 384                | 354                   | 640 → 384             |
| 390 × 844   | 3   | 354                      | 1920 → 1080              | 354                   | 1920 → 1080           |
| 768 × 1024  | 2   | 659                      | 1920 → 1920              | 659                   | 1920 → 1920           |
| 850 × 900   | 1   | 659                      | 640 → 750                | 659                   | 640 → 750             |
| 851 × 900   | 1   | 696                      | 640 → 750                | 659                   | 640 → 750             |
| 1024 × 900  | 2   | 815                      | 1920 → 1920              | 659                   | 1920 → 1920           |
| 1440 × 900  | 1   | 996                      | 1080 → 1080              | 659                   | 1080 → 750            |
| 1440 × 900  | 2   | 996                      | 3840 → 2048              | 659                   | 3840 → 1920           |
| 1920 × 1080 | 2   | 996                      | 3840 → 2048              | 659                   | 3840 → 1920           |

## Encoded bytes and decoded dimensions

These are response body bytes with `Accept: image/avif,image/webp,image/*,*/*;q=0.8`,
and dimensions read from those responses, rather than density-corrected
`naturalWidth`. Responses were WebP. Headers and cache reuse are excluded.

| Image / viewport / DPR       | Bytes before → after | Decoded dimensions before → after |
| ---------------------------- | -------------------- | --------------------------------- |
| `motion-mask.png`, 390px, 1  | 20,260 → 5,956       | 640 × 342 → 384 × 205             |
| `motion-mask.png`, 390px, 3  | 63,164 → 22,972      | 1920 × 1026 → 1080 × 577          |
| `motion-mask.png`, 1440px, 1 | 35,276 → 22,972      | 1080 × 577 → 1080 × 577           |
| `motion-mask.png`, 1440px, 2 | 19,358 → 46,156      | 2286 × 1222 → 2048 × 1094         |
| `blob-buffer.png`, 390px, 3  | 14,126 → 10,226      | 1430 × 488 → 1080 × 368           |
| `blob-buffer.png`, 1440px, 1 | 19,896 → 7,116       | 1080 × 368 → 750 × 255            |
| `blob-buffer.png`, 1440px, 2 | 14,126 → 13,976      | 1430 × 488 → 1430 × 488           |

The CDN caps output at source dimensions and can return the compressed original
for an oversized quality-100 request. Consequently, smaller requested dimensions
can increase bytes: the desktop fullbleed example above saves decoded pixels but
costs about 27KB more. This change does not establish a first-paint, loading, or
decoding speed improvement.

## Quality and lightbox

Compared qualities 75, 90, and 100 on the frame-differencing and blob-buffer
diagrams, including small labels, numbers, thin grid lines, and arrows. Quality 75
visibly softened fine text; 90 kept the inspected labels legible at article sizes.
At the same 1080px width, the frame diagram used 14,204 / 22,972 / 35,276 bytes,
and the buffer diagram used 7,228 / 10,226 / 19,896 bytes, respectively.
The article default is 90, with per-image quality and inline sizes overrides.

The expanded image defaults to quality 100 and uses the smaller of 97dvw and
90dvh × aspect ratio. It mounts and loads eagerly only on opening. The already
loaded article image remains behind it until loading completes, including when
the high-quality request is delayed by one second.

Browser checks at 390px/DPR 3, 1440px/DPR 2, and 1920px/DPR 2 verified Enter to
open, Escape and the Close button to close, restored focus, and identical figure
bounds after closing. No figure-attributed layout shifts were observed before
or after the sizing change at the nine viewport/DPR combinations above. A second
article also verified a custom 55% fullbleed width and a portrait lightbox limited
by viewport height. Captions, frame aspect ratios, and shared-layout motion are
preserved.
