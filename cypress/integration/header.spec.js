describe('Header Tests', () => {
  it('The post title is visible when navigating to a project and scrolling', () => {
    cy.visit('/posts/how-to-build-first-eslint-rule/');
    cy.get('[data-testid="footer"]').scrollIntoView({ duration: 2000 });
    cy.get('[data-testid="header-title"]').should('be.visible').click();
    cy.wait(1000).then(() => {
      cy.get('[data-testid="header-title"]').should('not.be.visible');
    });
  });

  it('Clicking on the Logo on the header redirects to the landing page', () => {
    cy.visit('/posts/how-to-build-first-eslint-rule/');
    cy.get('[data-testid="header-logo"]').click();
    cy.url().should('include', '/');
  });
});
