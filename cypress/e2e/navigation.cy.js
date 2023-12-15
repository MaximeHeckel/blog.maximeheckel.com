describe('Navigation Tests', () => {
  it('It can go from the landing page to an article', () => {
    cy.visit('/');
    cy.get('[data-testid="article-list"]').should('be.visible');
    cy.get('[data-testid="article-item"]').should('be.visible');
    cy.get('[data-testid="article-link"]').eq(0).click();
    cy.url().should('include', '/posts/');
    cy.get('[data-testid="post-title"]').should('be.visible');
    cy.wait(1000);
  });
  it('It can go from an article to the landing page', () => {
    cy.visit('/posts/how-to-build-first-eslint-rule/');
    cy.get('[data-testid="post-title"]').should('be.visible');
    cy.get('[data-testid="home-link"]').click();
    cy.url().should('include', '/');
    cy.get('[data-testid="article-list"]').should('be.visible');
    cy.get('[data-testid="article-item"]').should('be.visible');
  });
});
