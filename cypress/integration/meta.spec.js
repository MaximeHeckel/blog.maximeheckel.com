describe('SEO: Verify meta tag integrity', () => {
  it('has all the meta tags and the expected canonical url set in the landing page head', () => {
    cy.visit('/');
    cy.get('title').should('contain', "Maxime Heckel's Blog");
    cy.get('meta[name="description"]').should(
      'have.attr',
      'content',
      "Hi I'm Maxime, and this is my blog. Here, I share through my writing my experience as a frontend engineer and everything I'm learning about on React, Typescript, SwiftUI, Serverless, and testing."
    );
    cy.get('meta[name="twitter:site"]')
      .should('have.attr', 'content')
      .and('contain', '@MaximeHeckel');
    cy.get('meta[name="twitter:creator"]')
      .should('have.attr', 'content')
      .and('contain', '@MaximeHeckel');
    cy.get('meta[name="twitter:card"]').should(
      'have.attr',
      'content',
      'summary_large_image'
    );
    cy.get('meta[name="robots"]')
      .should('have.attr', 'content')
      .and('contain', 'index,follow');
    cy.get('meta[name="googlebot"]')
      .should('have.attr', 'content')
      .and('contain', 'index,follow');
    cy.get('meta[property="og:type"]').should(
      'have.attr',
      'content',
      'website'
    );
    cy.get('meta[property="og:title"]').should(
      'have.attr',
      'content',
      "Maxime Heckel's Blog"
    );
    cy.get('meta[property="og:description"]').should(
      'have.attr',
      'content',
      "Hi I'm Maxime, and this is my blog. Here, I share through my writing my experience as a frontend engineer and everything I'm learning about on React, Typescript, SwiftUI, Serverless, and testing."
    );
    cy.get('meta[property="og:image"]')
      .should('have.attr', 'content')
      .and('contain', 'static/og/main-og-image.png');
    cy.get('meta[property="og:image:width"]')
      .should('have.attr', 'content')
      .and('contain', '1280');
    cy.get('meta[property="og:image:height"]')
      .should('have.attr', 'content')
      .and('contain', '720');
    cy.get('meta[property="og:image:alt"]')
      .should('have.attr', 'content')
      .and('contain', "Maxime Heckel's Blog");

    cy.get('meta[property="og:url"]').should('have.attr', 'content');
    cy.get('link[rel="canonical"]').should('have.attr', 'href');
  });

  it('has all the meta tags and the expected canonical url set in the blog post head', () => {
    cy.visit('/posts/migrating-to-nextjs/');
    cy.get('title').should(
      'contain',
      "Migrating to Next.js - Maxime Heckel's Blog"
    );
    cy.get('meta[name="description"]').should(
      'have.attr',
      'content',
      'Some thoughts on my experience using Gatsby for my blog and migrating it to Next.js, and why this was the right call for me going forward.'
    );
    cy.get('meta[name="twitter:site"]')
      .should('have.attr', 'content')
      .and('contain', '@MaximeHeckel');
    cy.get('meta[name="twitter:creator"]')
      .should('have.attr', 'content')
      .and('contain', '@MaximeHeckel');
    cy.get('meta[name="twitter:card"]').should(
      'have.attr',
      'content',
      'summary_large_image'
    );
    cy.get('meta[name="robots"]')
      .should('have.attr', 'content')
      .and('contain', 'index,follow');
    cy.get('meta[name="googlebot"]')
      .should('have.attr', 'content')
      .and('contain', 'index,follow');
    cy.get('meta[property="og:type"]').should(
      'have.attr',
      'content',
      'article'
    );
    cy.get('meta[property="og:title"]').should(
      'have.attr',
      'content',
      "Migrating to Next.js - Maxime Heckel's Blog"
    );
    cy.get('meta[property="og:description"]').should(
      'have.attr',
      'content',
      'Some thoughts on my experience using Gatsby for my blog and migrating it to Next.js, and why this was the right call for me going forward.'
    );
    cy.get('meta[property="og:image"]')
      .should('have.attr', 'content')
      .and('contain', 'static/og/5ccb1c48613db88dd6c9c40a884d8998.png');
    cy.get('meta[property="og:image:width"]')
      .should('have.attr', 'content')
      .and('contain', '1280');
    cy.get('meta[property="og:image:height"]')
      .should('have.attr', 'content')
      .and('contain', '720');
    cy.get('meta[property="og:image:alt"]')
      .should('have.attr', 'content')
      .and('contain', "Migrating to Next.js - Maxime Heckel's Blog");
    cy.get('meta[property="og:url"]')
      .should('have.attr', 'content')
      .and('contain', '/posts/migrating-to-nextjs/');
    cy.get('link[rel="canonical"]')
      .should('have.attr', 'href')
      .and('contain', '/posts/migrating-to-nextjs/');
  });
});
