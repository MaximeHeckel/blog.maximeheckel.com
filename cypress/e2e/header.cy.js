describe('Header Tests', () => {
  it('The post title is visible when  scrolling', () => {
    cy.visit('/posts/how-to-build-first-eslint-rule/');
    cy.wait(1000);
    cy.scrollTo(0, 2000);
    cy.get('[data-testid="toc-title"]').should('be.visible');
    cy.scrollTo(0, 0).then(() => {
      cy.get('[data-testid="toc-title"]').should('not.be.visible');
    });
  });

  it('Clicking on Index redirects to the landing page', () => {
    cy.visit('/posts/how-to-build-first-eslint-rule/');
    cy.get('[data-testid="index-link"]').click();
    cy.url().should('include', '/');
  });
});
