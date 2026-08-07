# Using OpenKeyNav for keyboard testing

> **Concept bookmark:** “Using OpenKeyNav for keyboard testing” may be a useful
> developer-adoption framing and the basis of a human-led open-source repair
> campaign.

## The proposition

OpenKeyNav's adoption path begins with one ordinary developer install. That same
integration serves two audiences at different points in the delivery lifecycle:

- A **builder integration surface** can expose stable lifecycle, configuration,
  target-registration, action, and adapter APIs through which an application
  team defines the navigator experience it intends to own.
- **Developer Mode**, which is intentionally the default, can reveal review
  candidates, record focus and keyboard evidence, and support human
  investigation while the builder configures and tests the integration.
- A **product runtime surface**, exposed to navigators, can provide the stable
  keyboard commands, targets, routes, and operations that an application team
  has deliberately specified, tested, documented, and committed to maintaining.

The first two are exposed to builders through the normal OpenKeyNav install. The
third is what navigators encounter after the builder deliberately prepares the
integration for production. Builder diagnostics must not leak into that
experience, and heuristic review candidates must not silently become end-user
controls.

If **OpenKeyNav Studio** is used as a name, it should mean the branded and
visualized developer-support view inside Developer Mode. It should not be a
separate package, application, website, or adoption route. Developers find the
support precisely because they install OpenKeyNav.

Used as a testing workbench, OpenKeyNav can keep native and builder-declared
targets separate from heuristic review candidates, then surround
developer-driven keyboard interactions with provenance and raw evidence. Direct
selection, structural navigation, focus routing, scroll-region navigation, and
movement probes make the builder's investigation more informative; they do not
become evidence that the host application already supports those operations.

The governing principle is:

> **AI prepares the lab. OpenKeyNav equips the driver. The human makes the
> finding.**

OpenKeyNav does not decide whether an interaction is keyboard accessible. Its
labels, routes, state, and other raw observations are inputs to a builder's
investigation, not conformance verdicts. Automated output never becomes a bug
report without a human performing the task, interpreting the behavior, and
approving the claim.

## The exposure boundary

The boundary cannot be determined only by asking “does this use a heuristic?”,
“does JavaScript run in the page?”, or “is the feature visible to an end user?”
The decisive question is:

> **Who is this capability exposed to, what work does it ask them to do, and
> where does the result of that work go?**

The same technology can occupy different positions. A developer using a screen
reader or evaluation tool before release is performing builder-side QA. A
disabled person forced to install the same kind of tool to diagnose or patch an
inaccessible live product is carrying navigator-side compensatory labor.

Likewise, a keyboard feature that a team builds into its official product can
be a builder-side accessible implementation even though navigators use it. It
becomes compensatory when navigators must discover, install, configure, debug,
or maintain a special repair because the builder left the ordinary experience
inaccessible.

| Surface | Exposed to | May expose | Must not expose or imply |
| --- | --- | --- | --- |
| Builder integration | Application developers | Documented lifecycle and configuration; explicit target and action registration; Move callbacks; Structural Navigation adapters and key ownership; command and help configuration | Mutable internal state as accidental API; undocumented repair hooks; heuristic targets promoted by default |
| Developer Mode, optionally presented as Studio | Developers, QA, maintainers, and consenting, paid evaluation participants in builder-controlled studies | Heuristic review candidates and their provenance; raw DOM and author-semantic facts; browser accessibility-tree snapshots when available; focus, key, and event timelines; highlighting; explicit test-only probes; checkpoints; source inspection; evidence export | Automated conformance verdicts; a claim that a candidate is a bug; a claim that assisted reachability is a fix |
| Product runtime, navigator-facing | People operating the finished application | Discoverable commands; labels for native or builder-declared targets whose complete operations were verified; Structural Navigation; configured Move operations; status, help, exit, and preferences | Audit panels; source hints; “inaccessible element” warnings; heuristic candidate counts; silent repair of undeclared pointer targets; claims that the product became accessible automatically |

“Builder-facing” and “navigator-facing” name product surfaces here; they do not
by themselves assign an ENABLE category. Navigator-facing functionality can be
the result of builder-side care when the builder owns and delivers it.

Source integration alone is not sufficient. A generic repair script can still
mask defects and displace responsibility even when a developer inserted it. A
builder-owned integration must define a real keyboard contract, verify complete
tasks, support the feature, and maintain it across releases.

### The research-era surface mix

