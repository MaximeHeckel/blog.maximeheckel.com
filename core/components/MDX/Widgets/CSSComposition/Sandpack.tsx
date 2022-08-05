import { useTheme } from '@maximeheckel/design-system';
import Sandpack from '@theme/components/Code/Sandpack';

const SceneCSSDark = `
html {
    background: #20222B;
}

canvas {
    width: 100vw;
    height: 100vh;
}`;

const SceneCSSLight = `
html {
    background: #F7F7FB;
}

canvas {
    width: 100vw;
    height: 100vh;
}`;

const AppCode = `import { styled } from '@stitches/react';
import './scene.css';

const StyledButton = styled('button', {
    height: '45px',
    borderRadius: '8px',
    boxShadow: 'none',
    border: 'none',
    padding: '8px 16px',
    textAlign: 'center',
    color: 'var(--text-color)',
    backgroundColor: 'var(--primary)',
    cursor: 'pointer',
    fontWeight: '500',
    '&:hover': {
      backgroundColor: 'var(--primary-hover)',
    },
    '&:focus': {
      backgroundColor: 'var(--primary-focus)',
    },
  });
  
  /**
    You can try to modify the lightness or base hue/saturation below.
    You should see that the button hover and focus color will adapt and take into account
    almost (see below why) any color!
  **/
  const BlueThemeWrapper = styled('div', {
    '--base-primary': '222, 89%',
    '--base-primary-lightness': '50%',
    '--primary': 'hsla(var(--base-primary), var(--base-primary-lightness), 100%)',
    '--primary-hover': \`hsla(
      var(--base-primary),
      calc(var(--base-primary-lightness) - 10%),
      /* --primary-hover is --primary but 10% darker */ 100%
    )\`,
    '--primary-focus': \`hsla(
      var(--base-primary),
      calc(var(--base-primary-lightness) - 20%),
      /* --primary-hover is --primary but 20% darker */ 100%
    )\`,
    '--text-color': 'hsla(0, 0%, 100%, 100%)',
  });
  
  const CyanThemedWrapper = styled('div', {
    '--base-primary': '185, 75%',
    '--base-primary-lightness': '60%',
    '--primary': 'hsla(var(--base-primary), var(--base-primary-lightness), 100%)',
    '--primary-hover': \`hsla(
      var(--base-primary),
      calc(var(--base-primary-lightness) - 10%),
      100%
    )\`,
    '--primary-focus': \`hsla(
      var(--base-primary),
      calc(var(--base-primary-lightness) - 20%),
      100%
    )\`,
    '--text-color': 'hsla(0, 0%, 100%, 100%)',
  });
  
  const RedThemeWrapper = styled('div', {
    '--base-primary': '327, 80%',
    '--base-primary-lightness': '40%',
    '--primary': 'hsla(var(--base-primary), var(--base-primary-lightness), 100%)',
    '--primary-hover': \`hsla(
      var(--base-primary),
      calc(var(--base-primary-lightness) - 10%),
      100%
    )\`,
    '--primary-focus': \`hsla(
      var(--base-primary),
      calc(var(--base-primary-lightness) - 20%),
      100%
    )\`,
    '--text-color': 'hsla(0, 0%, 100%, 100%)',
  });
  

const Test = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '175px',
      }}
    >
      <BlueThemeWrapper>
        <StyledButton>Primary Button</StyledButton>
      </BlueThemeWrapper>
      <CyanThemedWrapper>
        <StyledButton>Primary Button</StyledButton>
      </CyanThemedWrapper>
      <RedThemeWrapper>
        <StyledButton>Primary Button</StyledButton>
      </RedThemeWrapper>
    </div>
  );
}

export default Test;`;

const CSSCompositionSandpack = () => {
  const { dark } = useTheme();

  return (
    <Sandpack
      autorun
      template="react"
      dependencies={{
        '@stitches/react': '^1.2.7',
      }}
      files={{
        '/App.js': {
          code: AppCode,
        },
        '/scene.css': {
          code: dark ? SceneCSSDark : SceneCSSLight,
          hidden: true,
        },
      }}
    />
  );
};

export default CSSCompositionSandpack;
