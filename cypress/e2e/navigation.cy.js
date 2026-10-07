describe('Navigation Tests', () => {
  it('can switch between the human article and its lightweight Markdown page', () => {
    cy.visit('/posts/learning-in-public/');
    cy.get('[data-testid="post-title"]').should('be.visible');
    cy.contains('button', 'Cmd').click();
    cy.contains('[role="option"]', 'Machine version').click();
    cy.url().should('include', '/posts/learning-in-public.md');
    cy.get('pre[aria-label="Article Markdown source"]')
      .should('be.visible')
      .and('have.attr', 'data-animate-reveal', 'true');
    cy.get('pre[aria-label="Article Markdown source"]').should(
      'have.attr',
      'data-animate-reveal',
      'false'
    );
    cy.readFile('content/learning-in-public.mdx').then((source) => {
      cy.get('pre[aria-label="Article Markdown source"] code').should(
        'have.text',
        source
      );
    });
    cy.contains('button', 'Cmd').click();
    cy.contains('[role="option"]', 'Human version').click();
    cy.location('pathname').should('equal', '/posts/learning-in-public/');
    cy.get('[data-testid="post-title"]').should('be.visible');
    cy.get('pre[aria-label="Article Markdown source"]').should('not.exist');
  });

  it('It can go from the landing page to an article', () => {
    cy.visit('/');
    cy.get('[data-testid="articles-list"]').should('be.visible');
    cy.get('[data-testid="article-link"]').should('be.visible');
    cy.get('[data-testid="article-link"]').eq(0).click();
    cy.url().should('include', '/posts/');
    cy.get('[data-testid="post-title"]').should('be.visible');
    cy.wait(1000);
  });
  it('It can go from an article to the landing page', () => {
    cy.visit('/posts/how-to-build-first-eslint-rule/');
    cy.get('[data-testid="post-title"]').should('be.visible');
    cy.get('[data-testid="index-link"]').click();
    cy.url().should('include', '/');
    cy.get('[data-testid="articles-list"]').should('be.visible');
    cy.get('[data-testid="article-link"]').should('be.visible');
  });
});
