describe('Browser theme color', () => {
  it('keeps the same dark theme-color tag when navigating to an article and back', () => {
    cy.visit('/');
    cy.get('meta[name="theme-color"]')
      .should('have.length', 1)
      .and('have.attr', 'content', '#090A0E')
      .then(($meta) => {
        const originalMeta = $meta[0];

        cy.get('a[href="/posts/migrating-to-nextjs/"]').click();
        cy.location('pathname').should('equal', '/posts/migrating-to-nextjs/');
        cy.get('meta[name="theme-color"]').should(($current) => {
          expect($current).to.have.length(1);
          expect($current[0]).to.equal(originalMeta);
          expect($current.attr('content')).to.equal('#090A0E');
        });

        cy.get('[data-testid="index-link"]').click();
        cy.location('pathname').should('equal', '/');
        cy.get('meta[name="theme-color"]').should(($current) => {
          expect($current).to.have.length(1);
          expect($current[0]).to.equal(originalMeta);
          expect($current.attr('content')).to.equal('#090A0E');
        });

        cy.screenshot('persistent-theme-color');
      });
  });
});
