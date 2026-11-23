describe('On Crafting Painterly Shaders', () => {
  beforeEach(() => {
    cy.visit('/posts/on-crafting-painterly-shaders/');
  });

  it('inherits inline equation typography from the surrounding code', () => {
    cy.get('code .katex')
      .first()
      .should(($equation) => {
        const equation = $equation[0];
        const style = getComputedStyle(equation);
        const parent = getComputedStyle(equation.parentElement);
        expect(style.fontSize).to.equal(parent.fontSize);
        expect(style.lineHeight).to.equal(parent.lineHeight);
      });
  });

  it('clones the border and padding when inline code wraps', () => {
    cy.viewport(300, 700);
    cy.contains('code', 'λ = [(a + d)').should(($code) => {
      expect($code[0].getClientRects().length).to.be.greaterThan(1);
      const style = getComputedStyle($code[0]);
      expect(
        style.getPropertyValue('box-decoration-break') ||
          style.getPropertyValue('-webkit-box-decoration-break')
      ).to.equal('clone');
    });
  });

  it('shows the accent border on every side of the highlighted center cell', () => {
    cy.get('#enable-sectors').click();
    cy.get(
      '[style*="--grid-template-columns:"][style*="repeat(9, 1fr)"] > :nth-child(41)'
    ).should(($cell) => {
      const style = getComputedStyle($cell[0]);
      expect(style.borderTopWidth).to.equal('2px');
      expect(style.borderRight).to.equal(style.borderTop);
      expect(style.borderBottom).to.equal(style.borderTop);
      expect(style.borderLeft).to.equal(style.borderTop);
    });
  });
});
