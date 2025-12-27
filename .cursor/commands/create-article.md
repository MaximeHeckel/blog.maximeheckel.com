---
alwaysApply: false
---

# Create New Blog Article

Create a new MDX blog post file in the `content/` directory.

## Required Inputs

1. **Title**: Ask the user for the article title
2. **Date**: Ask the user for the publication date (format: YYYY-MM-DD)

## Instructions

1. Ask the user for the **title** of the article
2. Ask the user for the **publication date** (e.g., "2025-01-15" or "January 15, 2025")
3. Generate the slug from the title:
   - Convert to lowercase
   - Replace spaces with hyphens
   - Remove special characters (keep only alphanumeric and hyphens)
   - Example: "My Amazing Article!" → "my-amazing-article"
4. Format the date as ISO 8601: `YYYY-MM-DDTHH:MM:SS.000Z` (use T08:00:00.000Z for time)
5. Create the MDX file at `content/{slug}.mdx` using the template below

## Template

Use this frontmatter template:

```mdx
---
title: '{title}'
subtitle: TBD
date: '{date}T08:00:00.000Z'
updated: '{date}T08:00:00.000Z'
categories: []
slug: { slug }
type: 'blogPost'
featured: false
---

{/* Start writing your article here */}
```

## Example

For title "Building Beautiful UIs" and date "2025-01-15":

- File: `content/building-beautiful-uis.mdx`
- Slug: `building-beautiful-uis`
- Formatted date: `2025-01-15T08:00:00.000Z`
