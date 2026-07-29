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
  context, reports the target's position, and gives the active canonical
  hierarchy level as a one-based number. The document or scoped root is level
  1. Typed contexts are overlapping routes rather than tree nodes, so their
  status reports the underlying structural level that Shift+Up/Down returns
  to. The persistent status does not name previous or next horizontal contexts;
  attempted boundary commands still report unavailable relationships. It
  reports applicable typed routes as a bounded count. `Shift+Escape` closes the
  visual surface without moving focus or disabling its visually hidden polite
  live updates. Escape-owning widgets keep that chord, and true mode re-entry
  restores the visible surface.
- Status messages are inserted as text by default. Only OpenKeyNav-owned markup
  explicitly passed with `trustedHtml: true` is interpreted as HTML.
- Composed-tree traversal, deep active-element lookup, generated-interface
  exclusion, and author-provided accessible-name extraction live in shared DOM
  and naming utilities rather than separate structural implementations.

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
- Horizontal movement does not wrap. True structural siblings are always
  peers, including siblings with mismatched authored heading ranks. A
  heading-backed context may additionally traverse any heading-backed context
  under a different parent when both contexts have the same canonical
  hierarchy depth, regardless of authored H1–H6 rank. An unheaded context uses
  only its structural siblings. Movement always enters the destination's first
  target.
- Broaden selects the immediate structural parent. Narrow first selects the child
  on the current target's direct-context path; both transitions retain focus.
  When no such child exists, narrow scans forward without wrapping for the first
  nonempty context exactly one canonical level deeper. From a heading-backed
  H1–H5 it additionally requires authored rank H(n+1), activates that context,
  and focuses its first target. H6 blocks only this forward fallback, not a real
  child containing the current target.
- Explicit peer-context commands cycle through structural routing and the
  applicable typed contexts. That typed ring wraps and changing typed peers
  retains focus. Typed cycling has no default keyboard binding; applications
  may configure commands or invoke `structuralNavigate('previousPeerContext')`
  and `structuralNavigate('nextPeerContext')` programmatically.
- A generated, `aria-hidden`, pointer-transparent box follows the active context
  boundary or heading range. It never enters target discovery or page focus.
- A heading range is capped by the nearest authored composed-DOM wrapper that
  groups that heading with a following exposed target, when that wrapper ends
  before the enclosing semantic context. This keeps final heading families
  from absorbing later sibling content without promoting generic wrappers into
  structural contexts.
- Exit removes mode state, observers, listeners, status, and the context box
  without blurring or moving the current page focus.

Native focus is authoritative. `focusin` synchronizes pointer, script,
assistive-technology, Tab, and other OpenKeyNav focus changes. A page focus
handler may redirect focus; the settled deep active target wins and OpenKeyNav
does not pull focus back.

## Keyboard ownership and precedence

Native Tab/Shift+Tab provide sequential focus. Previous/next target commands
remain configurable and programmatic but are unbound by default. The defaults
are Shift+Left/Right for true siblings plus heading-backed peers at equal
hierarchy depth regardless of authored rank, and Shift+Up/Down for
broaden/narrow; all bare arrows and typed-context cycling are unbound. `r`
enters or toggles the mode outside an editing/widget context.
`Alt+r` is the reliable default exit from any supported target. Bare Escape is
not an exit alias by default. `Shift+Escape` closes the visible status without
exiting structural navigation; it passes through when the focused widget or
application owns Escape.

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

The mode is a page JavaScript focus-navigation feature. A screen reader may
consume arrows in browse/virtual-cursor mode before the page receives them. The
implementation moves real DOM focus whenever its configured events reach the
page, but it does not claim to replace screen-reader browse navigation.

The peer-routing idea is inspired by Mei et al., *Benthic: Perceptually
Congruent Structures for Accessible Charts and Diagrams* (ASSETS 2025). That
work motivates the design; it is not evidence that inferred webpage structures
are equivalent to Benthic's explicitly authored graphical structures.
