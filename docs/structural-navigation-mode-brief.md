# Structural Focus Navigation for OpenKeyNav

## Product and implementation brief

This brief defines an optional OpenKeyNav mode that lets people navigate among the page's existing keyboard-focus targets through authored semantic structure instead of only through the browser's flat Tab sequence.

It defines observable behavior, compatibility requirements, scope boundaries, and acceptance criteria. It intentionally does not prescribe filenames, class names, public option names, or an internal graph representation. The implementer must inspect the checkout being changed and integrate with its current conventions.

## Executive intent

The browser's sequential focus order is useful but flat. A page may also express:

- Landmarks and named regions.
- Sections and heading levels.
- Forms, fieldsets, lists, and other nested groups.
- Occasionally, overlapping ordered groupings such as a table row and column or an application-defined peer group.

OpenKeyNav should expose useful routes through that structure while preserving the behavior people already expect from keyboard focus.

The non-negotiable contract is:

> A navigation command that changes the selected item moves actual focus directly to another existing page focus target. Structural contexts guide routing but do not become substitute focus stops.

Changing only the active routing context may leave focus on the current target. The mode must never require a preliminary Tab sweep, crawl the page, replay interactions, create a virtual copy of the page, or focus a generated navigation proxy.

## Product principles

1. **Real focus is authoritative.** The selected item is the page element that actually has focus.
2. **Tab remains native.** This feature supplements, rather than replaces, sequential focus navigation.
3. **Semantic hierarchy is the normal case.** Ordinary nesting is represented as a tree, not mischaracterized as multiple parentage.
4. **Typed overlap is exceptional.** Multiple peer contexts are used only when page semantics or application configuration credibly express them.
5. **Native widgets keep their interaction model.** OpenKeyNav must not compete with controls that already own arrow keys, Escape, Enter, or Space.
6. **No autonomous interaction occurs.** The mode moves only in response to an accepted user command.
7. **Supported scope is explicit.** Document Shadow DOM, iframe, platform, and assistive-technology coverage and describe behavior or integration paths for cases outside it.

## Scope

### Required core capability

The first complete release must provide:

- Target discovery without pressing Tab.
- A deterministic structural context tree.
- Previous and next target movement within an active context.
- Previous and next horizontal-peer movement using authored heading-level lanes;
  unheaded contexts have no invented horizontal lane.
- Rank-based broaden, narrow-on-path, and page-forward next-level changes,
  including entry from unheaded routes.
- Native Tab, Shift+Tab, Enter, Space, and widget behavior.
- Real-focus synchronization after keyboard, pointer, script, and OpenKeyNav focus changes.
- Correct behavior on dynamic pages.
- A public extension point for application-supplied structural and typed contexts.
- Visible and assistive-technology-accessible context status.
- Real-browser verification of the complete interaction.

### Optional or staged capability

The model must allow typed overlapping contexts, but automatic inference of every possible non-tree relation is not required for the first release.

The following may be staged:

- Automatic row and column contexts for static data tables.
- Same-origin iframe traversal beyond treating the iframe as one page target.
- Closed Shadow DOM integration supplied by a host application.
- Specialized context adapters for domain-specific applications.

If any staged capability is shipped, its corresponding acceptance criteria in this brief become mandatory.

## Non-goals

This feature is not:

- A session recorder or replay system.
- An automatic keyboard-interaction mapper.
- A website crawler or route navigator.
- An accessibility conformance checker.
- A repair mechanism for invalid page semantics.
- A replacement for browser Tab behavior.
- A replacement for a screen reader's browse or virtual-cursor navigation.
- A second focus system made from generated OpenKeyNav controls.
- A mechanism for taking over the internal keyboard behavior of composite widgets.
- A promise to inspect inaccessible cross-origin documents or closed component internals.

OpenKeyNav may report an authoring problem it encounters, but navigation and auditing must remain separate responsibilities.

## Terminology

### Focus target

A focus target is an existing page element that participates in the active scope's sequential focus order.

By default, programmatic-only elements such as `tabindex="-1"` are not structural-navigation destinations. A separate opt-in may include them, but doing so changes the native-Tab compatibility contract and must be documented.

One live element has one target identity. It is never duplicated merely because it belongs to several contexts.

### Structural context

A structural context is a semantic grouping placed in one canonical ordered tree for navigation. Examples include a landmark, heading-defined section, form, fieldset, or list.

A context is routing metadata. It is not a focus target unless its page element independently belongs to the sequential focus order.

### Direct context

Every discovered target is assigned to one innermost structural context. That is its direct context. The target also belongs transitively to every ancestor of that context.

### Flattened target sequence

The flattened target sequence of a structural context contains every discovered target whose direct context is that context or one of its descendants. It is filtered from the active scope's global target order, so it preserves expected sequential-focus ordering.

This definition is deliberate:

- A narrow context confines previous and next movement to a small group.
- A broader context permits movement across its descendant groups.
- Broadening changes the available range without duplicating any target.

### Typed context

A typed context is an ordered peer grouping that overlaps the structural tree. Examples may include a table row, table column, or explicit application group.

Typed contexts are not inferred from arbitrary references. A label, description, ordinary hyperlink, or `aria-controls` relationship does not automatically create a navigation group.

### Active context

The active context determines the sequence used by previous and next commands.

The active context may change while focus remains on the same target. This is a routing-state change and must be announced without manufacturing another focus stop.

### Active navigation root

The active navigation root is the DOM scope from which targets and structural contexts are currently derived. It is normally the document, but may be a modal dialog or an application-supplied focus scope.

### Deep active target

The deep active target is the actual focused element after following accessible open Shadow DOM focus from the document's `activeElement`. Iframes are handled according to the explicit scope policy below.

## Conceptual model

The required model is not “the page is a hypergraph.” It is:

