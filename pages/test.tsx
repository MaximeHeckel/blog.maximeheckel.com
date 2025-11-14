import { Grid } from '@maximeheckel/design-system';
import dynamic from 'next/dynamic';

const SandpackExample = dynamic(
  () => import('@core/components/MDX/Widgets/Retro/Sandpack')
);

const Test = () => {
  return (
    <Grid
      css={{
        margin: '0 auto',
        padding: '64px 16px',
        gridTemplateColumns: '1fr minmax(auto, 800px) 1fr',
        backgroundColor: 'var(--background)',
      }}
    >
      <Grid.Item col={2}>
        <SandpackExample scene="scene11" />
      </Grid.Item>
    </Grid>
  );
};

export default Test;
