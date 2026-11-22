export const sliderRootRecipe = {
  base: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    userSelect: 'none',
    touchAction: 'none',
    width: '100%',
    overflow: 'clip',
    backgroundColor: 'oklch(from var(--gray-900) l c h / var(--opacity, 0.3))',
    cursor: 'grab',

    '&:active': {
      cursor: 'grabbing',
    },

    '& [data-disabled]': {
      cursor: 'not-allowed !important',
    },

    '&:has(:focus-visible)': {
      outline: '2px solid var(--blue-800)',
      outlineOffset: 2,
    },
  },
  variants: {
    size: {
      sm: {
        height: '34px',
        borderRadius: '8px',
      },
      md: {
        height: '48px',
        borderRadius: '12px',
      },
    },
  },
} as const;
