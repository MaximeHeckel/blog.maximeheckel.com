describe('Header Tests', () => {
  it('The site title is visible when navigating to a project', () => {
    cy.visit('http://localhost:8000/posts/how-to-build-first-eslint-rule');
    cy.get('[data-testid="header-site-title"]').should('be.visible');
  });

  it('The post title is visible when navigating to a project and scrolling', () => {
    cy.visit('http://localhost:8000/posts/how-to-build-first-eslint-rule');
    cy.get('[data-testid="header-site-title"]').should('be.visible');
    cy.get('[data-testid="footer"]').scrollIntoView({ duration: 2000 });
    cy.get('[data-testid="header-post-title"]')
      .should('be.visible')
      .click();
    cy.wait(1000).then(() => {
      cy.get('[data-testid="header-site-title"]').should('be.visible');
    });
  });

  it('Clicking on the site title on the header redirects to the landing page', () => {
    cy.visit('http://localhost:8000/posts/how-to-build-first-eslint-rule');
    cy.get('[data-testid="header-site-title"]').click();
    cy.url().should('include', 'http://localhost:8000');
  });
});