1. A canonical structural tree used for parent/child navigation, plus authored
   heading levels that define lateral lanes for heading-backed contexts.
   Unheaded contexts use true structural siblings for lateral movement.
2. Zero or more typed ordered groups that may overlap that tree.
3. One identity for each real focus target.

For example:

```text
Document
├── Header
│   └── Search form
│       ├── Search input
│       └── Search button
└── Main
    ├── Filters
    │   └── Availability fieldset
    │       ├── In-stock checkbox
    │       └── Preorder checkbox
    └── Results
        ├── Product A link
        └── Product B link
```

The Search button's membership in the Search form and Header is a single ancestor path, not multiple parentage.

A genuine typed overlap might be:

```text
Current target: Review button in a data-table cell

Structural path: Document > Main > Orders table
Typed context:  Order 1042 row
Typed context:  Review-status column
Typed context:  Application-supplied pending-actions group
```

The target remains the same element while the active peer context changes.

The implementation may use arrays, paths, maps, trees, graph indexes, hyperedges, or another representation. The user-facing behavior, not the data-structure name, is normative.

## Relationship to Benthic

This feature is informed by:

- Catherine Mei, Josh Pollock, Daniel Hajas, Jonathan Zong, and Arvind Satyanarayan. *Benthic: Perceptually Congruent Structures for Accessible Charts and Diagrams*. ASSETS 2025.
- Paper: <https://vis.csail.mit.edu/pubs/benthic.pdf>
- DOI: <https://doi.org/10.1145/3663547.3746342>

Benthic demonstrates traversal through ordered adjacent groups, child relationships, and multiple available parent contexts. OpenKeyNav adapts those ideas to existing webpage focus targets.

Treat the transfer as a design hypothesis. Benthic evaluates explicitly authored graphical structures and a dedicated traversal interface; validate OpenKeyNav's webpage adaptation independently. OpenKeyNav must therefore:

- Prefer the simpler structural tree when semantic containment is hierarchical.
- Use multiple peer contexts only when their provenance is credible.
- Keep context as routing state rather than generated page focus.
- Test the webpage interaction independently instead of treating Benthic's evaluation as validation of this adaptation.

## Target discovery

### Preferred foundation: `tabbable`

