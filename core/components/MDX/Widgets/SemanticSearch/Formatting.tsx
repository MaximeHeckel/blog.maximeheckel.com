import {
  Box,
  Button,
  Card,
  Flex,
  Icon,
  Text,
  Tooltip,
} from '@maximeheckel/design-system';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import { useEffect, useRef, useState } from 'react';
import MDXComponents from '../../MDXComponents';

const Formatting = () => {
  const [status, setStatus] = useState<'initial' | 'loading' | 'done'>(
    'initial'
  );
  const [streamData, setStreamData] = useState('');
  const [mdxData, setMdxData] = useState<MDXRemoteSerializeResult<
    Record<string, unknown>,
    Record<string, string>
  > | null>(null);

  const rawResponseRef = useRef<HTMLDivElement>(null);
  const formattedResponseRef = useRef<HTMLDivElement>(null);

  const fetchMockStream = async () => {
    setStreamData('');
    // Set status to loading to show rotating border
    setStatus('loading');

    const response = await fetch('/api/semanticsearch/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'test',
        mock: true,
      }),
    });

    if (!response.ok) {
      setStatus('initial');
      return;
    }

    const data = response.body;

    if (!data) {
      return;
    }
    const reader = data.getReader();

    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();

      if (typeof value === 'undefined') {
        reader.cancel();
        break;
      }

      done = doneReading;
      const chunkValue = decoder.decode(value);

      if (chunkValue.includes('[VECTOR_SEARCH_END]')) {
        break;
      } else {
        setStreamData((prev) => {
          return prev + chunkValue;
        });
      }
    }
    reader.cancel();
    setStatus('done');
  };

  useEffect(() => {
    const serializeStreamData = async () => {
      const mdxSource = await serialize(streamData, {
        mdxOptions: { development: process.env.NODE_ENV === 'development' },
      });
      const formattedResponse = formattedResponseRef.current;
      const rawResponse = rawResponseRef.current;
      setMdxData(mdxSource);

      // Keep response div scrolled to the bottom but wait 200 to let other transition take place before scrolling
      if (status === 'loading') {
        setTimeout(() => {
          formattedResponse?.scrollTo({
            top: formattedResponse.scrollHeight,
            behavior: 'smooth',
          });

          rawResponse?.scrollTo({
            top: rawResponse.scrollHeight,
            behavior: 'smooth',
          });
        }, 200);
      }
    };

    if (streamData) {
      serializeStreamData();
    }
  }, [streamData, status]);

  return (
    <Card>
      <Card.Body css={{ width: '100%' }} as={Flex} direction="column" gap="4">
        <Flex css={{ width: '100%' }} justifyContent="start">
          <Tooltip id="playpauseButton" content="Stream data">
            <Button
              aria-label="Stream data"
              aria-describedby="playpauseButton"
              disabled={status === 'loading'}
              variant="icon"
              icon={<Icon.Play />}
              onClick={fetchMockStream}
            />
          </Tooltip>
          <Tooltip id="clearButton" content="Clear data">
            <Button
              aria-label="Clear data"
              aria-describedby="clearButton"
              disabled={status === 'loading'}
              variant="icon"
              icon={<Icon.X />}
              onClick={() => {
                setStreamData('');
                setMdxData(null);
              }}
            />
          </Tooltip>
        </Flex>

        <Box
          ref={rawResponseRef}
          css={{
            borderRadius: 'var(--border-radius-2)',
            overflowY: 'auto',
            height: 275,
            width: '100%',
            padding: 'var(--space-3)',
            background: 'hsl(from var(--gray-400) h s l / 30%)',
          }}
        >
          <Text size="1">{streamData}</Text>
        </Box>
        <Box
          ref={formattedResponseRef}
          css={{
            borderRadius: 'var(--border-radius-2)',
            height: 275,
            width: '100%',
            padding: 'var(--space-3)',
            overflowY: 'auto',
            background: 'hsl(from var(--gray-400) h s l / 30%)',
            'p, li, strong, em': {
              margin: '0px 0px 1rem',
              fontSize: 'var(--font-size-1)!important',
            },
            code: {
              fontSize: 'var(--font-size-1)',
            },
          }}
          // style={{ overflowY: status === 'loading' ? 'hidden' : 'auto' }}
        >
          {mdxData ? (
            <MDXRemote
              compiledSource={mdxData.compiledSource}
              scope={{}}
              frontmatter={{}}
              components={MDXComponents}
            />
          ) : null}
        </Box>
      </Card.Body>
    </Card>
  );
};

export default Formatting;
