import { styled } from 'lib/stitches.config';
import Flex from '@theme/components/Flex';
import Grid from '@theme/components/Grid';
import Logo from '@theme/components/Logo';
import Text, { EM } from '@theme/components/Typography';
import Anchor from '../Anchor';
import Box from '../Box';
import Link from 'next/link';

const FooterBlock = styled('footer', {
  background: 'var(--maximeheckel-colors-body)',
  transition: '0.5s',
  width: '100%',

  hr: {
    height: '1px',
    width: '100%',
    background: 'var(--maximeheckel-border-color)',
    border: 'none',
  },
});

const FooterWrapper = styled(Flex, {
  paddingTop: 'var(--space-6)',
  width: '100%',
  margin: '0px auto',
  gridColumn: '2',
});

const FooterContent = styled(Flex, {
  height: '48px',
  width: '100%',
  marginBottom: 'var(--space-3)',
});

// TODO: Make more modular
const Footer = () => (
  <FooterBlock data-testid="footer">
    <Grid columns="medium" gapX={4}>
      <FooterWrapper direction="column" justifyContent="space-evenly">
        <hr />
        <Grid columns={2} css={{ width: '100%' }}>
          <Box>
            <Text size={1}>
              <Grid>
                <Link href="/" passHref>
                  <Anchor discreet>Home</Anchor>
                </Link>
                <Link href="/design" passHref>
                  <Anchor discreet>Design</Anchor>
                </Link>
                <Link href="/rss.xml" passHref>
                  <Anchor discreet>RSS</Anchor>
                </Link>
                <Anchor
                  discreet
                  href="https://www.figma.com/file/uvkUCtxXs7Vvmj58sHh0TE/Maxime's-Public-Roadmap?node-id=0%3A1"
                >
                  Roadmap
                </Anchor>
              </Grid>
            </Text>
          </Box>
          <Box>
            <Text size={1}>
              <Grid>
                <Anchor
                  discreet
                  href="https://maximeheckel.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Portfolio
                </Anchor>
                <Anchor
                  discreet
                  href="https://twitter.com/MaximeHeckel"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Twitter
                </Anchor>
                <Anchor
                  discreet
                  href="https://github.com/MaximeHeckel"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Github
                </Anchor>
                <Anchor
                  discreet
                  href="https://buttondown.email/MaximeHeckel/archive/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Newsletter
                </Anchor>
              </Grid>
            </Text>
          </Box>
        </Grid>
        <hr />
        <FooterContent alignItems="center" justifyContent="space-between">
          <Text
            as="p"
            css={{ margin: 0 }}
            size="1"
            variant="primary"
            weight="3"
          >
            © {new Date().getFullYear()} Maxime Heckel ——{' '}
            <EM size="1">New York</EM>
          </Text>
          <Logo alt="Maxime Heckel's logo" size={35} />
        </FooterContent>
      </FooterWrapper>
    </Grid>
  </FooterBlock>
);

export { Footer };
