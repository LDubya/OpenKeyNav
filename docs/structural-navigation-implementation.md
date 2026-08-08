# Structural navigation implementation note

This note records the implementation choices for the optional structural focus
navigation mode described in `structural-navigation-mode-brief.md`.

## Existing facilities reused

- The main `OpenKeyNav` instance still owns public configuration, enabled state,
  and mode signals.
- The capture-phase key dispatcher remains the single keyboard entry point.
- Existing global enable/disable commands remain unchanged.
- Page focus moves through OpenKeyNav's shared, redirect-aware focus helper,
  which decorates only the settled page target. Heading and scrolling helpers
  are not reused because they temporarily create `tabindex="-1"` targets.
- One core `StatusService` owns both `emitNotification()` and structural status.
  Notifications remain assertive and transient; structural context changes
  update one persistent, scoped `role="status"`/`aria-live="polite"` channel.
  Exit clears that channel and emits one time-limited polite status in the same
  document, modal, element, or open ShadowRoot. Visible structural status uses
  the same optional OpenKeyNav branding as notifications, controlled by
  `notifications.displayToolName`.
- Structural status identifies the active structural, document/root, or typed
  context and reports the target's position. A heading-backed context reports
  its authored H1–H6 level; an unheaded context reports its one-based canonical
  hierarchy level, with the document or scoped root at level 1. Typed contexts
  are overlapping routes rather than tree nodes, so their status reports the
  corresponding level of the underlying structural context that Shift+Up/Down
  returns to. The persistent status does not name previous or next horizontal
  contexts; attempted boundary commands still report unavailable relationships.
  It reports applicable typed routes as a bounded count. `Shift+Escape` closes
  the visual surface without moving focus or disabling its visually hidden
  polite live updates. Escape-owning widgets keep that chord, and true mode
  re-entry restores the visible surface.
- Status messages are inserted as text by default. Only OpenKeyNav-owned markup
  explicitly passed with `trustedHtml: true` is interpreted as HTML.
- Composed-tree traversal, deep active-element lookup, generated-interface
  exclusion, and author-provided accessible-name extraction live in shared DOM
  and naming utilities rather than separate structural implementations.
- Structural navigation imports the reusable assigned-keylabel renderer from
  `src/keylabels.js`. Structural code supplies only target, symbol, and command
  assignments; the keylabel module owns overlay creation, existing placement,
  owner-scoped cleanup, and repositioning.

## Target discovery

The mode uses the pinned `tabbable` 6.5.0 dependency through
`src/tabbableTargets.js`. Browser discovery uses its `full` display check and
open-Shadow-DOM traversal. OpenKeyNav then excludes its own generated interface
and applies the optional application target filter.

The older `src/isTabbable.js` remains in place for click-mode discovery and
accessibility auditing. It is not used for structural destinations because its
viewport, occlusion, and audit behavior does not model the native Tab sequence.

`tabindex="-1"` elements are excluded by default. Applications can deliberately
set `includeProgrammatic: true`, with the documented consequence that the
resulting sequence is no longer the native Tab sequence. Unit tests use
`displayCheck: "none"` only because jsdom has no layout.

## Supported focus scopes

The default root is the current document. A topmost native modal `dialog`
constrains the root while it is modal. An application may supply a narrower
Element, Document, or open ShadowRoot (or a resolver returning one) for custom
focus scopes.

Open Shadow DOM is traversed and deep focus follows `shadowRoot.activeElement`.
Closed Shadow DOM is not pierced. An iframe is one atomic outer-document target
when `tabbable` considers the frame itself tabbable; frame contents are never
inspected by this mode. Popovers can contribute structure but are not
automatically treated as focus traps.

## Canonical structure

The model creates one root context and conservatively derives contexts from
operative landmarks, named regions, sections, articles, forms/search regions,
fieldsets, and semantic lists. Heading ranges use a rank stack within their
enclosing structural container. A section and its own heading share one context
instead of creating duplicate layers. Hidden ARIA semantics and suppressed
`none`/`presentation` roles do not create contexts, although a natively tabbable
descendant remains a target.

Each target receives one innermost direct structural context. Every context's
flattened sequence is filtered from the single global `tabbable` order.
Redundant empty/equivalent contexts are normalized, except that authored
heading levels remain selectable even when a child heading currently has the
same targets as its parent heading. Heading rank is retained on both
heading-defined contexts and semantic containers associated with headings.
Application structural contexts use stable IDs, explicit boundaries or members,
names, parent/order metadata, and may request that an otherwise redundant
context remain selectable.

