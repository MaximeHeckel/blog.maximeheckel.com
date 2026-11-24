describe('Article code block spacing', () => {
  [375, 675, 750, 751, 1280].forEach((width) => {
    it(`aligns code blocks with callouts at ${width}px`, () => {
      cy.viewport(width, 900);
      cy.visit('/posts/lighting-that-feels-just-right/');

      cy.contains('[data-code-block]', 'const worldPosition').should(
        ($code) => {
          const code = $code[0];
          const callout = code.nextElementSibling;
          expect(callout.tagName).to.equal('ASIDE');

          const codeBounds = code.getBoundingClientRect();
          const calloutBounds = callout.getBoundingClientRect();
          expect(codeBounds.left).to.be.closeTo(calloutBounds.left, 1);
          expect(codeBounds.right).to.be.closeTo(calloutBounds.right, 1);
        }
      );

      if (width === 675) {
        // Allow the article entrance and initial scroll restoration to settle.
        cy.wait(1500);
        cy.contains(
          '[data-code-block]',
          'const worldPosition'
        ).scrollIntoView();
        cy.screenshot('code-block-aligned-with-callout', {
          capture: 'viewport',
        });
      }
    });
  });
});
