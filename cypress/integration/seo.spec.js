const META_RE = /<meta\s[A-Za-z0-9="-:;!@\/\s]*/g;
const CANONICAL_RE = /rel="canonical"\s[A-Za-z0-9="-:;!@\/\s]*/g;

describe('SEO: Verify meta tag integrity', () => {
  it('has all the meta tags and the expected canonical url set in the landing page head', async () => {
    const res = await fetch('/');
    const text = await res.text();

    const metaTags = text.match(META_RE) || [];
    const canonicalTag = text.match(CANONICAL_RE) || [];

    expect(metaTags).to.have.length(20);
    expect(canonicalTag).to.have.length(1);
    cy.wrap(metaTags).snapshot();
    cy.wrap(canonicalTag).snapshot();
  });

  it('has all the meta tags and the expected canonical url set in the blog post head', async () => {
    const res = await fetch('/posts/how-to-build-first-eslint-rule');
    const text = await res.text();

    const metaTags = text.match(META_RE) || [];
    const canonicalTag = text.match(CANONICAL_RE) || [];

    expect(metaTags).to.have.length(21);
    expect(canonicalTag).to.have.length(1);

    cy.wrap(metaTags).snapshot();
    cy.wrap(canonicalTag).snapshot();
  });
});
