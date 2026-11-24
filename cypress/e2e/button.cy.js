describe('Button', () => {
  it('keeps the press scale reset while disabled', () => {
    cy.visit('/design/');

    cy.get('#button button')
      .first()
      .invoke('prop', 'disabled', true)
      .should(($button) => {
        const scale = getComputedStyle($button[0]).getPropertyValue(
          '--button-scale'
        );
        expect(scale).to.equal('1');
      });
  });
});