During an earlier research collaboration, heuristic behavior surfaced likely
pointer interactions outside the conventional keyboard target inventory and
could make them operable before a builder declared and verified them. The
boundary problem was silently promoting review candidates into the
navigator-facing keyboard contract—not the presence of heuristics, shared
runtime machinery, or a JavaScript implementation.

The appropriate cleanup is therefore an **exposure refactor within the normal
OpenKeyNav integration**, not a blanket deletion of every heuristic:

- move broad candidate discovery, candidate provenance, diagnostic highlighting,
  focus and event evidence, and observation capture into an unmistakably
  builder-facing Developer Mode presentation;
- keep heuristic candidates non-operating by default; if an explicit
  test-only probe is retained, label it as an experiment and never treat its
  success as reproduction evidence or remediation;
- limit the product runtime to native keyboard targets and
  application-declared targets or operations that the builder has verified;
- keep audit verdicts, “inaccessible” classifications, automatic repair metrics,
  and forced-visibility probing out of the product runtime; raw visibility facts
  and an explicit builder-only visibility probe may still support investigation;
  and
- keep shared, legitimate mechanisms such as temporary labels, focus primitives,
  Move Mode callbacks, Structural Navigation, status, and lifecycle cleanup when
  they operate within a native or explicitly application-declared target and
  action contract.

The current exposure problem is that Click Mode can promote heuristic candidates
into navigator-operable targets and `debug.keyboardAccessible` diagnostic
presentation is enabled by default through the runtime entry. Turning off the
diagnostic styling does not narrow target discovery, disable synthetic
activation, or prevent all runtime mutation. Click Mode also has no public
application-declared target/action registry today, so the intended product
contract requires a new API rather than merely a configuration change.

Dormant audit and listener-tracking code does not by itself impose navigator
labor merely because it shares a package with the runtime. The boundary concerns
what the integration presents to each audience. Separately, the active iframe
key bridge and page-wide focus effects deserve a runtime non-interference and
security review; they are not builder diagnostics merely because their
implementation is internal.

The standard `openkeynav` install should remain the route into both integration
and testing. `init()` can continue to open in Developer Mode by default, with a
Studio view making that status and purpose unmistakable. Preparing the same
integration for production should be a deliberate transition that hides the
Studio presentation and consumes only the targets and operations the builder has
reviewed and approved. Internal module or bundle boundaries may be useful
engineering safeguards, but ENABLE positioning does not require a separate
package.

A future initialization profile could make that lifecycle explicit without
creating another acquisition route:

```javascript
// The ordinary first-run experience: conspicuous builder support.
new OpenKeyNav().init();

// A deliberate graduation step, using a validated application-owned contract.
new OpenKeyNav().init({
  profile: 'production',
  runtime: verifiedRuntimeContract,
});
```

`profile` and `runtime` are proposed APIs. Developer Mode should be visibly
identified, keep its observations separate from navigator preferences, and
never silently graduate itself to production. The production profile should be
immutable after initialization and reject heuristic review candidates or
undeclared operations rather than merely hiding their warning styles.

### Current implementation status

The current package already has the correct discovery route: one main entry, with
`debug.keyboardAccessible` set to `true` by default so developers encounter its
diagnostic support during integration. It does not yet have a Studio view,
separate runtime-versus-review candidate inventories, an approved target/action
contract, or an evidence-recording and export API. Setting
`debug.keyboardAccessible` to `false` currently suppresses diagnostic styling
but does not narrow candidate discovery or synthetic activation, so the
production transition still needs a stronger behavioral boundary.

The current onboarding also tells developers to turn diagnostics off in its
first npm and CDN examples before later explaining that Developer Mode is the
default. That presentation works against the intended discovery path. The first
experience should demonstrate Developer Mode; production configuration should
appear later as an explicit graduation checklist.

## The developer-adoption wedge

“Use OpenKeyNav for keyboard testing” asks for a smaller first commitment than
“ship a new interaction model.” A team installs OpenKeyNav normally and
encounters Developer Mode while configuring it in a local or review build. A
Studio view could make that existing developer support more useful and more
obviously distinct from the navigator experience. Developers learn OpenKeyNav's
interaction model against a product they already understand without a second
installation or acquisition funnel.

That creates two legitimate outcomes:

1. **Testing-only:** use Developer Mode, confirm an issue, repair the host
   component, add regression coverage, and keep the OpenKeyNav integration in
   development or review builds only.
2. **Product integration:** separately specify a navigator-facing OpenKeyNav
   capability, evaluate it with disabled people and other intended users, and
   ship only the commands and operations the team intentionally owns,
   configures, verifies, supports, and maintains.

