/**
 * @vitest-environment jsdom
 */
import { buildStructuralModel } from '../src/structuralModel.js';

const buttons = (...ids) => ids.map(id => document.getElementById(id));
const contexts = model => Array.from(model.contexts.values());
const contextNamed = (model, name) =>
  contexts(model).find(context => context.name === name);

describe('buildStructuralModel', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('builds canonical semantic ancestry, direct contexts, and flattened order', () => {
    document.body.innerHTML = `
      <header aria-label="Header">
        <form role="search" aria-label="Search">
          <input id="query">
          <button id="submit">Submit</button>
        </form>
      </header>
      <main aria-labelledby="catalog-title">
        <h1 id="catalog-title">Catalog</h1>
        <section aria-labelledby="filters-title">
          <h2 id="filters-title">Filters</h2>
          <button id="clear-filters">Clear filters</button>
          <fieldset>
            <legend>Availability</legend>
            <input id="stock" type="checkbox">
            <input id="preorder" type="checkbox">
          </fieldset>
        </section>
        <section aria-labelledby="results-title">
          <h2 id="results-title">Results</h2>
          <a id="product-a" href="#a">Product A</a>
          <a id="product-b" href="#b">Product B</a>
        </section>
      </main>
    `;
    const targetList = buttons(
      'query',
      'submit',
      'clear-filters',
      'stock',
      'preorder',
      'product-a',
      'product-b'
    );
    const model = buildStructuralModel({
      root: document,
      targets: targetList,
    });

    const availability = contextNamed(model, 'Availability');
    const filters = contextNamed(model, 'Filters');
    const results = contextNamed(model, 'Results');
    const catalog = contextNamed(model, 'Catalog');

    expect(model.directContextByTarget.get(document.getElementById('stock')))
      .toBe(availability);
    expect(availability.parent).toBe(filters);
    expect(filters.parent).toBe(catalog);
    expect(availability.targets).toEqual(buttons('stock', 'preorder'));
    expect(filters.targets).toEqual(buttons(
      'clear-filters',
      'stock',
      'preorder'
    ));
    expect(catalog.targets).toEqual(buttons(
      'clear-filters',
      'stock',
      'preorder',
      'product-a',
      'product-b'
    ));
    expect(results.targets).toEqual(buttons('product-a', 'product-b'));
    expect(model.rootContext.targets).toEqual(targetList);
    expect(model.directContextByTarget.size).toBe(targetList.length);
  });

  it('uses a heading rank stack, including skipped levels and same-rank closure', () => {
    document.body.innerHTML = `
      <h2>Alpha</h2>
      <button id="alpha">Alpha target</button>
      <h4>Alpha detail</h4>
      <button id="detail">Detail target</button>
      <div role="heading">Malformed heading</div>
      <button id="still-detail">Still detail</button>
      <h2>Beta</h2>
      <button id="beta">Beta target</button>
    `;
    const model = buildStructuralModel({
      root: document,
      targets: buttons('alpha', 'detail', 'still-detail', 'beta'),
    });

    const alpha = contextNamed(model, 'Alpha');
    const detail = contextNamed(model, 'Alpha detail');
    const beta = contextNamed(model, 'Beta');

    expect(detail.parent).toBe(alpha);
    expect(detail.headingLevel).toBe(4);
    expect(alpha.headingLevel).toBe(2);
    expect(alpha.parent).toBe(model.rootContext);
    expect(beta.parent).toBe(model.rootContext);
    expect(alpha.targets).toEqual(buttons('alpha', 'detail', 'still-detail'));
    expect(detail.targets).toEqual(buttons('detail', 'still-detail'));
    expect(beta.targets).toEqual(buttons('beta'));
    expect(alpha.visualElements).toContain(document.querySelector('h2'));
    expect(alpha.visualElements).toContain(document.getElementById('still-detail'));
    expect(alpha.visualElements).not.toContain(
      Array.from(document.querySelectorAll('h2'))[1]
    );
    expect(contextNamed(model, 'Malformed heading')).toBeUndefined();
  });

  it('ends a heading context where its sibling focusable wrapper begins', () => {
    document.body.innerHTML = `
      <div id="cards">
        <div id="first-card" role="button" tabindex="0">
          <header><h2>First card</h2></header>
          <p>First content</p>
        </div>
        <div id="second-card" role="button" tabindex="0">
          <header><h2>Second card</h2></header>
          <p>Second content</p>
        </div>
      </div>
      <section id="following-region" aria-labelledby="following-heading">
        <h3 id="following-heading">Following region</h3>
        <button id="following-target">Following target</button>
      </section>
    `;
    const firstCard = document.getElementById('first-card');
    const secondCard = document.getElementById('second-card');
    const followingTarget = document.getElementById('following-target');
    const model = buildStructuralModel({
      root: document,
      targets: [firstCard, secondCard, followingTarget],
    });
    const first = contextNamed(model, 'First card');
    const second = contextNamed(model, 'Second card');

    expect(first.memberTargets).toEqual([firstCard]);
    expect(first.visualElements).toContain(firstCard);
    expect(first.visualElements).not.toContain(secondCard);
    expect(first.visualElements).not.toContain(
      secondCard.querySelector('header')
    );
    expect(first.visualElements).not.toContain(secondCard.querySelector('h2'));
    expect(second.memberTargets).toEqual([secondCard]);
    expect(second.visualElements).not.toContain(
      document.getElementById('following-region')
    );
    expect(second.visualElements).not.toContain(
      document.getElementById('following-heading')
    );
    expect(second.visualElements).not.toContain(followingTarget);
    expect(model.directContextByTarget.get(firstCard)).toBe(first);
    expect(model.directContextByTarget.get(secondCard)).toBe(second);
  });

  it('assigns a tabbable heading wrapper to its first contained heading', () => {
    document.body.innerHTML = `
      <a
        id="sociocultural-theme"
        class="hover:underline hover:decoration-amber-600"
        href="/research/#theme=sociocultural-design"
      >
        <h2>Sociocultural Design</h2>
      </a>
      <button id="theme-details">Theme details</button>
      <a id="multi-heading-link" href="#family">
        <h2>Heading family</h2>
        <h3>Nested heading</h3>
      </a>
      <button id="nested-target">Nested target</button>
      <a id="non-tabbable-heading-wrapper">
        <h2>Non-tabbable family</h2>
        <h3>Non-tabbable detail</h3>
      </a>
      <button id="non-tabbable-detail-target">Detail target</button>
    `;
    const targets = Array.from(document.querySelectorAll('a[href], button'));
    const model = buildStructuralModel({ root: document, targets });
    const sociocultural = contextNamed(model, 'Sociocultural Design');
    const family = contextNamed(model, 'Heading family');
    const nested = contextNamed(model, 'Nested heading');
    const nonTabbableDetail = contextNamed(model, 'Non-tabbable detail');

    expect(model.directContextByTarget.get(
      document.getElementById('sociocultural-theme')
    )).toBe(sociocultural);
    expect(sociocultural.targets[0])
      .toBe(document.getElementById('sociocultural-theme'));
    expect(model.directContextByTarget.get(
      document.getElementById('multi-heading-link')
    )).toBe(family);
    expect(model.directContextByTarget.get(
      document.getElementById('multi-heading-link')
    )).not.toBe(nested);
    expect(model.directContextByTarget.get(
      document.getElementById('nested-target')
    )).toBe(nested);
    expect(model.directContextByTarget.has(
      document.getElementById('non-tabbable-heading-wrapper')
    )).toBe(false);
    expect(model.directContextByTarget.get(
      document.getElementById('non-tabbable-detail-target')
    )).toBe(nonTabbableDetail);
  });

  it('exposes every authored level inside one contenteditable focus target', () => {
    document.body.innerHTML = `
      <div id="editor" role="region" aria-label="Detail" contenteditable="true">
        <h2>Document title</h2>
        <p>Introduction</p>
        <h4>Skipped-rank section</h4>
        <p>Section detail</p>
      </div>
    `;
    const editor = document.getElementById('editor');
    const model = buildStructuralModel({ root: document, targets: [editor] });
    const documentTitle = contextNamed(model, 'Document title');
    const skippedRank = contextNamed(model, 'Skipped-rank section');

    expect(documentTitle.targets).toEqual([editor]);
    expect(skippedRank.targets).toEqual([editor]);
    expect(model.directContextByTarget.get(editor)).toBe(documentTitle);
    expect(skippedRank.parent).toBe(documentTitle);
  });

  it('preserves same-rank heading contexts across different parents', () => {
    document.body.innerHTML = `
      <h2>First family</h2>
      <h3>Current level-three context</h3>
      <button id="current">Current</button>
      <h2>Second family</h2>
      <h3>Next level-three context</h3>
      <button id="next">Next</button>
    `;
    const model = buildStructuralModel({
      root: document,
      targets: buttons('current', 'next'),
    });

    const current = contextNamed(model, 'Current level-three context');
    const next = contextNamed(model, 'Next level-three context');

    expect(current).toBeDefined();
    expect(next).toBeDefined();
    expect(current.headingLevel).toBe(3);
    expect(next.headingLevel).toBe(3);
    expect(current.parent.name).toBe('First family');
    expect(next.parent.name).toBe('Second family');
    expect(current.parent).not.toBe(next.parent);
  });

  it('merges an explicit section with its own heading boundary', () => {
    document.body.innerHTML = `
      <section aria-labelledby="title">
        <h2 id="title">One section</h2>
        <button id="one">One</button>
        <button id="two">Two</button>
      </section>
      <section aria-label="Other section">
        <button id="outside">Outside</button>
      </section>
    `;
    const model = buildStructuralModel({
      root: document,
      targets: buttons('one', 'two', 'outside'),
    });

    expect(contexts(model).filter(context => context.name === 'One section'))
      .toHaveLength(1);
    expect(contextNamed(model, 'One section').type).toBe('section');
    expect(contextNamed(model, 'One section').headingLevel).toBe(2);
  });

  it('keeps a later heading as a child range instead of using it as the container title', () => {
    document.body.innerHTML = `
      <section aria-label="Container">
        <button id="before">Before</button>
        <h2>Details</h2>
        <button id="after">After</button>
      </section>
      <section aria-label="Sibling">
        <button id="sibling">Sibling</button>
      </section>
    `;
    const model = buildStructuralModel({
      root: document,
      targets: buttons('before', 'after', 'sibling'),
    });

    const container = contextNamed(model, 'Container');
    const details = contextNamed(model, 'Details');
    expect(details.parent).toBe(container);
    expect(details.targets).toEqual(buttons('after'));
    expect(model.directContextByTarget.get(document.getElementById('before')))
      .toBe(container);
  });

  it('collapses redundant unary layers, including a semantic active root', () => {
    document.body.innerHTML = `
      <main id="scope" aria-label="Scope">
        <section aria-label="Only section">
          <button id="only">Only target</button>
        </section>
      </main>
    `;
    const scope = document.getElementById('scope');
    const model = buildStructuralModel({
      root: scope,
      targets: buttons('only'),
    });

    expect(Array.from(model.contexts.values())).toEqual([model.rootContext]);
    expect(model.rootContext.name).toBe('Scope');
    expect(model.directContextByTarget.get(document.getElementById('only')))
      .toBe(model.rootContext);
  });

  it('creates list-item contexts only for a structurally rich list', () => {
    document.body.innerHTML = `
      <ul id="simple" aria-label="Simple list">
        <li><button id="simple-a">A</button></li>
        <li><button id="simple-b">B</button></li>
      </ul>
      <ul id="rich" aria-label="Rich list">
        <li><button id="rich-a">A</button></li>
        <li>
          <button id="rich-b">B</button>
          <a id="rich-details" href="#details">Details</a>
        </li>
      </ul>
    `;
    const model = buildStructuralModel({
      root: document,
      targets: buttons(
        'simple-a',
        'simple-b',
        'rich-a',
        'rich-b',
        'rich-details'
      ),
    });

    const simple = contextNamed(model, 'Simple list');
    const rich = contextNamed(model, 'Rich list');
    expect(simple.children.filter(context => context.type === 'listitem'))
      .toHaveLength(0);
    expect(rich.children.filter(context => context.type === 'listitem'))
      .toHaveLength(2);
  });

  it('ignores hidden/suppressed semantics without dropping native targets', () => {
    document.body.innerHTML = `
      <section aria-label="Credible">
        <button id="credible">Credible</button>
      </section>
      <section aria-hidden="true" aria-label="Hidden semantics">
        <button id="hidden-target">Still tabbable</button>
      </section>
      <section role="presentation" aria-label="Suppressed semantics">
        <button id="suppressed-target">Still tabbable</button>
      </section>
      <h2 role="none">Suppressed heading</h2>
      <button id="suppressed-heading-target">Still a target</button>
      <ul aria-label="List">
        <li role="presentation">
          <button id="suppressed-listitem-target">Suppressed item</button>
          <button id="suppressed-listitem-extra">Suppressed item extra</button>
        </li>
        <li><button id="ordinary-listitem-target">Ordinary item</button></li>
      </ul>
      <div aria-label="Generic label">
        <button id="generic-target">Generic</button>
      </div>
      <div aria-controls="credible">
        <button id="controlled-target">Controlled</button>
      </div>
    `;
    const targetList = buttons(
      'credible',
      'hidden-target',
      'suppressed-target',
      'suppressed-heading-target',
      'suppressed-listitem-target',
      'suppressed-listitem-extra',
      'ordinary-listitem-target',
      'generic-target',
      'controlled-target'
    );
    const model = buildStructuralModel({ root: document, targets: targetList });

    expect(contextNamed(model, 'Credible')).toBeDefined();
    expect(contextNamed(model, 'Hidden semantics')).toBeUndefined();
    expect(contextNamed(model, 'Suppressed semantics')).toBeUndefined();
    expect(contextNamed(model, 'Suppressed heading')).toBeUndefined();
    expect(contextNamed(model, 'Generic label')).toBeUndefined();
    expect(contexts(model).filter(context => context.type === 'listitem'))
      .toHaveLength(0);
    expect(model.rootContext.targets).toEqual(targetList);
  });

  it('keeps semantically hidden targets out of heading membership and geometry', () => {
    document.body.innerHTML = `
      <div id="heading-wrapper">
        <h2 id="first-heading">First heading</h2>
        <button id="first-target">First target</button>
        <h2 id="second-heading">Second heading</h2>
        <button id="second-target">Second target</button>
      </div>
      <section id="hidden-section" aria-hidden="true">
        <h2 id="hidden-heading">Hidden heading</h2>
        <button id="hidden-target">Still in the target inventory</button>
      </section>
      <section id="trailing-section" aria-label="Trailing region">
        <button id="trailing-target">Visible trailing target</button>
      </section>
    `;
    const hiddenTarget = document.getElementById('hidden-target');
    const model = buildStructuralModel({
      root: document,
      targets: buttons(
        'first-target',
        'second-target',
        'hidden-target',
        'trailing-target'
      ),
    });
    const second = contextNamed(model, 'Second heading');

    expect(model.targets).toContain(hiddenTarget);
    expect(model.directContextByTarget.get(hiddenTarget)).toBe(model.rootContext);
    expect(second.targets).toEqual(buttons('second-target'));
    expect(second.memberTargets).toEqual(buttons('second-target'));
    expect(second.visualElements).toContain(
      document.getElementById('second-heading')
    );
    expect(second.visualElements).toContain(
      document.getElementById('second-target')
    );
    expect(second.visualElements).not.toContain(
      document.getElementById('hidden-section')
    );
    expect(second.visualElements).not.toContain(
      document.getElementById('hidden-heading')
    );
    expect(second.visualElements).not.toContain(hiddenTarget);
    expect(second.targets).not.toContain(
      document.getElementById('trailing-target')
    );
    expect(second.visualElements).not.toContain(
      document.getElementById('trailing-section')
    );
    expect(second.visualElements).not.toContain(
      document.getElementById('trailing-target')
    );
    expect(contextNamed(model, 'Hidden heading')).toBeUndefined();
  });

  it('preserves the supplied global target order in every flattened sequence', () => {
    document.body.innerHTML = `
      <section aria-label="Ordered">
        <button id="dom-first">First in DOM</button>
        <button id="dom-second">Second in DOM</button>
      </section>
      <section aria-label="Outside">
        <button id="outside">Outside</button>
      </section>
    `;
    const suppliedOrder = buttons('dom-second', 'dom-first', 'outside');
    const model = buildStructuralModel({
      root: document,
      targets: suppliedOrder,
    });

    expect(contextNamed(model, 'Ordered').targets)
      .toEqual(buttons('dom-second', 'dom-first'));
    expect(model.rootContext.targets).toEqual(suppliedOrder);
  });

  it('accepts application structural contexts and rejects partial tree overlap', () => {
    document.body.innerHTML = `
      <div id="application-group">
        <button id="a">A</button>
        <button id="b">B</button>
      </div>
      <button id="c">C</button>
    `;
    const targetList = buttons('a', 'b', 'c');
    const model = buildStructuralModel({
      root: document,
      targets: targetList,
      structuralContexts: [
        {
          id: 'application-group',
          name: 'Application group',
          boundary: document.getElementById('application-group'),
          required: true,
        },
        {
          id: 'invalid-overlap',
          name: 'Invalid overlap',
          targets: buttons('b', 'c'),
          order: 2,
        },
      ],
    });

    expect(model.contexts.get('application-group').targets).toEqual(buttons('a', 'b'));
    expect(model.contexts.has('invalid-overlap')).toBe(false);
    expect(model.rejectedContexts.map(context => context.id))
      .toContain('invalid-overlap');
  });

  it('normalizes typed membership by priority without duplicating targets', () => {
    document.body.innerHTML = `
      <button id="a">A</button>
      <button id="current">Current</button>
      <button id="b">B</button>
    `;
    const current = document.getElementById('current');
    const targetList = buttons('a', 'current', 'b');
    const model = buildStructuralModel({
      root: document,
      targets: targetList,
      typedContexts: [
        {
          id: 'later',
          name: 'Later',
          type: 'column',
          priority: 20,
          provenance: 'test',
          targets: () => [current, current, document.getElementById('b')],
        },
        {
          id: 'first',
          name: 'First',
          type: 'row',
          priority: 10,
          provenance: 'test',
          targets: () => [document.getElementById('a'), current],
        },
      ],
    });

    expect(model.typedContextsByTarget.get(current).map(context => context.id))
      .toEqual(['first', 'later']);
    expect(model.typedContexts.get('later').targets)
      .toEqual(buttons('current', 'b'));
    expect(model.directContextByTarget.get(current)).toBe(model.rootContext);
  });

  it('drops stale targets and typed memberships on rebuild', () => {
    document.body.innerHTML = `
      <section aria-label="Dynamic">
        <button id="a">A</button>
        <button id="b">B</button>
      </section>
    `;
    const a = document.getElementById('a');
    const b = document.getElementById('b');
    const typed = [{
      id: 'peer',
      name: 'Peer',
      type: 'application',
      provenance: 'test',
      targets: () => [a, b],
    }];
    const initial = buildStructuralModel({
      root: document,
      targets: [a, b],
      typedContexts: typed,
    });

    b.remove();
    const rebuilt = buildStructuralModel({
      root: document,
      targets: [a, b],
      typedContexts: typed,
      previousModel: initial,
    });

    expect(rebuilt.targets).toEqual([a]);
    expect(rebuilt.directContextByTarget.has(b)).toBe(false);
    expect(rebuilt.typedContexts.get('peer').targets).toEqual([a]);
  });
});
