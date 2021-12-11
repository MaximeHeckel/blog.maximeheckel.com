import { styled } from 'lib/stitches.config';
import Flex from '@theme/components/Flex';
import Grid from '@theme/components/Grid';
import Logo from '@theme/components/Logo';
import Text from '@theme/components/Typography';

const FooterBlock = styled('div', {
  background: 'var(--maximeheckel-colors-body)',
  transition: '0.5s',
  height: '130px',
  width: '100%',

  hr: {
    height: '1px',
    width: '100%',
    background: 'hsl(var(--palette-gray-20))',
    border: 'none',
  },
});

const FooterWrapper = styled(Flex, {
  paddingTop: '30px',
  width: '100%',
  margin: '0px auto',
  gridColumn: '2',
});

const FooterContent = styled(Flex, {
  height: '48px',
  width: '100%',
});

const Footer = () => (
  <FooterBlock data-testid="footer">
    <Grid columns="var(--layout-medium)" columnGap={20}>
      <FooterWrapper direction="column" justifyContent="space-evenly">
        <hr />
        <FooterContent alignItems="center" justifyContent="space-between">
          <Text
            as="p"
            css={{ margin: 0 }}
            size="1"
            variant="primary"
            weight="3"
          >
            © {new Date().getFullYear()} Maxime Heckel —— SF/NY
          </Text>
          <Logo alt="Maxime Heckel's logo" size={35} />
        </FooterContent>
      </FooterWrapper>
    </Grid>
  </FooterBlock>
);

export { Footer };
