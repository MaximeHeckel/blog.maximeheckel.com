# Create a Blog Article

Create new MDX blog posts in the `content/` directory.

## Required information

Obtain the article title and publication date from the user. Use a `YYYY-MM-DD` publication date when creating the file.

## Filename and metadata

1. Generate the slug from the title by converting it to lowercase, replacing spaces with hyphens, and removing characters other than letters, numbers, and hyphens.
2. Create `content/{slug}.mdx` without overwriting an existing article.
3. Format `date` and `updated` as `{date}T08:00:00.000Z`.
4. Start with this frontmatter:

```mdx
---
title: '{title}'
subtitle: TBD
date: '{date}T08:00:00.000Z'
updated: '{date}T08:00:00.000Z'
categories: []
slug: {slug}
type: 'blogPost'
featured: false
---

{/* Start writing your article here */}
```

For example, "Building Beautiful UIs" becomes `content/building-beautiful-uis.mdx` with the slug `building-beautiful-uis`.
