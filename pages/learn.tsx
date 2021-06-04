import { css } from '@emotion/react';
import styled from '@emotion/styled';
import Grid from '@theme/components/Grid';
import Layout from '@theme/layout';

const HR = styled.hr`
  height: 3px;
  background: hsl(var(--palette-gray-20));
`;

const Learn = () => {
  return (
    <Layout footer={false} header={true} headerProps={{ search: true }}>
      <Grid
        columns="var(--layout-medium)"
        columnGap={20}
        rowGap={100}
        css={css`
          margin-top: 128px;
          > * {
            grid-column: 2;
          }
        `}
      >
        <div>
          <h1>Learning in public</h1>
          <p>
            This is where I document all the things I&apos;m currently learning,
            or the ones I wish to know more about whenever I&apos;ll get the
            time.
          </p>
          <HR />
        </div>
      </Grid>
    </Layout>
  );
};

export default Learn;
