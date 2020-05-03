describe('Header Tests', () => {
  it('The post title is visible when navigating to a project and scrolling', () => {
    cy.visit('http://localhost:8000/posts/how-to-build-first-eslint-rule');
    cy.get('[data-testid="footer"]').scrollIntoView({ duration: 2000 });
    cy.get('[data-testid="header-title"]')
      .should('be.visible')
      .click();
    cy.wait(1000).then(() => {
      cy.get('[data-testid="header-title"]').should('be.visible');
    });
  });

  it('Clicking on the Logo on the header redirects to the landing page', () => {
    cy.visit('http://localhost:8000/posts/how-to-build-first-eslint-rule');
    cy.get('[title="Go back to article list"]').click();
    cy.url().should('include', 'http://localhost:8000');
  });
});
