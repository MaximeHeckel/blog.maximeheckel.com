describe('SEO: Verify meta tag integrity', () => {
  it('has all the meta tags and the expected canonical url set in the landing page head', async () => {
    const res = await fetch('/');
    const text = await res.text();

    const metaTags = text.match(/<meta\s[A-Za-z0-9="-:;!@\/\s]*/g) || [];
    const canonicalTag =
      text.match(/rel="canonical"\s[A-Za-z0-9="-:;!@\/\s]*/g) || [];

    expect(metaTags).to.have.length(16);
    expect(canonicalTag).to.have.length(1);
    cy.wrap(metaTags).snapshot();
    cy.wrap(canonicalTag).snapshot();
  });

  it('has all the meta tags and the expected canonical url set in the blog post head', async () => {
    const res = await fetch('/posts/how-to-build-first-eslint-rule');
    const text = await res.text();

    const metaTags = text.match(/<meta\s[A-Za-z0-9="-:;!@\/\s]*/g) || [];
    const canonicalTag =
      text.match(/rel="canonical"\s[A-Za-z0-9="-:;!@\/\s]*/g) || [];
    expect(metaTags).to.have.length(19);
    expect(canonicalTag).to.have.length(1);
    cy.wrap(metaTags).snapshot();
    cy.wrap(canonicalTag).snapshot();
  });
});