Before implementing new focusability logic, evaluate and preferably use the maintained [`tabbable`](https://github.com/focus-trap/tabbable) package.

It already provides ordered target discovery and handles many browser details, including:

- Native focusable controls and links.
- Explicit `tabindex`.
- Disabled controls and disabled fieldsets.
- Radio-group behavior.
- Closed `details` content.
- `inert` ancestors.
- Visibility and display checks.
- Positive-`tabindex` ordering.
- Optional open Shadow DOM discovery.

If adopted:

- Pin the resolved version through the project's normal lockfile.
- Wrap it behind a small OpenKeyNav-owned boundary so scope selection, generated-UI exclusion, and future replacement remain local.
- Use its real-browser display behavior in browser tests.
- Account for its documented jsdom limitations in unit tests.
- Do not run layout-forcing discovery on every ordinary arrow command.

If it is not adopted, the implementation proposal must identify the concrete unmet requirement and demonstrate equivalent browser coverage. A new selector-based or audit-oriented tabbability approximation is not an acceptable default.

### Default target policy

Discover targets within the active navigation root without sending keyboard events.

Include elements the selected `tabbable` policy considers sequentially focusable, including valid offscreen elements. “Offscreen” does not mean hidden: a rendered target outside the viewport remains eligible and may be reached by direct focus.

Exclude:

- Disabled or effectively inert targets.
- Targets hidden by browser rendering rules.
- Targets in collapsed native content that cannot currently receive focus.
- Programmatic-only negative-`tabindex` targets, unless explicitly opted in.
- OpenKeyNav's own generated toolbar, labels, notifications, and other interface.
- Stale or disconnected elements.

Do not exclude a target solely because it or an ancestor has `aria-hidden="true"`. That attribute affects accessibility exposure, not native focusability. If such an invalid combination is encountered:

- Preserve native-focus compatibility.
- Avoid claiming that hidden accessibility semantics are available.
- Optionally report the authoring defect through a separate audit/status channel.

### Target order

The global target order must be the order returned by the selected tabbability implementation after the documented OpenKeyNav-owned exclusions and application filter are applied.

The brief acknowledges unavoidable browser and platform differences, including user preferences such as macOS Safari's handling of links. Documentation must describe known differences rather than claim exact reproduction of every user's Tab sequence.

Native Tab remains the final authority. OpenKeyNav must synchronize to where focus actually goes.

## Active navigation root and focus scopes

### Document scope

When no narrower focus scope applies, the document is the active navigation root.

### Modal dialogs

When a native modal dialog is active, navigation must remain inside the topmost modal dialog. The implementation must respect effective browser inertness, not merely the presence of a literal `inert` attribute.

Opening or closing a modal invalidates derived targets and contexts.

### Popovers and application overlays

An open popover may be represented as a structural context. It is not automatically a focus trap.

Applications must have an extension point for supplying a narrower active root when they implement a custom modal or focus trap that cannot be inferred reliably.

### Shadow DOM

Open Shadow DOM is part of the core scope when the browser exposes the shadow root. Configure the adopted target-discovery mechanism to traverse it rather than silently omitting its focus targets.

Requirements when supported:

- Discover open-shadow targets in composed focus order.
- Follow `shadowRoot.activeElement` to identify deep focus.
- Use `event.composedPath()` for key-ownership decisions.
- Observe relevant `slotchange` or invalidation signals.

Closed Shadow DOM is not inspectable unless the component or application deliberately supplies access. Do not infer or pierce it. Treat a host as a target only if it independently qualifies.

### Iframes

For the required core behavior, an iframe is an atomic page target when the browser and target-discovery policy consider it tabbable.

- Do not attempt to inspect cross-origin contents.
- Native Tab may enter and leave the iframe normally.
- Structural navigation outside the frame treats the iframe as one target.
- Same-origin recursive traversal may be added later but requires a separate focus identity, event, lifecycle, and coordinate policy.

Evaluate `document.activeElement` within the active document scope and represent an iframe as its outer-document atomic target.

## Structural context derivation

### Canonical tree

For predictable commands, derive one canonical structural context tree per active navigation root.

The web platform does not expose one universal semantic tree. Constructing a canonical navigation tree is therefore a product decision. The implementation must follow these rules rather than combining unrelated hierarchies opportunistically.

Build and normalize that tree deterministically:

1. Create one root context for the active navigation root.
2. Derive candidate contexts from the conservative sources below. Ignore native semantics explicitly suppressed with `role="none"` or `role="presentation"` unless an independently valid role or application-supplied context applies.
3. Give each candidate a composed-DOM boundary or an application-supplied membership boundary. Its structural parent is the nearest accepted candidate that contains that boundary.
4. Merge candidates that describe the same boundary instead of nesting duplicates. Prefer an application-supplied stable identity and name, then an explicit container's semantic identity, while allowing its associated heading or legend to provide the label.
5. Reject or separately report automatically inferred ranges that overlap without containment; do not force them into the tree. A non-tree relation is available only through a credible typed-context adapter.
6. Order sibling contexts by their boundary in composed document order. Application-supplied contexts that cannot provide a deterministic position must provide an explicit order.
7. Normalize redundant unary layers: collapse a context when it has the same
   flattened targets as its parent, has no nonempty structural sibling,
   contributes no distinct typed relationship, and is not explicitly marked by
   the application as a context the user must be able to select. Never collapse
   an authored heading level merely because it currently has the same targets
   as its parent; each real heading level remains selectable for parent/child
   heading-level movement.

These rules prevent the same authored section or heading from appearing repeatedly under slightly different inferred identities.

When a real focus target contains one or more authored headings, assign that
target to the context of the first contained heading in document order. The
focus target may precede the heading node in traversal order because it is the
heading's interactive wrapper. For example, focus on `<a><h2>Title</h2></a>` is
focus in the H2 context. If one focus target contains both H2 and H3, the H2
owns that target; the later H3 does not also claim it.

### Context sources

Infer contexts conservatively from:

- The active root.
- Native and ARIA landmarks.
- Named regions.
- `section` and `article` elements.
- Heading-defined sections.
- `form` and `search` regions.
- `fieldset` and `legend`.
- `ol`, `ul`, and semantic list structures.
- Non-interactive table containers when table support is enabled.
- Explicit application-supplied contexts.

Only exposed, semantically operative containers are automatic context sources. Do not use an ARIA role or accessible name from inside an `aria-hidden="true"` subtree as though assistive technology could perceive it. A natively tabbable descendant remains in the target inventory for native-focus compatibility, but assign it to the nearest credible context outside that hidden semantic subtree and report the authoring defect separately if auditing is enabled.

Treat composite widgets such as menus, tablists, listboxes, trees, toolbars, radio groups, grids, and treegrids as atomic boundaries for outer structural navigation. OpenKeyNav may recognize the widget as a context but must not replace its internal author-provided focus management.

### Contexts that must not be inferred automatically

Do not create a structural or typed context solely from:

- A generic `div` or `span`.
- Visual position, color, proximity, or CSS class names.
- `aria-label` or `aria-labelledby` without an independently meaningful container.
- `aria-describedby`, `aria-details`, or `aria-errormessage`.
- `aria-controls`.
- An ordinary hyperlink.
- A shared accessible name.
- Repeated text.
- An element's membership in several nested ancestors.

Do not automatically use `aria-owns` to rewrite the structural tree in the first release. ARIA ownership can differ from DOM ancestry and can affect accessibility ordering without changing browser sequential-focus order. Support may be added only with explicit precedence, validity, and ordering rules.

### Heading-defined contexts

Within each enclosing structural container:

1. A heading begins a heading-defined context.
2. Lower-level subsequent headings become descendants.
3. A heading at the same or higher rank closes the preceding heading context as necessary.
4. Skipped levels attach to the nearest preceding lower-rank heading rather than creating phantom levels.
5. Heading scope never crosses the boundary of its enclosing structural
   context. Within that context, the nearest authored composed-DOM wrapper
   that groups the heading with a following exposed target may cap the range
   earlier. An immediately following sibling branch that begins another
   authored heading or semantic context also caps the range, even when that
   heading has a deeper rank. The wrapper bounds membership and the visual
   indicator without becoming an additional structural context merely because
   it is a generic `div` or `span`.
6. When an explicit sectioning element and its own heading describe the same range, collapse them into one context instead of producing duplicate nested contexts.

Use `h1` through `h6` rank for native headings and a valid `aria-level` for an element with `role="heading"`. Ignore malformed or missing rank information rather than inventing a level.

Heading elements provide names and boundaries. They do not become focus targets unless the page already made them sequentially focusable.

### Lists

A semantic list is a structural context. Create focus-bearing direct list items as child contexts when at least two items are nonempty and at least one of those items contains multiple targets or a nonempty descendant context. When every nonempty item reduces to exactly one target, keep those targets directly in the list's flattened sequence; item contexts would only duplicate previous/next movement.

Empty items never become navigable contexts. Apply the canonical-tree normalization rule to collapse any other equivalent redundant layer.

### Context names

Use the strongest author-provided semantic label available, such as:

- A heading associated with the section.
- A `legend`.
- A table `caption`.
- A valid accessible name for a landmark or group.
- A stable application-provided name.

If no useful name is available, use a concise role/type fallback. Do not expose selectors or long text excerpts as ordinary user-facing context names.

### Direct target assignment

Assign each target to the innermost applicable structural context in the canonical tree. If none exists, assign it to the root.

Then compute each structural context's flattened sequence by filtering the global target order to targets assigned anywhere in that context's subtree.

Contexts with no target in their flattened sequence are not navigable
destinations. Horizontal context movement skips them.

## Typed overlapping contexts

### Provenance requirement

A typed peer context must come from one of:

- Explicit application configuration.
- A well-defined native semantic adapter with documented membership and ordering.
- Another source whose grouping, membership, and order are unambiguous and testable.

Each typed context must provide:

- A stable identity.
- A concise name and type.
- An ordered list or resolver for live focus targets.
- A provenance description suitable for debugging.
- A way to determine whether it still applies after DOM changes.
- A deterministic priority or registration order among other typed contexts applicable to the same target.

### Required extension point

Applications must be able to contribute typed contexts without duplicating target elements or replacing OpenKeyNav's core focus logic.

The public shape should follow the current project's configuration conventions. This brief requires the capability, not a particular option name or callback signature.

### Static table adapter

Automatic table contexts are optional for the first release.

If implemented:

- Apply them to semantic static data tables, not layout tables or presentational tables.
- Map descendant focus targets through their containing cells.
- Define behavior for cells with no targets or several targets.
- Respect `rowspan`, `colspan`, row groups, column groups, and applicable headers.
- Include a target at most once in any one row or column context.
- Handle nested tables without leaking inner targets into outer cell groups incorrectly.
- Keep the underlying target's structural context and identity unchanged.

Interactive `grid` and `treegrid` widgets are not handled by this adapter. Their existing arrow-key and focus-management contract remains native to the widget.

### Typed-context command behavior

Typed contexts are peer routing choices, not additional structural parents.

When the current target belongs to one or more typed contexts:

- Form an ordered ring containing structural navigation followed by the applicable typed contexts in their declared priority or registration order.
- Explicit previous- and next-typed-context commands cycle through that ring
  and wrap at its ends. Target and horizontal context movement do not inherit
  this wrapping behavior.
- Changing the active peer context retains current focus.
- Previous and next use the active typed context's explicit order.
- Structural vertical and horizontal commands leave the typed route. Vertical
  commands operate on authored heading ranks; horizontal commands use the
  semantic-region route in native focus order.
- Returning to structural navigation selects the innermost structural context containing the current target.

Typed contexts have no heading level of their own. Status reports the authored
heading level of the underlying direct context when one exists and otherwise
does not invent one. Shift+Up/Down returns to that underlying structural route
before applying the rank-based command.

Typed-route cycling is an explicit extension command and has no default key binding. If no typed context applies, it reports the boundary and does nothing.

## Navigation commands

Define relationship commands independently of their key bindings:

1. Previous target in the active context.
2. Next target in the active context.
3. Previous semantic region in native focus order.
4. Next semantic region in native focus order.
5. Broaden to the closest available shallower authored heading rank. From an
   unheaded context, enter the deepest authored level present.
6. Narrow to the closest available deeper authored heading rank on the current
   target's path, or advance to the next qualifying context at that rank when
   the path has none. From an unheaded context, enter the shallowest authored
   level present.
7. Previous applicable peer context.
8. Next applicable peer context.
9. Previous or next context start, unbound by default, using the same semantic
   region route as horizontal movement.
10. Exit the mode without OpenKeyNav moving focus.

### Proposed default bindings

Integrate with OpenKeyNav's configurable shortcut system. A reasonable initial mapping is:

| Key | Relationship command |
| --- | --- |
| `Shift+Tab` / `Tab` | Native browser sequential focus; not intercepted |
| `Shift+ArrowUp` | Move to the closest available shallower authored heading rank |
| `Shift+ArrowDown` | Move to the closest available deeper authored heading rank |
| `Shift+ArrowLeft` | Previous semantic region in native focus order |
| `Shift+ArrowRight` | Next semantic region in native focus order |
| Application-configured command | Previous or next target in active context |
| Application-configured command | Previous or next context start |
| Application-configured command | Previous or next applicable typed context |
| Configured mode-exit command | Exit and preserve current focus |

Bare `Escape` may be a convenient exit alias only where it does not override a page or widget interaction described below.

Route these proposed defaults through the existing public key configuration. Resolve conflicts with established OpenKeyNav shortcuts deliberately and document the resulting mapping.

## Exact command semantics

### Activation

Activating the mode:

- Does not blur or move meaningful current focus.
- Discovers or lazily prepares the active root.
- Synchronizes to the current deep active target if it is known and selects that target's direct structural context.
- Uses the root structural context if no known target currently has focus.
- Announces activation and active context without taking focus.

The mode does not require the user to Tab through the page first.

### Previous and next target

Use the active context's ordered target sequence.

- Do not wrap by default.
- If the current target is in the sequence, move to its immediate predecessor or successor.
- If no known target has focus, “next” moves to the first target and “previous” moves to the last target.
- If the sequence is empty, do not move.
- At a boundary, keep focus in place and announce the boundary.
- A movement within a broadened structural context does not automatically narrow the active context when the destination belongs to a descendant.

### Previous and next horizontal context

Build the horizontal route from the direct semantic context of each target in
native focus order. Collapse consecutive targets that share the same direct
context into one stop. Include headed and unheaded landmarks, named regions,
sections, articles, forms/search regions, fieldsets, semantic lists, and
configured application regions. Page/root targets may form a route stop where
no narrower semantic context applies.

Horizontal movement does not wrap. At the first or last semantic region in the
route, keep focus and context unchanged and announce the boundary. Heading rank
does not filter or reorder this route.

When moving horizontally, use the first target in the destination's flattened
target sequence. Previous focus history does not change the entry point.

Set the destination as the active structural context. Never focus the context
container merely to announce it.

Do not invent “structurally corresponding” targets through text similarity or positional heuristics.

### Broaden to parent

For a heading-backed H2–H6 context, scan backward in document order to the
nearest preceding heading-backed context with a lower authored level. Activate
that authored outline parent and focus the first target in its flattened
sequence. In well-ranked content, an H3 therefore broadens to its governing H2
even when generic DOM wrappers gave the two contexts different inferred
parents.

For a context not associated with any heading, enter the last nonempty context
at the deepest authored level present and focus its first target. The unheaded
context remains unheaded; neither DOM ancestry nor semantic-container nesting
supplies a numeric rank.

At the root, do nothing and announce the boundary.

### Narrow to child

If the current target's direct-context path passes through an immediate child of the active context, activate that child and keep focus unchanged.

If no immediate child contains the current target, narrowing uses a page-forward
fallback rather than selecting an arbitrary child of the active context:

- Scan contexts after the active context in document order. Do not wrap.
- Skip contexts with no focus targets.
- When the active context is heading-backed H1–H5, require the closest available
  deeper authored rank, regardless of generic DOM wrappers.
  Semantic regions associated with headings use their inherited level. This
  prevents an H2 command from entering an unrelated unheaded context or an H5
  merely because it appears before an available H3 or H4.
- When the active context is unheaded, enter the first nonempty context at the
  shallowest authored heading level present. Do not derive a starting rank from
  DOM ancestry or semantic-container nesting. Another command continues from
  that newly active authored rank.
- Activate the first qualifying context and focus the first target in its
  flattened sequence.
- H6 is the boundary for this page-forward heading fallback. It does not block a
  real immediate semantic child containing the current target.
- If no qualifying context exists, retain focus and context and announce the
  boundary.

This keeps broaden followed by in-path narrow reversible while the same target
remains focused, while still letting Shift+Down progress through authored
heading levels when the active focus path has no deeper context.

### Alternate peer context

When one or more credible typed contexts apply to the current target, an explicit typed-route command cycles among those contexts plus the route back to structural navigation.

Typed-route commands have no default key binding. Applications may configure bindings or invoke them programmatically without replacing the four default structural Shift+Arrow relationships.

Previous- and next-target relationship commands likewise have no default key
binding. Native Tab and Shift+Tab provide ordinary sequential focus; an
application may invoke target commands explicitly for a specialized route.

Previous- and next-context-start commands expose the horizontal semantic-region
route programmatically and likewise have no default binding. If an application
configures those commands, the configured chords are independent of the
arrow-ownership override modifier.

Do not include ordinary structural ancestors in this cycle; broaden and narrow already traverse them.

### Exit

When OpenKeyNav handles a mode-exit command:

- Turn off only this mode unless the configured command explicitly disables all of OpenKeyNav.
- Remove mode-specific status and styling.
- Do not call `blur()`.
- Do not move page focus.
- Release mode-specific observers and listeners.

## Native-key ownership

### Tab and Shift+Tab

- Never prevent, synthesize, replay, or replace Tab or Shift+Tab.
- Let the browser move focus.
- After the focus event, synchronize to the final deep active target.
- Preserve the active structural context if it still contains the new target.
- Otherwise select the new target's innermost structural context.
- Preserve a typed context only if the new target remains a member; otherwise return to structural navigation.

Tab after a mode-reached target must continue according to the browser's actual sequential-focus behavior.

### Enter and Space

Do not repurpose Enter or Space as structural-navigation commands. They retain their page and widget meanings.

### Route and activation keylabels

While structural navigation is the foreground mode, use the existing OpenKeyNav
keylabel renderer and placement logic to show compact destination hints:

- `⇥` on the next native Tab destination and `⇧⇥` on the previous one. Show
  these sequential-navigation hints by default, with a configuration switch to
  hide them.
- `⇧←` and `⇧→` on the first targets reached by the available previous and
  next horizontal context commands.
- `⇧↑` and `⇧↓` on different targets focused by the available broaden and
  narrow commands. When a command changes only the context and retains focus,
  omit its destination label.
- `↵` and/or `⎵` on the currently focused target when its native semantics
  reliably support Enter and/or Space activation.
- For native HTML radio groups, `←↑` on the previous radio and `→↓` on the
  next radio because those bare arrows move DOM focus. When a two-radio group
  has one peer in both directions, use `↔↕`. Do not intercept the native keys.

Each target receives at most one keylabel of at most two symbols, except that a
structural arrow route requiring the configured ownership override uses the
truthful three-symbol chord (for example `⌥⇧→`). Combine
one-symbol actions when they fit, such as `↵⎵`, with a visible divider that
communicates “or.” Keep two-symbol chords joined and atomic, and retain the
first applicable structural route when routes converge. The
labels describe the current route without intercepting Tab, Shift+Tab, Enter,
or Space. While a displayed modifier is held, highlight its symbol in every
relevant visible label—including both Shift and the configured ownership
override—and clear that pressed treatment on release, focus loss, or document
hiding. Keep labeled targets out of type-to-select matching, but apply the
shared keylabel target treatment for as long as their owner-managed labels are
visible. Use the configured focus-ring color for the label whose target is
actively focused, darkening its background only as much as needed for at least
4.5:1 contrast with white text while retaining the existing thin white keylabel
outline. When the focused widget owns a structural arrow chord, keep its
destination label visible and prepend the configured ownership override. Hide
structural labels while Click, Move, or menu is the foreground layer, restore
them when structural navigation resumes, and remove them on exit.

### Arrow-owning controls and widgets

Do not consume structural-navigation arrows when the current composed event path is inside a control or widget that owns them, including:

- Text inputs, textareas, and editable content.
- Selects, comboboxes, sliders, and spinbuttons.
- Menus, menubars, tablists, listboxes, trees, grids, and treegrids.
- Radio groups and toolbars.
- Any application component identified by a public key-ownership hook.

For outer structural navigation, treat a composite widget as the page-level target represented by its actual Tab stop. Do not enumerate roving-`tabindex="-1"` items or `aria-activedescendant` options as ordinary page targets.

Provide a deliberate configurable override command for users who want to invoke structural navigation while focus is inside an arrow-owning control. Treat the override as a permissive ownership signal: while it remains held, it must not invalidate an otherwise configured structural arrow command after focus leaves the control. Do not assume that the current text-input modifier already solves arbitrary widget ownership.

### Escape and close behavior

Escape may already:

- Close a dialog or popover.
- Collapse a combobox.
- Leave a grid or cell-editing mode.
- Cancel an operation.
- Be handled by application code that OpenKeyNav cannot infer.

Therefore:

- The activation toggle or configured OpenKeyNav mode-exit command must always provide a reliable way to leave the mode.
- Bare Escape must pass through when a native or declared component owns it.
- If bare Escape is offered as a safe alias elsewhere, document that policy and test it.
- When the page owns Escape, synchronize after the page completes its focus or DOM changes.

### Event-processing constraints

- Ignore composition events and unconfigured modifier combinations, except for the explicitly configured ownership override when accompanying a structural arrow command.
- Make key-ownership decisions before calling `preventDefault()` or `stopPropagation()`.
- Do not rely solely on `defaultPrevented` when OpenKeyNav listens during capture.
- One accepted command should be handled once even under key repeat or rapid input.
- Page shortcuts and OpenKeyNav shortcuts must have a documented precedence policy.

## Screen-reader boundary

This is a JavaScript focus-navigation mode. A screen reader in browse or virtual-cursor mode may consume arrow keys before the page receives them.

The feature must:

- Work correctly whenever its configured events reach the page.
- Move real DOM focus so assistive technology can encounter the actual target.
- Provide concise accessible status for context changes.
- Avoid claiming that it replaces or overrides screen-reader browse navigation.
- Document any recommended modifier or application-mode usage without depending on a particular screen reader.

## Focus movement and synchronization

### Moving focus

For one accepted target-movement command, OpenKeyNav should initiate at most one call to focus the selected target.

Page focus handlers may redirect focus. After the event settles:

- Read the final deep active target.
- Treat it as ground truth.
- Synchronize context state to it.
- Do not pull focus back to the requested target automatically.

Do not promise “at most one real focus movement,” because page code can cause additional focus changes outside OpenKeyNav's control.

### Focus helper

Reuse or adapt OpenKeyNav's focus helper only if it:

- Focuses the existing target.
- Does not add `tabindex`.
- Does not suppress the page's focus indicator.
- Cleans up its own marker reliably.
- Allows final focus to be verified.

Do not reuse heading or scrolling navigation helpers that temporarily make non-target containers focusable.

### Scrolling

Calling `focus()` may cause the browser to reveal the target. Do not add an independent scrolling loop.

- No repeated `scrollIntoView()` calls.
- No scroll polling.
- At most one explicit scroll request per accepted command, and only when a documented browser case requires it.
- Focus or scroll changes caused by the page remain page behavior.

### External focus changes

Listen for focus changes caused by:

- Native Tab or Shift+Tab.
- Pointer interaction.
- Page scripts.
- Assistive technology.
- Other OpenKeyNav commands.

If focus moves to a known target, synchronize as described above.

If focus moves to an element outside the target inventory:

- Keep real focus untouched.
- Suspend target-relative movement state.
- Keep or derive the nearest meaningful structural context when possible.
- Let the next previous/next command enter at the last or first eligible target according to the no-current-target rule.

## Dynamic documents

The mode must remain correct when a page:

- Adds, removes, or reorders targets.
- Changes `disabled`, `hidden`, `inert`, `tabindex`, role, or relevant labeling attributes.
- Opens or closes details, dialogs, popovers, or application overlays.
- Changes headings or structural containers.
- Updates Shadow DOM or slot assignments within supported roots.
- Navigates within an SPA.

Required behavior:

- Invalidate derived data without moving focus.
- Refresh lazily before the next command or through another bounded event-driven strategy.
- Preserve live target identity and active context where still valid.
- Drop stale elements and memberships.
- Recover deterministically when the current target or context disappears.
- Avoid feedback loops caused by OpenKeyNav's own DOM.
- Release observers and references when the mode is disabled.

There is no autonomous traversal, polling, or automatic activation.

## Status and focus indication

Real page focus remains primary.

Use OpenKeyNav's existing status, notification, toolbar, and focus-marker facilities where suitable to communicate:

- Mode activation and exit.
- Current target name.
- Active document/root, structural, or typed context name.
- Position within the active target sequence.
- The active context's authored heading level when it is heading-backed. An
  unheaded context does not report an invented heading level. Vertical entry
  uses the shallowest or deepest authored level actually present, never a
  numeric value inferred from DOM nesting.
- Context changes.
- A bounded count of applicable typed contexts.
- Boundaries and unavailable relationships.

Requirements:

- Status never takes focus during traversal.
- Context-only changes are exposed through a concise polite live announcement.
  A default-off structural-navigation debug flag may also expose that status as
  a persistent visual surface.
- Structural status does not name previous or next horizontal contexts or
  enumerate a peer lane. An attempted command still announces a horizontal,
  parent/child, target, or typed-route boundary when the relationship is
  unavailable.
- When the debug surface is enabled, a configurable, non-focus-stealing
  status-dismissal command may close it while retaining visually hidden polite
  updates, and must defer to controls or applications that own the key.
- Repeated navigation does not queue long or redundant announcements.
- OpenKeyNav may augment a weak page focus indicator but must not suppress the page's native or authored focus styles.
- An opt-in generated visual context indicator may outline the active context,
  but it is disabled by default, `aria-hidden`, ignores pointer events, never
  receives focus, and is removed on mode exit. When the context has an authored
  heading rank, a small tab protrudes from an available edge and contains only
  `h1` through `h6`; an unheaded context receives no fabricated rank tab. The
  outline is dashed and uses the existing neutral label palette so it cannot be
  mistaken for the solid focus indication. The tab uses those existing label
  and text colors and inherits page typography rather than adding a second
  visual configuration.
- No generated item is presented as a second focused page target.

## Public configuration

Follow OpenKeyNav's current public configuration conventions. Provide capabilities for:

- Enabling the feature.
- Configuring activation and exit commands.
- Configuring relationship commands where current conventions permit.
- Declaring key ownership or an override command for application widgets.
- Supplying a custom active navigation root.
- Contributing structural contexts.
- Contributing typed contexts.
- Filtering targets without mutating them.
- Opting into programmatic-only targets, if supported.
- Enabling optional semantic adapters such as static tables.
- Controlling status and announcements, including a default-off debug flag for
  the persistent visual status.
- Opting into the large visual context indicator when the focused keylabel is
  not sufficient for the host interface.

Do not commit to a property name or nested object shape until the implementer reviews the current public API.

Preserve all existing behavior when the feature is disabled.

## Current OpenKeyNav integration considerations

At the time this brief was rewritten, the checkout had these relevant characteristics:

- A primary OpenKeyNav class owns nested configuration and runtime state.
- Enabled state and existing modes use the project's signal implementation.
- Keyboard behavior is routed through a central capture-phase key handler.
- Text-input detection and an input-escape modifier exist, but there is no general widget key-ownership system.
- The focus helper moves real focus and adds an OpenKeyNav marker.
- Heading and scroll navigation can temporarily add `tabindex="-1"`; that behavior must not be copied for structural contexts.
- Existing `isTabbable` logic mixes navigation discovery, viewport/visibility heuristics, and accessibility auditing.
- Existing Escape handling can blur the active element.
- The keydown handler and iframe support have lifecycle and cleanup considerations.
- Existing notification, toolbar, status, style, Vitest, and Playwright facilities can be reused where they satisfy this contract.
- Distribution files are generated from source through the build.

These are observations, not architectural mandates. If the checkout has changed, follow the current implementation.

Before coding, inspect at least:

- Package metadata, lockfile, build, and test scripts.
- Public README and configuration examples.
- Primary entry point and lifecycle behavior.
- Keyboard dispatch and listener phase.
- Focus and focusability helpers.
- Escape, disable, teardown, and repeated initialization.
- Existing status, notification, toolbar, and style facilities.
- Unit and real-browser tests.
- Generated distribution policy.

Then write a short implementation note identifying:

1. Which existing facilities will be reused.
2. Whether and how `tabbable` will be adopted.
3. The exact supported focus scopes.
4. The canonical structural-context derivation.
5. The target and context state transitions for every command.
6. The widget and Escape key-ownership policy.
7. The invalidation and cleanup strategy.
8. The browser-test plan.

## Performance and safety

- No preliminary Tab sweep.
- No synthetic keyboard events.
- No automatic clicking or activation.
- No polling.
- No autonomous navigation.
- No repeated auto-scroll behavior.
- No whole-document discovery for every keypress when nothing relevant changed.
- No temporary `tabindex` on contexts or headings.
- No page-key interception while the mode is inactive.
- At most one OpenKeyNav-initiated focus call for one accepted movement command.
- At most one OpenKeyNav-initiated explicit scroll request for one accepted movement command.
- No changes to the page's sequential Tab order.
- No target duplication across contexts.
- Complete release of mode-specific observers, listeners, generated state, and stale references.

## Required browser scenarios

### Core hierarchical scenario

Create a fixture containing:

- A Header landmark with a Search form containing an input and button.
- A Main landmark.
- A Filters section containing an Availability fieldset with two checkboxes.
- A sibling Results section containing two product links.
- Two H2 families that each contain an H3 with focus targets.
- A semantic list with multiple focus-bearing items.
- An offscreen but rendered focus target.

Demonstrate:

1. Activation does not move meaningful current focus.
2. Explicit configured or programmatic next/previous target commands move real
   focus within a narrow context, while native Tab remains unmodified.
3. Broaden from a heading-backed context activates the nearest preceding
   lower-level heading and focuses its first target. From an unheaded context,
   it enters the deepest authored level present.
4. Narrow follows the current target's path and retains focus. From the
   document/root or another unheaded context, its fallback enters the shallowest
   authored level present. When a heading-backed context has no deeper child on that path, it
   advances without wrapping to the first context at the closest available
   deeper rank, regardless of generic DOM wrappers, and focuses that
   destination's first target; H6 is the fallback boundary.
5. Horizontal movement lands on a real target and activates the destination
   context.
6. From a Filters section, next-horizontal movement enters its nested
   Availability fieldset before moving to the following Results section.
7. From an unheaded landmark or configured region, horizontal movement enters
   the adjacent semantic region without inventing a heading rank.
8. A broadened explicit previous/next target command may cross descendant
   groups without silently narrowing.
9. Boundaries do not wrap by default.
10. The offscreen target is discoverable and browser focus reveals it without a scroll loop.
11. `document.activeElement` or the defined deep-active-target resolver identifies the reached target.
12. Native focus and blur events fire.
13. Native Tab and Shift+Tab remain unmodified.
14. Tab continues naturally from a mode-reached target.
15. Enter activates a focused link or button normally.
16. Space operates a focused checkbox normally.
17. Exit leaves current focus in place.

### Native-widget scenario

Create representative native and ARIA widgets:

- Text input and textarea.
- Select.
- Slider or spinbutton.
- Tabs or radio group.
- Listbox or combobox.
- Interactive grid using roving `tabindex` or `aria-activedescendant`.

Demonstrate:

1. Native arrows and editing keys remain functional.
2. Composite internals are not added to the outer page target sequence merely because they are programmatically focusable.
3. The documented override invokes structural navigation deliberately.
4. Bare Escape remains native where the widget or active overlay owns it.
5. The configured mode-exit command remains available.

### Focus-scope scenario

Demonstrate:

1. Opening a modal dialog confines discovery and navigation to the modal.
2. Closing it restores document scope and synchronizes focus.
3. Open Shadow DOM works if declared supported.
4. Closed Shadow DOM is not pierced.
5. An iframe follows the documented atomic-target policy.
6. Cross-origin iframe contents are never claimed as discovered targets.

### Dynamic scenario

While the mode remains active:

- Insert a target.
- Remove the current target.
- Reorder a context.
- Disable and re-enable a control.
- Hide and show content.
- Change heading structure.
- Open and close a dialog or details element.

Demonstrate bounded recovery, no stale navigation, no duplicate listeners, and no autonomous focus movement.

### Invalid-semantics scenario

Include a sequentially focusable control inside `aria-hidden="true"`.

Demonstrate that:

- Target inventory remains compatible with native focus.
- A hidden-semantics audit warning, when present, travels through the audit channel.
- Structural Navigation continues to use the live focus target.

## Typed-context scenarios

These scenarios are mandatory when typed contexts are enabled.

### Application-supplied overlap

One real target belongs to its structural context and two explicit typed contexts.

Demonstrate:

1. The target has one identity.
2. Cycling peer contexts retains focus.
3. Previous and next routing changes with the active typed context.
4. Returning to structural navigation selects the current target's innermost structural context.
5. Removing a typed membership invalidates it without moving focus.

### Static table overlap

Mandatory only if automatic table inference ships.

Demonstrate:

- Multiple targets in rows and columns.
- A cell with several local targets.
- `rowspan` and `colspan`.
- Headers and row groups.
- A nested table.
- A presentational or layout table that does not receive inferred data contexts.
- An interactive grid that retains its native behavior.

## Automated testing expectations

Use the test tools and conventions present in the checkout.

### Unit tests

Cover pure logic for:

- OpenKeyNav-owned filtering around `tabbable`.
- Canonical structural tree construction.
- Heading-stack behavior and duplicate-context collapse.
- Direct-context assignment.
- Flattened target sequences.
- Heading-backed peers across structural parents, rank separation, and no
  invented lane for unrelated unheaded contexts.
- Rank-based broaden, in-path narrow, unheaded edge entry,
  page-forward deeper-rank fallback, skipped ranks, and H6 boundaries.
- No-current-target behavior.
- Typed-context membership and cycling.
- Dynamic invalidation and stale-reference removal.
- Key-ownership classification.

Unit tests may configure `tabbable` display checks for jsdom only as its documentation recommends. That configuration is not evidence of real-browser correctness.

### Browser tests

Use Playwright or the repository's current browser runner for:

- Actual focus.
- Native Tab continuation.
- Focus and blur events.
- `:focus-visible` and OpenKeyNav focus indication.
- Scrolling.
- Modal effective inertness.
- Native widget arrows and Escape.
- Open Shadow DOM, if supported.
- Iframe policy.
- Dynamic DOM behavior.
- Rapid input and key repeat.
- Page focus handlers that redirect focus.
- Repeated mode entry, exit, disable, and teardown.
- In-path narrow focus retention and page-forward next-rank entry at the
  destination's first target, and the H6 fallback boundary.

Run the full relevant browser suite, not one or two manual interactions.

Where practical, test more than one browser engine. Document platform-specific target-order limitations that cannot be inferred from page JavaScript.

## Completion criteria

Do not report completion until:

- Every OpenKeyNav destination is an existing live page focus target.
- Context changes never create or focus a proxy node.
- The canonical hierarchy follows the rules in this brief.
- Direct and flattened membership are deterministic.
- Parent, child, horizontal, and typed peer-context commands satisfy their exact
  semantics.
- Native Tab, Shift+Tab, Enter, and Space remain native.
- Native widget arrows and Escape remain available under the ownership policy.
- The configured mode-exit command is always reachable.
- Modal and other supported scope boundaries are respected.
- Deep focus is synchronized within the documented scope.
- Shadow DOM and iframe behavior matches the documented support scope.
- Dynamic changes do not produce stale targets or contexts.
- Rapid input does not produce duplicate moves or runaway scrolling.
- Relevant unit tests pass.
- The complete real-browser suite passes.
- The production build succeeds.
- Generated distribution artifacts, if committed, come from the build rather than hand editing.
- Public documentation explains activation, commands, key ownership, context behavior, target-discovery dependency, supported scopes, extension points, and limitations.
- Benthic is attributed as inspiration, and verification evaluates the webpage adaptation independently.

## Implementation freedom

The implementer may:

- Extend existing modules or introduce a focused module.
- Reuse or refactor current state and mode facilities.
- Compute derived relationships eagerly, lazily, incrementally, or through invalidation.
- Represent the canonical tree and typed memberships in any maintainable form.
- Reuse existing status UI or add a small compatible status surface.
- Choose names consistent with the source.

Implementation freedom does not override the externally observable behavior, compatibility rules, scope boundaries, or acceptance criteria in this brief.

## References

- OpenKeyNav GitHub: <https://github.com/LDubya/OpenKeyNav>
- OpenKeyNav npm: <https://www.npmjs.com/package/openkeynav>
- `tabbable`: <https://github.com/focus-trap/tabbable>
- HTML focus model: <https://html.spec.whatwg.org/multipage/interaction.html#focus>
- HTML tables: <https://html.spec.whatwg.org/multipage/tables.html>
- WAI-ARIA: <https://www.w3.org/TR/wai-aria/>
- ARIA Authoring Practices keyboard guidance: <https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/>
- Benthic paper: <https://vis.csail.mit.edu/pubs/benthic.pdf>
