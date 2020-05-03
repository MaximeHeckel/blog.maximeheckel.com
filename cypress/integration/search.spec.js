describe('Search tests', () => {
  it('Toggles the search box when hitting ctrl + k', () => {
    cy.visit('http://localhost:8000');
    cy.wait(2000);
    cy.get('body').type('{ctrl}k');
    cy.get('[data-testid="searchbox-overlay"]').should('be.visible');
    cy.get('[data-testid="searchbox"]').should('be.visible');
    cy.get('[data-testid="portfolio-link"]').should('be.visible');
    cy.get('[data-testid="twitter-link"]').should('be.visible');
  });

  it('Hides the search box when hitting esc', () => {
    cy.visit('http://localhost:8000');
    cy.wait(2000);
    cy.get('body').type('{ctrl}k');
    cy.wait(1000);
    cy.get('body').type('{esc}');
    cy.get('[data-testid="searchbox-overlay"]').should('not.be.visible');
    cy.get('[data-testid="searchbox"]').should('not.be.visible');
  });

  it('Hides the search box when clicking on the overlay', () => {
    cy.visit('http://localhost:8000');
    cy.wait(2000);
    cy.get('body').type('{ctrl}k');
    cy.wait(1000);
    cy.get('body').click(10, 10);
    cy.get('[data-testid="searchbox-overlay"]').should('not.be.visible');
    cy.get('[data-testid="searchbox"]').should('not.be.visible');
  });

  // it('Searches when typing on the input and shows results', () => {
  //   cy.visit('http://localhost:8000');
  //   cy.wait(2000);
  //   cy.get('body').type('{ctrl}k');
  //   cy.get('[data-testid="searchbox-overlay"]').should('be.visible');
  //   cy.get('[data-testid="searchbox"]').should('be.visible');
  //   cy.get('input')
  //     .clear()
  //     .type('react');
  //   cy.get('[data-testid="search-result"]').should('be.visible');
  // });

  it('Clicking on a result navigates the user to an article', () => {
    cy.visit('http://localhost:8000/');
    cy.wait(2000);
    cy.get('body').type('{ctrl}k', { force: true });
    cy.get('input')
      .clear()
      .type('react', { delay: 400 });
    cy.get('[data-testid="search-result"]')
      .eq(0)
      .click();
    cy.url().should('include', '/posts/');
    cy.get('[data-testid="hero"]').should('be.visible');
  });
});
