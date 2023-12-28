import {
  Box,
  Details,
  Flex,
  InlineCode,
  Text,
} from '@maximeheckel/design-system';
import React from 'react';

const ColorChannelSummary = () => {
  return (
    <Details>
      <Details.Summary>
        [Optional] Expand to see how to obtain the formulas below from the
        Fourier series
      </Details.Summary>
      <Details.Content>
        <Flex alignItems="start" direction="column" gap="4">
          <Text css={{ margin: 0 }} size="2">
            We first need to express d, e, and f as expression of R, G, and B
          </Text>
          <Box>
            <InlineCode>I = d + e * cosθ + f * sinθ</InlineCode>
          </Box>
          <Box>
            <InlineCode>R = d + e</InlineCode> at <InlineCode>θ = 0</InlineCode>
          </Box>
          <Box>
            <InlineCode>G = d - e/2 + f * sqrt(3)/2</InlineCode> at{' '}
            <InlineCode>θ = 2 * PI/3</InlineCode>
          </Box>
          <Box>
            <InlineCode>B = d - e/2 - f * sqrt(3)/2</InlineCode> at{' '}
            <InlineCode>θ = 4 * PI/3</InlineCode>
          </Box>
          <Box
            as="hr"
            css={{
              borderColor: 'var(--border-color)',
              width: '100%',
            }}
          />
          <Box>
            <InlineCode>d = R - e</InlineCode>
          </Box>
          <Box>
            <InlineCode>G = R - 3 * e/2 + f * sqrt(3)/2</InlineCode>
          </Box>
          <Box>
            ↳<InlineCode>e = (-2 * G + 2 * R + f * sqrt(3))/3</InlineCode>
          </Box>
          <Box
            as="hr"
            css={{
              borderColor: 'var(--border-color)',
              width: '100%',
            }}
          />
          <Box>
            <InlineCode>B = R - 3 * e/2 - f * sqrt(3)/2</InlineCode>
          </Box>
          <Box>
            <InlineCode>
              B = R + (-2 * G + 2 * R + f * sqrt(3))/2 - f * sqrt(3)/2
            </InlineCode>
          </Box>
          <Box>
            ↳<InlineCode>B = G - f * sqrt(3)</InlineCode>
          </Box>
          <Box>
            ↳<InlineCode>f = (G - B) / 3</InlineCode>
          </Box>
          <Box
            as="hr"
            css={{
              borderColor: 'var(--border-color)',
              width: '100%',
            }}
          />
          <Box>
            <InlineCode>d = R - e</InlineCode>
          </Box>
          <Box>
            ↳<InlineCode>d = R + (2 * G - 2 * R - f * sqrt(3))/3</InlineCode>
          </Box>
          <Box>
            ↳<InlineCode>d = R + 2 * G - (G -B))/3</InlineCode>
          </Box>
          <Box>
            ↳<InlineCode>d = (R + G + B) / 3</InlineCode>
          </Box>
          <Box
            as="hr"
            css={{
              borderColor: 'var(--border-color)',
              width: '100%',
            }}
          />
          <Text css={{ margin: 0 }} size="2">
            We can now express r, y, g, c, b, and v as expression of R, G, B by
            substituting d, e, and f from the Fourier series at a given angle
          </Text>
          <Box>
            <InlineCode>r = [d + e] * 1/ 2</InlineCode> at{' '}
            <InlineCode>θ = 0</InlineCode>
          </Box>
          <Box>
            ↳
            <InlineCode>
              r = [(R + G + B)/3 + (-2 * G + 2R + G - B)/3] * 1/2
            </InlineCode>
          </Box>
          <Box>
            ↳<InlineCode>r = R/2</InlineCode>
          </Box>
          <Box
            as="hr"
            css={{
              borderColor: 'var(--border-color)',
              width: '100%',
            }}
          />
          <Box>
            <InlineCode>y = [d + e/2 + f * sqrt(3)/2] * 1/ 2</InlineCode> at{' '}
            <InlineCode>θ = PI/3</InlineCode>
          </Box>
          <Box>
            ↳<InlineCode>y = [(4 * R + 4 * G - 2B)/6] * 1/2</InlineCode>
          </Box>
          <Box>
            ↳<InlineCode>y = (2 * R + 2 * G - B)/6</InlineCode>
          </Box>
          <Box
            as="hr"
            css={{
              borderColor: 'var(--border-color)',
              width: '100%',
            }}
          />
          <Box>
            <InlineCode>g = [d + e/2 - f * sqrt(3)/2] * 1/ 2</InlineCode> at{' '}
            <InlineCode>θ = 2 * PI/3</InlineCode>
          </Box>
          <Box>
            ↳<InlineCode>g = G * 1/2</InlineCode>
          </Box>
          <Box
            as="hr"
            css={{
              borderColor: 'var(--border-color)',
              width: '100%',
            }}
          />
          <Box>
            <InlineCode>c = [d - 2] * 1/ 2</InlineCode> at{' '}
            <InlineCode>θ = PI</InlineCode>
          </Box>
          <Box>
            ↳
            <InlineCode>
              c = [(R + G +B)/3 - (2 * R - G - B)/3] * 1/2
            </InlineCode>
          </Box>
          <Box>
            ↳<InlineCode>c = (2 * G + 2 * B - R)/6</InlineCode>
          </Box>
          <Box
            as="hr"
            css={{
              borderColor: 'var(--border-color)',
              width: '100%',
            }}
          />
          <Box>
            <InlineCode>b = [d - e/2 - f * sqrt(3)/2] * 1/ 2</InlineCode> at{' '}
            <InlineCode>θ = 4 * PI/3</InlineCode>
          </Box>
          <Box>
            ↳<InlineCode>b = B * 1/2</InlineCode>
          </Box>
          <Box
            as="hr"
            css={{
              borderColor: 'var(--border-color)',
              width: '100%',
            }}
          />
          <Box>
            <InlineCode>v = [d - e/2 - f * sqrt(3)/2] * 1/ 2</InlineCode> at{' '}
            <InlineCode>θ = 5 * PI/3</InlineCode>
          </Box>
          <Box>
            ↳<InlineCode>v = [(4 * R - 2 * G + 4B)/6] * 1/2</InlineCode>
          </Box>
          <Box>
            ↳<InlineCode>v = (2 * R + 2 * B - G)/6</InlineCode>
          </Box>
        </Flex>
      </Details.Content>
    </Details>
  );
};

export default ColorChannelSummary;
