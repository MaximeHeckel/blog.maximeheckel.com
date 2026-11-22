describe('Design page styling', () => {
  it('keeps the Sandpack file tabs aligned with the editor', () => {
    cy.viewport(1440, 900);
    cy.visit('/design/');

    cy.get('#code-block .sp-tabs-scrollable-container').should(($tabBar) => {
      const tabBar = $tabBar[0];
      const firstTab = tabBar.querySelector('.sp-tab-container');
      expect(firstTab.textContent).to.include('App.js');
      expect(
        firstTab.getBoundingClientRect().left -
          tabBar.getBoundingClientRect().left
      ).to.equal(4);
    });
  });

  it('preserves button typography, grid layout, and slider interactions', () => {
    cy.visit('/design/');

    cy.get('#button').parent().should('have.css', 'grid-column', '2');
    cy.get('main h1').first().should('have.css', 'letter-spacing', '-0.3px');

    cy.get('#button button')
      .first()
      .should('have.css', 'font-size', '14px')
      .and('have.css', 'font-weight', '500');
    cy.contains('#button button', 'Portfolio')
      .find('svg')
      .should(($icon) => {
        expect(getComputedStyle($icon[0]).width).to.equal('18px');
      });

    cy.get('#slider-medium')
      .should('have.css', 'height', '48px')
      .parent()
      .should('have.css', 'display', 'grid')
      .then((grid) => {
        expect(grid[0].getBoundingClientRect().width).to.be.greaterThan(100);
      });
    cy.get('#slider-small').should('have.css', 'height', '34px');
    cy.get('#slider-medium-disabled input[type="range"]').should('be.disabled');

    cy.get('#slider-medium input[type="range"]').focus();
    cy.press(Cypress.Keyboard.Keys.RIGHT);
    cy.get('#slider-medium input[type="range"]').should(
      'have.attr',
      'aria-valuenow',
      '251'
    );
  });
});
