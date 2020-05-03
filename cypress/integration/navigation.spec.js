describe('Navigation Tests', () => {
  it('It can go from the landing page to an article', () => {
    cy.visit('http://localhost:8000');
    cy.get('[data-testid="article-list"]').should('be.visible');
    cy.get('[data-testid="article-item"]').should('be.visible');
    cy.get('[data-testid="article-link"]')
      .eq(0)
      .click();
    cy.url().should('include', '/posts/');
    cy.get('[data-testid="hero"]').should('be.visible');
  });
  it('It can go from an article to the landing page', () => {
    cy.visit('http://localhost:8000/posts/how-to-build-first-eslint-rule');
    cy.get('[title="Go back to article list"]').click();
    cy.url().should('include', 'http://localhost:8000');
    cy.get('[data-testid="article-list"]').should('be.visible');
    cy.get('[data-testid="article-item"]').should('be.visible');
  });
  it('It shows the progress bar when scrolling', () => {
    cy.visit('http://localhost:8000');
    cy.get(
      'a[href="/posts/switching-off-the-lights-part-2-fixing-dark-mode-flashing-on-servered-rendered-website"]'
    ).click({ force: true });
    cy.url().should('include', '/posts/');
    cy.get('[data-testid="hero"]').should('be.visible');
    cy.get('[data-testid="progress-bar"]').should('not.be.visible');
    cy.scrollTo(0, 800);
    cy.get('[data-testid="progress-bar"]').should('be.visible');
  });
});