A live focus target that wraps one or more headings belongs to the first
contained heading's context. This explicit ownership overrides ordinary heading
range-start ordering, since the ancestor target appears before its descendant
heading in composed traversal. It also prevents a malformed multi-heading
wrapper from being claimed by every contained heading.

Application-supplied typed contexts provide the required overlapping peer
extension. They use the same live target identities and declare stable ID, name,
type, ordered targets (or a resolver), provenance, and priority. Automatic
static-table row/column inference is intentionally deferred.

## State transitions

- Activation preserves focus and selects the focused target's direct context, or
  the root context when no known target has focus.
- Explicit previous/next target commands use the active structural flattened
  sequence or active typed sequence. They do not wrap. With no current target,
  next enters at the first item and previous enters at the last.
- Horizontal movement does not wrap. A heading-backed context traverses every
  nonempty heading-backed context with the same authored H1–H6 level in the
  active root, in document order, regardless of structural parent or inferred
  tree depth. An unheaded context uses only its structural siblings. Movement
  always enters the destination's first target.
- Broaden from a heading-backed H2–H6 selects the nearest preceding lower-level
  heading context in the authored outline and focuses its first target. This
  crosses generic-wrapper parent boundaries. Broaden from an unheaded context,
  or from an H1 with no authored outline parent, selects the immediate
  structural parent and retains focus. Narrow first selects the child on the
  current target's direct-context path and retains focus. When no such child
  exists, narrow scans forward without wrapping. From a heading-backed H1–H5 it
  finds the first nonempty H(n+1), regardless of inferred tree depth. From an
  unheaded hierarchy level n it prefers the first nonempty H(n+1), then falls
  back to an unheaded context exactly one canonical structural level deeper.
  The fallback activates that context and focuses its first target. H6 blocks
  only this forward fallback, not a real child containing the current target.
- Explicit peer-context commands cycle through structural routing and the
  applicable typed contexts. That typed ring wraps and changing typed peers
  retains focus. Typed cycling has no default keyboard binding; applications
  may configure commands or invoke `structuralNavigate('previousPeerContext')`
  and `structuralNavigate('nextPeerContext')` programmatically.
- An optional generated, `aria-hidden`, pointer-transparent box can follow the
  active context boundary or heading range. It is disabled by default and never
  enters target discovery or page focus.
- A heading range is capped by the nearest authored composed-DOM wrapper that
  groups that heading with a following exposed target, when that wrapper ends
  before the enclosing semantic context. This keeps final heading families
  from absorbing later sibling content without promoting generic wrappers into
  structural contexts.
- Exit removes mode state, observers, listeners, status, and any opt-in context
  box without blurring or moving the current page focus.

Native focus is authoritative. `focusin` synchronizes pointer, script,
assistive-technology, Tab, and other OpenKeyNav focus changes. A page focus
handler may redirect focus; the settled deep active target wins and OpenKeyNav
does not pull focus back.

## Keyboard ownership and precedence

Native Tab/Shift+Tab provide sequential focus. Applications assign bindings to
previous/next target commands or invoke them programmatically. The default
mapping uses Shift+Left/Right for same-level heading-backed contexts or true
siblings of unheaded contexts, Shift+Up/Down for broaden/narrow, `r` for entry
or toggle when character commands are available,
`Alt+r` for reliable exit, and `Shift+Escape` to dismiss the visible status when
Escape is available to the mode. Previous/next target and typed-context cycling
begin with empty bindings; bare arrows remain native. Applications declare
custom ownership with `ownsKey` or `data-openkeynav-key-owner`.

Tab, Shift+Tab, Enter, Space, bare arrows, and unconfigured modifier
combinations always pass through. Shift+Arrow context commands also pass
through for text editing, native selects, range/number inputs, radio groups,
and ARIA composite widgets. Holding the separately configured `Alt` override
invokes the structural arrow command deliberately. Once held, that override is
permitted as an extra modifier on configured structural arrow commands even
after focus leaves the widget, so continuous navigation does not require
releasing and pressing `Alt` again. Other extra modifiers remain exact.
Applications may declare ownership with `ownsKey` or the
`data-openkeynav-key-owner` hook.

