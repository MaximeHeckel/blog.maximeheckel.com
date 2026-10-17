import { HERO_THEME_COLOR, PAGE_THEME_COLOR } from '../../lib/browserTheme';

describe('Browser theme color', () => {
  it('updates the same theme-color tag when scrolling between the hero and articles', () => {
    cy.visit('/');
    cy.get('meta[name="theme-color"]')
      .should('have.length', 1)
      .and('have.attr', 'content', HERO_THEME_COLOR)
      .then(($meta) => {
        const originalMeta = $meta[0];

        cy.get('#articles').scrollIntoView();
        cy.get('meta[name="theme-color"]').should(($current) => {
          expect($current).to.have.length(1);
          expect($current[0]).to.equal(originalMeta);
          expect($current.attr('content')).to.equal(PAGE_THEME_COLOR);
        });

        cy.scrollTo('top');
        cy.get('meta[name="theme-color"]').should(($current) => {
          expect($current).to.have.length(1);
          expect($current[0]).to.equal(originalMeta);
          expect($current.attr('content')).to.equal(HERO_THEME_COLOR);
        });
      });
  });

  it('updates the same theme-color tag when navigating to an article and back', () => {
    cy.visit('/');
    cy.get('meta[name="theme-color"]')
      .should('have.length', 1)
      .and('have.attr', 'content', HERO_THEME_COLOR)
      .then(($meta) => {
        const originalMeta = $meta[0];

        cy.get('a[href="/posts/migrating-to-nextjs/"]').click();
        cy.location('pathname').should('equal', '/posts/migrating-to-nextjs/');
        cy.get('meta[name="theme-color"]').should(($current) => {
          expect($current).to.have.length(1);
          expect($current[0]).to.equal(originalMeta);
          expect($current.attr('content')).to.equal(PAGE_THEME_COLOR);
        });

        cy.get('[data-testid="index-link"]').click();
        cy.location('pathname').should('equal', '/');
        cy.get('meta[name="theme-color"]').should(($current) => {
          expect($current).to.have.length(1);
          expect($current[0]).to.equal(originalMeta);
          expect($current.attr('content')).to.equal(HERO_THEME_COLOR);
        });

        cy.screenshot('persistent-theme-color');
      });
  });
});
