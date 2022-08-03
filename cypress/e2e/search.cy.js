describe('Search tests', () => {
  it('Toggles the search box when hitting ctrl + k', () => {
    cy.visit('/');
    cy.wait(2000);
    cy.get('body').type('{ctrl}k');
    cy.get('input[id="search-input"]').clear();
    cy.get('[data-testid="search-overlay"]').should('be.visible');
    cy.get('[data-testid="search"]').should('be.visible');
    cy.get('[data-testid="link"]').should('have.length', 5);
    cy.get('[data-testid="shortcut"]').should('have.length', 2);
  });

  it('Hides the search box when hitting esc', () => {
    cy.visit('/');
    cy.wait(2000);
    cy.get('body').type('{ctrl}k');
    cy.get('input[id="search-input"]').clear();
    cy.wait(1000);
    cy.get('body').type('{esc}');
    cy.get('[data-testid="search-overlay"]').should('not.exist');
    cy.get('[data-testid="search"]').should('not.exist');
  });

  it('Hides the search box when clicking on the overlay', () => {
    cy.visit('/');
    cy.wait(2000);
    cy.get('body').type('{ctrl}k');
    cy.get('input[id="search-input"]').clear();
    cy.wait(1000);
    cy.get('body').click(10, 10);
    cy.get('[data-testid="search-overlay"]').should('not.exist');
    cy.get('[data-testid="search"]').should('not.exist');
  });

  it('Searches when typing on the input and shows results', () => {
    cy.visit('/');
    cy.wait(2000);
    cy.get('body').type('{ctrl}k');
    cy.get('[data-testid="search-overlay"]').should('be.visible');
    cy.get('[data-testid="search"]').should('be.visible');
    cy.get('input[id="search-input"]').clear().type('react');
    cy.get('[data-testid="search-result"]').should('be.visible');
  });

  it('Clicking on a result navigates the user to an article', () => {
    cy.visit('/');
    cy.wait(2000);
    cy.get('body').type('{ctrl}k', { force: true });
    cy.get('input[id="search-input"]').clear().type('react', { delay: 400 });
    cy.get('[data-testid="search-result"]').eq(0).click();
    cy.url().should('include', '/posts/');
    cy.get('[data-testid="hero"]').should('be.visible');
  });
});