## Structural keylabels

The default visual hints are `⇧←` / `⇧→` for previous / next horizontal
context and `⇧↑` / `⇧↓` for broaden / narrow. Each structural
label is attached only to a different target the command will focus. A
context-only broaden or narrow operation has no destination label. An arrow
hint is also omitted when the current widget owns the chord. The focused target
gets `↵` and/or `⎵` only for stable native activation semantics: links use
Enter, buttons and summaries use Enter and Space, and checkboxes/radios use
Space.
When focus is on a native HTML radio, the browser's own focus destinations get
bare-arrow hints: `←↑` on the previous group member and `→↓` on the next. A
two-radio group uses `↔↕` on its single peer. Select, range, and number controls
do not receive destination hints because their arrows change internal state
without moving DOM focus. Native arrow events remain unhandled.

Every hint is at most two Unicode symbols, and each target receives at most one
hint. One-symbol activation hints combine when both fit (for example `↵⎵`);
the shared renderer places a visual divider between them to mean “or.”
Two-symbol structural chords remain joined and atomic. Assigned structural
hints are visual, `aria-hidden`, and never add `data-openkeynav-label` to page
targets, so they cannot become Click Mode type-to-select destinations. The imported
renderer applies the standard keylabel target treatment through an owner-scoped
attribute and removes it with the overlays. Click, Move, and menu layers remove
the structural hints while they are in front; the mode signal restores them
through the imported keylabel renderer when the temporary layer closes. Exit
and teardown remove the owner-scoped overlays.
The renderer marks the label whose target is actively focused and colors it from
the configured focus-ring color. Its background is darkened only when necessary
to maintain at least 4.5:1 contrast with white text, while the existing thin
white keylabel outline remains in place. Destination labels retain the normal
palette.

`modesConfig.structuralNavigation.keylabels` enables structural and activation
hints by default and provides independent `tab`, `horizontal`, `vertical`,
`nativeArrows`, and `activation` switches. The `tab` group is on by default and
shows `⇥` and `⇧⇥` destination hints; setting it to `false` hides them.

An accepted structural command has precedence in OpenKeyNav's capture listener.
Native-owned keys, application-owned character commands, and unhandled system
shortcuts using Alt/Ctrl/Meta pass through untouched. Structural Navigation
remains active while the existing shortcut dispatcher runs heading,
heading-level, and scroll-region commands. Click Mode, Move Mode, and the
shortcut menu are temporary foreground layers: they own keystrokes until they
finish or are dismissed, then Structural Navigation resumes. The configured
Structural exit remains available while a foreground layer is active.
Unrecognized keys continue to the page. When two OpenKeyNav commands are
assigned the same chord, the explicitly configured Structural Navigation
command has precedence when no foreground layer is active.

## Invalidation and cleanup

A bounded MutationObserver watches relevant document and open-shadow changes.
`slotchange` also invalidates the model. Mutations only mark derived data dirty;
they never move focus. The next accepted command or focus synchronization
rebuilds once, preserves live element identities and stable context IDs, and
drops stale targets/memberships. OpenKeyNav-generated mutations are ignored.

Mode exit and global disable disconnect observers and focus listeners and release
model references. Repeated `init()` does not add duplicate key listeners.
Applications whose filters or context resolvers depend on non-DOM state can call
`invalidateStructuralNavigation()` to request the same lazy rebuild explicitly.

## Browser verification

The dedicated `demo/structural-navigation.html` fixture and Playwright suite
exercise real focus, native Tab continuation and activation, hierarchical and
typed routing, native widget ownership/override, modal scope, open Shadow DOM,
atomic iframes, offscreen focus reveal, focus redirects, dynamic mutation,
repeated activation/teardown, and status output. The repository currently
configures Chromium; additional engines require their Playwright browser
packages to be installed.

Structural Navigation moves real DOM focus when its configured events reach the
page. Test its commands alongside screen-reader browse and virtual-cursor modes,
which may consume arrow keys before page JavaScript receives them.

The peer-routing design takes inspiration from Mei et al., *Benthic:
Perceptually Congruent Structures for Accessible Charts and Diagrams* (ASSETS
2025). OpenKeyNav applies the idea to webpages through a canonical hierarchy
built from page semantics and overlapping routes supplied by testable
application relationships. Heading-backed horizontal routes follow authored
heading levels; evaluate the webpage adaptation independently.