The first does not have to become the second. Testing by developers also
complements rather than replaces paid accessibility evaluation and user
research with disabled people.

The product-integration outcome needs its own evaluation protocol and change
language. It is not an alternate “fix” state inside the source-repair campaign
below.

## Why this fits the ENABLE Model

The ENABLE Model does not place a technology on one side for all uses. It traces
who performs the work and who carries the burden in a particular use.

The model itself places NVDA in navigator-side assistive technology when blind
people use it and in builder-side QA when developers test with it. It similarly
notes that a developer evaluation tool becomes navigator-side labor when a
disabled user must use it to diagnose a product the builder should have tested.

Applied here:

- builder diagnostics support
  [testing](https://enablemodel.com/docs/builder-side/qa-testing) and
  [triage](https://enablemodel.com/docs/builder-side/triage);
- source repairs support
  [development](https://enablemodel.com/docs/builder-side/development) and
  [iteration](https://enablemodel.com/docs/builder-side/iteration);
- a durable, application-integrated OpenKeyNav keyboard capability can itself
  be an accessible implementation when the builder owns it as part of the
  product;
- a partial integration is a builder-side
  [stopgap](https://enablemodel.com/docs/builder-side/stopgaps) only when its
  limitation, end condition, and replacement path are explicit; and
- an extension or injected repair that navigators must acquire after the
  builder declines to act is navigator-side
  [third-party-tool compensation](https://enablemodel.com/docs/navigator-side/third-party-tools).

The campaign is builder-side because the developer receives the diagnostic
support through OpenKeyNav's default Developer Mode, performs the test and
judgment, and returns the result upstream as a component repair and regression
test. Navigators should receive the resulting access without becoming the QA
team.

Success should therefore be measured in upstream work completed: human-tested
workflows, human-confirmed findings, merged source fixes, regression coverage,
and navigator burden eliminated. “Made sites x% more accessible without
developer involvement” is not an OpenKeyNav success metric; it celebrates the
absence of the responsible actor and invites Developer Mode to become a
repair layer.

## The builder experience

For each selected open-source platform, AI would provision a pinned local fork
or branch, seed inert test data, integrate OpenKeyNav with Developer Mode active,
and open a bounded task. The human would then drive the keyboard.

This workflow describes the host-platform repair campaign. Evaluation of a
proposed OpenKeyNav product integration is a separate workflow.

### 1. Explore in the builder diagnostic lane

The builder uses the real OpenKeyNav interactions to examine a complete task:

- `Tab` and `Shift+Tab` remain the authority for the native sequential path.
- Developer Mode, optionally organized through a Studio view, keeps the
  application's runtime target inventory separate from heuristic review
  candidates and exposes why each candidate was included;
- a heuristic candidate can be highlighted and inspected without being promoted
  into the navigator's Click Mode or counted as keyboard operable;
- heading, scroll-region, and Structural Navigation commands expose alternate
  routes through the page without replacing native `Tab` behavior;
- Move Mode's current callback-less event simulation can be used, if retained,
  only as an explicit test probe; success does not establish native host
  operability. An application-owned callback or adapter belongs to the separate
  product-integration evaluation; and
- raw DOM and author-semantic facts, browser accessibility-tree snapshots when
  supplied by the test harness, and focus and event information can support the
  builder's interpretation without labeling the behavior pass or fail.

The useful question is not “what did a scanner flag?” It is “what happened when
the builder tried to complete this task, what did OpenKeyNav help the builder
reach or understand, and what must be fixed in the application's source?”

### 2. Mark a human observation

The builder chooses when something deserves investigation and records, in their
own words:

- the intended task and starting state;
- the exact keys used;
- expected behavior and its basis;
- observed behavior;
- the concrete task consequence; and
- whether semantic or assistive-technology follow-up is needed.

The proposed Studio view within Developer Mode could automate the low-judgment
work around that decision: a focus timeline, key history, environment metadata,
screenshots, relevant DOM and author-semantic facts, accessibility-tree snapshots
when the browser-testing harness supplies them, and a stable reference to the
selected target. It should not record text typed into editable fields by
default.

### 3. Reproduce in the native baseline lane

Before the behavior is attributed to the upstream platform, the builder repeats
the task with the OpenKeyNav instrumentation absent. This separates a source
defect from an OpenKeyNav interaction or interoperability problem. The human
must reproduce the behavior and confirm the expected-versus-observed account.
The proof of a host source fix is the base application before versus the patched
application after, not the inaccessible application before versus an assisted
Developer Mode probe after.

### 4. Trace, repair, and retest

After the human confirms a finding, AI can:

- trace the selected behavior to likely components and source files;
- identify known uses of the same shared component;
- draft a focused regression test and minimal patch;
- run the project's automated test suite; and
- organize a pull-request draft and evidence bundle.

The builder reviews the source hypothesis and patch, reruns the native task
without OpenKeyNav instrumentation, and decides whether the fix is ready. A
shared-component fix may repair many known call sites, but the campaign should
count the root cause once and describe its verified scope accurately.

## What the testing support should optimize

A dedicated, non-judgmental Studio view within OpenKeyNav Developer Mode should
eventually make the following cheap for the builder:

1. Start and stop a task-level recording.
2. Keep the builder diagnostic lane and native baseline lane visibly distinct.
3. Compare the native target inventory with heuristic review candidates without
   silently activating or merging them.
4. See the current focus target and raw name, role, value, and state.
5. Review a visible focus and key-transition trail.
6. Add a checkpoint or observation without leaving the keyboard.
7. Replay the same starting state and key sequence after a patch.
8. Export a sanitized evidence bundle only after human approval.

The testing UI should use neutral language such as **observation**, **review**,
and **expected/observed**. It should not assign conformance, severity, impact, or
bug status. Those are human decisions.

## What AI should automate

AI makes a multi-platform, human-led campaign operationally feasible at useful
breadth. It may automate:

- repository checkout, dependency installation, build startup, health checks,
  resets, and test-data seeding;
- the normal source-controlled OpenKeyNav integration with Developer Mode active
  in the local or review build;
- task runbooks based on the platform's own interaction documentation;
- raw artifact capture at the builder's direction;
- source and component tracing after a human observation;
- candidate regression tests and patches; and
- issue and pull-request drafts.

AI does not decide expected behavior, declare an accessibility failure, claim
what an assistive technology announced, assign severity, inject a navigator-side
repair into production, or communicate with maintainers without the builder's
review and approval.

## Campaign flow

Use explicit states so automation cannot silently turn a cue into a claim:

1. **Environment ready** — AI has prepared a reproducible source build.
2. **Human observed** — the builder marked behavior during an OpenKeyNav session.
3. **Native reproduced** — the builder repeated the host-platform behavior with
   OpenKeyNav instrumentation absent.
4. **Human confirmed** — the builder approved expected, observed, and impact.
5. **Patch verified** — automated regression and the human native-keyboard
   retest pass.
6. **Submitted** — the builder approved the upstream communication.
7. **Resolved** — accepted, declined, duplicate, not a bug, or browser/AT issue.

Only a human advances a finding from observation through submission.

## Pull-request attribution

A precise attribution avoids implying that OpenKeyNav made an automated
accessibility determination:

> I identified this keyboard failure during a human-led review using
> OpenKeyNav Developer Mode **[version/commit]**. Its developer support assisted
> exploration; it did not determine conformance or constitute the fix. I
> reproduced the behavior without OpenKeyNav instrumentation and verified the
> source change using the environment and keystrokes below.

That template is for a host-platform defect. A separately evaluated product
integration should describe the application-owned contract instead:

> I evaluated this application-owned OpenKeyNav keyboard contract during
> builder-side QA and verified the integrated workflow using the environment and
> keystrokes below.

When AI materially assisted:

> AI assistance provisioned the local source build, organized raw evidence,
> traced the human-observed behavior to **[files/components]**, and drafted
> portions of **[test/patch]**. It did not decide whether the behavior was an
> accessibility defect. I reviewed every submitted change and take
> responsibility for this contribution.

## First pilot

[WordPress Gutenberg](https://github.com/WordPress/gutenberg) is a strong first
candidate because it has a local source environment, an official
[manual accessibility-testing guide](https://developer.wordpress.org/block-editor/contributors/accessibility-testing/),
documented [editor keyboard shortcuts](https://wordpress.org/documentation/article/keyboard-shortcuts-block-editor/),
and browser regression tests. A bounded first journey could cover creating a
post, moving among editor regions, inserting and moving a block, opening and
dismissing a menu or dialog, and saving. The builder—not OpenKeyNav or AI—would
decide whether any observed behavior is a defect.

The next practical step is to prototype the testing support against
OpenKeyNav's intentional keyboard-error corpus before using it in Gutenberg.
That corpus provides known examples across focusability, activation, focus
order and visibility, custom widgets, dialogs, traps, pointer-only operations,
and keyboard-event misuse without turning the prototype into a scanner.
