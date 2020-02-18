describe('Landing Tests', () => {
  it('Loads the landing page', () => {
    cy.visit('http://localhost:8000');
    cy.get('[data-testid="article-list"]').should('be.visible');
    cy.get('[data-testid="article-item"]').should('be.visible');
  });

  it('Loads the landing page in light mode by default', () => {
    cy.visit('http://localhost:8000');
    cy.get('[data-testid="lightmode"]').should('exist');
  });

  it('Loads the landing page in dark mode by default if local storage has dark: true ', () => {
    cy.visit('http://localhost:8000');
    localStorage.setItem('dark', 'true');
    cy.get('[data-testid="darkmode"]').should('exist');
  });

  it('Clicking on the theme switcher should change the theme from light to dark', () => {
    cy.visit('http://localhost:8000');
    cy.get('[data-testid="lightmode"]').should('exist');
    cy.get('[data-testid="darkmode-switch"]')
      .should('be.visible')
      .click();
    cy.get('[data-testid="darkmode"]').should('exist');
    cy.wait(500).then(() => {
      expect(localStorage.getItem('dark')).to.eq('true');
    });
  });

  it('Clicking on the theme switcher while in dark mode should change the theme from dark to light', () => {
    cy.visit('http://localhost:8000');
    localStorage.setItem('dark', 'true');
    cy.get('[data-testid="darkmode"]').should('exist');
    cy.get('[data-testid="darkmode-switch"]')
      .should('be.visible')
      .click();
    cy.get('[data-testid="lightmode"]').should('exist');
    cy.wait(500).then(() => {
      expect(localStorage.getItem('dark')).to.eq('false');
    });
  });

  it('Theme should stay the same after refreshing the page', () => {
    cy.visit('http://localhost:8000');
    cy.get('[data-testid="lightmode"]').should('exist');
    cy.get('[data-testid="darkmode-switch"]')
      .should('be.visible')
      .click();
    cy.reload();
    cy.get('[data-testid="darkmode"]').should('exist');
  });
});
