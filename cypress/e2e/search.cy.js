describe('Search tests', () => {
  it('Toggles the search box when hitting ctrl + k', () => {
    cy.visit('/');
    cy.wait(2000);
    cy.get('body').type('{ctrl}k');
    cy.get('input[id="search-input"]').clear();
    cy.get('[data-testid="search"]').should('be.visible');
    cy.get('[data-testid="navigation"]').should('exist');
    cy.get('[data-testid="design"]').should('exist');
    cy.get('[data-testid="aimode"]').should('exist');
    cy.get('[data-testid="twitter-social-link"]').should('exist');
    cy.get('[data-testid="maximeheckelcom-link"]').should('exist');
    cy.get('[data-testid="rss-link"]').should('exist');
    cy.get('[data-testid="email-link"]').should('exist');
  });

  it('Hides the search box when hitting esc', () => {
    cy.visit('/');
    cy.wait(2000);
    cy.get('body').type('{ctrl}k');
    cy.get('input[id="search-input"]').clear();
    cy.wait(1000);
    cy.get('body').type('{esc}');
    cy.get('[data-testid="search"]').should('not.exist');
  });

  it('Hides the search box when clicking on the overlay', () => {
    cy.visit('/');
    cy.wait(2000);
    cy.get('body').type('{ctrl}k');
    cy.get('input[id="search-input"]').clear();
    cy.wait(1000);
    cy.get('body').click(10, 10, { force: true });

    cy.get('[data-testid="search"]').should('not.exist');
  });

  it('Queries the semantic search endpoint and returns results that are clickable', () => {
    cy.intercept('POST', '/api/semanticsearch', [
      {
        title: 'Migrating to Next.js',
        url: 'https://blog.maximeheckel.com/posts/migrating-to-nextjs/',
      },
    ]).as('semanticSearch');

    cy.visit('/');
    cy.wait(2000);
    cy.get('body').type('{ctrl}k');

    cy.get('[data-testid="search"]').should('be.visible');
    cy.get('input[id="search-input"]').clear().type('react');
    cy.wait('@semanticSearch');
    cy.get('[data-testid="search-result"]').should('be.visible').eq(0).click();

    cy.url().should('include', '/posts/');
    cy.get('[data-testid="post-title"]').should('be.visible');

    // Arbitrary wait because other firefox will interrupt page load and cause some exception that Cypress will catch
    // and fail the test for.
    cy.wait(2000);
  });

  it('Can toggle AI mode and send a query', () => {
    cy.visit('/');
    cy.wait(2000);
    cy.get('body').type('{ctrl}k', { force: true });
    cy.get('[data-testid="aimode"]').click();
    cy.get('[data-testid="ai-prompt-input"]')
      .clear()
      .type('How to compose CSS variables', { delay: 200 });
    cy.get('[data-testid="ai-prompt-submit-button"]').click();

    cy.wait(2000);

    cy.get('[data-testid="ai-prompt-serialized-response"]', { timeout: 60000 })
      .should('be.visible')
      .should(
        'contain.text',
        'You can compose CSS variables by assigning apartial value to a variable'
      );
  });
});
