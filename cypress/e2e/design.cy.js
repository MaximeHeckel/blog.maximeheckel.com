describe('Design page Panda CSS pilot', () => {
  it('preserves button typography, grid layout, and slider interactions', () => {
    cy.visit('/design/');

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
      .should('have.css', 'display', 'grid');
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
