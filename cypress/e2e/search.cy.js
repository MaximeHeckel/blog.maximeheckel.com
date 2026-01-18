describe('Command Menu tests', () => {
  it('Toggles the command menu when hitting ctrl + k', () => {
    cy.visit('/');
    cy.wait(2000);
    cy.get('body').type('{ctrl}k');
    cy.get('[data-testid="command-menu"]').should('be.visible');
    cy.get('[data-testid="command-input"]').should('exist');
    cy.get('[data-testid="navigation"]').should('exist');
    cy.get('[data-testid="nav-design"]').should('exist');
    cy.get('[data-testid="aimode"]').should('exist');
    cy.get('[data-testid="link-twitter"]').should('exist');
    cy.get('[data-testid="link-work"]').should('exist');
    cy.get('[data-testid="nav-rss"]').should('exist');
    cy.get('[data-testid="link-contact"]').should('exist');
  });

  it('Hides the command menu when hitting esc', () => {
    cy.visit('/');
    cy.wait(2000);
    cy.get('body').type('{ctrl}k');
    cy.get('[data-testid="command-menu"]').should('be.visible');
    cy.wait(1000);
    cy.get('body').type('{esc}');
    cy.get('[data-testid="command-menu"]').should('not.exist');
  });

  it('Hides the command menu when clicking on the overlay', () => {
    cy.visit('/');
    cy.wait(2000);
    cy.get('body').type('{ctrl}k');
    cy.get('[data-testid="command-menu"]').should('be.visible');
    cy.wait(1000);
    cy.get('body').click(10, 10, { force: true });

    cy.get('[data-testid="command-menu"]').should('not.exist');
  });

  it('Enters search mode, queries the search endpoint and returns clickable results', () => {
    cy.intercept('POST', '/api/search', [
      {
        title: 'Migrating to Next.js',
        url: 'https://blog.maximeheckel.com/posts/migrating-to-nextjs/',
      },
    ]).as('search');

    cy.visit('/');
    cy.wait(2000);
    cy.get('body').type('{ctrl}k');

    cy.get('[data-testid="command-menu"]').should('be.visible');

    // Click on "Search blog posts" to enter search mode
    cy.get('[data-testid="search-tool"]').click();

    // Now type the search query
    cy.get('[data-testid="command-input"]').type('react');
    cy.wait('@search');
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

    cy.get('[data-testid="ai-prompt-serialized-response"]', {
      timeout: 60000,
    }).should(
      'contain.text',
      'You can compose CSS variables by assigning a partial value to a variable'
    );
  });
});
