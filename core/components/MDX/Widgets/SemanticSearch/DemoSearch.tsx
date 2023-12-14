import {
  Box,
  Button,
  Card,
  EM,
  Flex,
  Label,
  Pill,
  Text,
  TextInput,
} from '@maximeheckel/design-system';
import { AnimatePresence, motion } from 'framer-motion';
import { FormEvent, startTransition, useState } from 'react';

type Result = {
  title: string;
  url: string;
  content: string;
  similarity: number;
};

const SAMPLE_QUESTIONS = [
  'React Three Fiber',
  'Shaders',
  'Code: staggered animations',
  "Example for Framer Motion's LayoutGroup",
  'Show me how to compose CSS variables',
];

const list = {
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.1,
    },
  },
  hidden: {
    opacity: 0,
  },
};

const item = {
  visible: { opacity: 1, x: 0 },
  hidden: { opacity: 0, x: -10 },
};

const DemoSearch = () => {
  const [status, setStatus] = useState<'initial' | 'loading'>('initial');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setResults([]);
    setStatus('loading');

    const response = await fetch('/api/semanticsearch/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        completion: false,
        count: 50,
        threshold: 0.6,
      }),
    });

    const data = await response.json();

    setResults(data);
    startTransition(() => {
      setStatus('initial');
    });
  };

  return (
    <Card>
      <Card.Body as={Flex} direction="column" gap="4">
        <Flex as="form" css={{ width: '100%' }} gap="3" onSubmit={onSubmit}>
          <TextInput
            aria-label="Search Input for demo"
            disabled={status === 'loading'}
            id="search-input-demo"
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder="Type a search query..."
            value={query}
          />
          <Button
            disabled={status === 'loading'}
            type="submit"
            variant="secondary"
          >
            Search
          </Button>
        </Flex>
        <Flex wrap="wrap" gap="3">
          {SAMPLE_QUESTIONS.map((question) => (
            <Box
              as="button"
              css={{
                padding: 0,
                MozAppearance: 'none',
                WebkitAppearance: 'none',
                background: 'transparent',
                color: 'inherit',
                border: 'none',
                fontFamily: 'inherit',
              }}
              key={question}
              onClick={() => setQuery(question)}
            >
              <Pill css={{ cursor: 'pointer' }} variant="info">
                {question}
              </Pill>
            </Box>
          ))}
        </Flex>
        <Box
          css={{
            borderRadius: 'var(--border-radius-2)',
            overflowY: 'auto',
            height: 275,
            width: '100%',
            padding: 'var(--space-3)',
            background: 'hsl(from var(--gray-400) h s l / 30%)',
            position: 'relative',
          }}
        >
          <AnimatePresence>
            {!results.length && (
              <Box
                as={motion.div}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                css={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <Label>Search results are displayed here</Label>
              </Box>
            )}
            {results.length > 0 && (
              <Flex
                animate="visible"
                as={motion.ul}
                css={{
                  listStyle: 'none',
                  padding: 0,
                }}
                direction="column"
                exit="hidden"
                gap="4"
                initial="hidden"
                variants={list}
              >
                {results.map((result, index) => (
                  <Box
                    as={motion.li}
                    css={{ width: '100%' }}
                    key={`${result.url}-${index}`}
                    variants={item}
                  >
                    <Flex alignItems="center" justifyContent="space-between">
                      <Text size="2">{result.title}</Text>{' '}
                      <Pill
                        variant={
                          result.similarity > 0.8
                            ? 'success'
                            : result.similarity > 0.75
                            ? 'warning'
                            : 'danger'
                        }
                      >
                        {result.similarity.toFixed(3)}
                      </Pill>
                    </Flex>
                    <EM size="1">
                      &quot;...{result.content.substring(0, 64)}...&quot;
                    </EM>
                  </Box>
                ))}
              </Flex>
            )}
          </AnimatePresence>
        </Box>
      </Card.Body>
    </Card>
  );
};

export default DemoSearch;
