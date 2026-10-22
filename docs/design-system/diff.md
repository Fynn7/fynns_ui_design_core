# Read-only differences

`DiffView` is a single-file unified comparison; `DiffDialog` is its multi-file
reading window. Live examples: sandbox `#diff-view` and `#diff-dialog`.
Both render text safely and use the shared theme, scrollbars and overlay frame.

## Inputs

```tsx
import { DiffView, DiffDialog, type DiffFile } from "@fynns/ui";

const files: DiffFile[] = [{
  id: "settings", // unique and stable within this review
  path: "src/settings.ts",
  source: { kind: "text", before: previousText, after: currentText },
}];

<DiffView {...files[0]} maxHeight={320} />
<DiffDialog open={open} onOpenChange={setOpen} title="Review changes" files={files} />
<DiffDialog open={open} onOpenChange={setOpen} title="Review patch" patch={gitPatch} />
```

`DiffSource` accepts either `{ kind: "text", before, after }` or
`{ kind: "patch", patch }`. A standalone patch must contain one file;
`DiffDialog` accepts either `files` or a full multi-file `patch`, never both.
`previousPath` describes a rename. `language` overrides path-based syntax
inference; unknown languages remain plain monospace. Registered core highlight
languages also work. CRLF is normalized to LF for comparison; end-of-file
newline changes remain visible. This is a text review surface, not a byte diff.

Legacy `<DiffView lines={...} />` keeps its original rendering and caller-owned
prefixes. `lines` and `source` are mutually exclusive. Existing consumers do not
need to migrate to use the updated package.

## Reading behavior

The summary shows added/deleted line counts and a five-segment ratio. Dual old/new
line numbers and independent markers supplement red/green backgrounds. Syntax
colors are blended with theme text ink for readable contrast; actual changed
fragments receive a stronger background. Line numbers and markers cannot be
selected as content. Copy actions serialize a valid unified patch, including
no-final-newline markers, without UI labels. Mount `SnackbarHost` once for copy
success/failure feedback.

Three unchanged lines remain around each change; overlapping contexts merge.
Each hidden segment can reveal 20 more lines or all available lines. Patch-only
reviews explicitly identify missing source context; they cannot expand content
the patch does not contain. Wrap defaults to true. Disabling it enables horizontal
scrolling while keeping logical line numbers.

Previous/next controls cycle through change blocks, keep keyboard focus, and
expand the target file. A navigation window renders the target without mounting
all preceding rows; its Show all action returns to the beginning. Each file
initially renders at most 500 rows and adds 500 per Show more action.

## Dialog and state ownership

The viewport Dialog keeps its dimensions, head and feet stable while files open.
Its body is the sole vertical scroll host; per-file bodies only scroll
horizontally when wrapping is disabled. One file starts open, multiple files
start collapsed, and disclosures remain independent. Closing retains the last
open props for the exit animation; reopening resets uncontrolled reading state.

`expandedFileIds/onExpandedFileIdsChange` control file disclosures.
`wrap/defaultWrap/onWrapChange` control wrapping in either component. When
controlled, the consumer must update the corresponding value in its callback;
controlled values take precedence over reopen defaults. Replacing review data
should preserve stable IDs or remount the review for a fresh selection.

The default foot contains a ghost Close action. `feet` replaces it completely;
include an accessible dismiss action, use ghost Cancel and a single primary
confirmation at the right. The consumer owns saving, loading and failure state.
Wrap data fetching in `BusyRegion` and provide persistent request failures with
`InlineAlert`. Override any visible or accessible default through `labels`;
function entries format counts, positions and comparison errors.

## Boundaries and explicit states

- Text comparison is limited per file to 20,000 combined old/new lines and
  1,048,576 combined UTF-16 code units. Patch input uses the same character cap,
  a 20,000-line input cap and a 20,000-line combined available-side cap. Myers frontier work and comparisons share a
  1,000,000-step budget. Exceeding a limit shows an InlineAlert without partial
  comparison results.
- Inline comparison considers paired deleted/added lines up to 2,000 code units
  each, with 10,000 steps per pair and 1,000,000 steps per file. Unrelated or
  expensive pairs retain whole-line highlighting. Syntax and inline rendering
  wait until expansion; bounded line models are computed for exact summaries.
- Standard unified/git text patches, multiple hunks, file additions/deletions,
  quoted paths and no-newline markers are supported. Rename, file-mode/empty-file
  metadata and binary changes have explicit summary states. Combined merge diffs,
  malformed hunk counts and unsupported formats show per-file errors.
- No changes and no files use EmptyState. One invalid file does not prevent
  reading valid siblings. Copy all is disabled if any file failed, preventing a
  partial patch from appearing complete; valid individual patches remain copyable.

The first version provides no editing, merge resolution, selection/acceptance,
search, Worker or virtual scrolling. Do not add consumer `.fynns-*` CSS patches;
report reusable layout or reading defects in core.
