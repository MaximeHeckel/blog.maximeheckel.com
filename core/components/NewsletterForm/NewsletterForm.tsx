import { motion, useMotionValue, useTransform } from 'framer-motion';
import React from 'react';
import { useMutation } from 'react-query';
import Button from '@theme/components/Button';
import TextInput from '@theme/components/TextInput';
import Flex from '@theme/components/Flex';
import Glow from '@theme/components/Glow';
import Card from '@theme/components/Card';
import Anchor from '@theme/components/Anchor';
import { NewsletterHeader } from './Icons';
import { NewsletterFormContent, ErrorMessage } from './Styles';
import { subscribeCall } from './utils';
import List from '../List';

const textOutVariant = {
  checked: {
    display: 'none',
    opacity: 0,
  },
  unchecked: {},
};

const textInVariant = {
  checked: {
    display: 'block',
    opacity: 1,
  },
  unchecked: {
    display: 'none',
    opacity: 0,
  },
};

const checkVariant = {
  checked: {
    width: 20,
  },
  unchecked: {
    width: 0,
  },
};

interface Props {
  large?: boolean;
}

const NewsletterForm = (props: Props) => {
  const { large = false } = props;
  const [email, setEmail] = React.useState('');
  const [isChecked, setIsChecked] = React.useState(false);

  const opacity = useMotionValue(1);
  const pathLength = useTransform(opacity, [0.05, 0.5], [1, 0]);
  const opacityTextIn = useTransform(opacity, [0, 0.1], [1, 0]);

  const [subscribe, { isError, isLoading, isSuccess, error }] = useMutation(
    subscribeCall
  );

  React.useEffect(() => {
    setIsChecked(false);
  }, [isError]);

  return (
    <Card
      depth={0}
      style={{
        marginLeft: '-8px',
        marginRight: '-8px',
      }}
    >
      {large ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            paddingTop: '48px',
          }}
        >
          <NewsletterHeader />
        </div>
      ) : null}
      <NewsletterFormContent withOffset={large}>
        {large ? (
          <h3>
            Get a behind the scenes look at what I&apos;m currently learning,
            exploring, and creating.
          </h3>
        ) : (
          <h3>Subscribe to my newsletter</h3>
        )}
        {large ? (
          <>
            <p>
              Subscribe to{' '}
              <Anchor underline href="https://buttondown.email/MaximeHeckel">
                my newsletter
              </Anchor>{' '}
              to receive a monthly digest containing:
            </p>
            <List variant="unordered">
              <List.Item>
                <p>
                  Deep dives into some of my{' '}
                  <span>ideas and secret projects</span> that will inspire you
                  👨‍💻
                </p>
              </List.Item>
              <List.Item>
                <p>
                  <span>Exclusive previews of upcoming articles</span> on
                  frontent development, React, and SwiftUI 🤫
                </p>
              </List.Item>
              <List.Item>
                <p>
                  Some of my <span>favorite resources and tips</span> on
                  frontend development or anything I&apos;m currently interested
                  in to further expand your skillset as a developer 📝
                </p>
              </List.Item>
            </List>
          </>
        ) : (
          <>
            <p>
              Get email from me about my ideas, frontend development resources
              and tips as well as exclusive previews of upcoming articles.
            </p>
            <br />
          </>
        )}
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            try {
              await subscribe({ email });
              setIsChecked(true);
            } catch (e) {}
          }}
        >
          <Flex
            alignItems="flex-start"
            css={{
              gap: '12px',
              flexDirection: 'row',
              '@media (max-width: 500px)': {
                flexDirection: 'column',
              },
            }}
          >
            <TextInput
              aria-label="Email"
              id="email-input"
              type="email"
              placeholder="your@email.com"
              autoComplete="off"
              value={email}
              onChange={(event) => setEmail(event.currentTarget.value)}
              required
            />
            <Glow>
              <Button
                aria-label="Subscribe to my newsletter"
                disabled={isLoading}
                title="Subscribe to my newsletter"
                type="submit"
                variant="primary"
              >
                <motion.div
                  initial={false}
                  animate={isChecked ? 'checked' : 'unchecked'}
                  variants={textOutVariant}
                  transition={{
                    duration: 0.7,
                  }}
                  style={{ opacity }}
                >
                  {isLoading ? 'Loading...' : 'Sign me up!'}
                </motion.div>
                <motion.svg
                  initial="unchecked"
                  animate={isChecked ? 'checked' : 'unchecked'}
                  variants={checkVariant}
                  stroke="currentColor"
                  height="22"
                  viewBox="0 0 20 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <motion.path
                    d="M1.8492 7.39712L7.39362 12.3822L18.0874 1.36591"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ pathLength }}
                  />
                </motion.svg>
                <motion.div
                  initial="unchecked"
                  animate={isChecked ? 'checked' : 'unchecked'}
                  variants={textInVariant}
                  style={{ marginLeft: '8px', opacity: opacityTextIn }}
                >
                  Done! 🎉
                </motion.div>
              </Button>
            </Glow>
          </Flex>
        </form>
        {/* <NewsLetterForm
            animate={isChecked ? 'checked' : 'unchecked'}
            variants={formVariant}
            transition={{
              ease: 'easeOut',
              duration: 0.3,
            }}
            onSubmit={async (event) => {
              event.preventDefault();
              try {
                await subscribe({ email });
                setIsChecked(true);
              } catch (e) {}
            }}
          >
            <NewsLetterInput
              animate={isChecked ? 'checked' : 'unchecked'}
              variants={inputVariant}
              transition={{
                ease: 'easeOut',
                duration: 0.3,
              }}
              disabled={isChecked || isLoading}
              name="email"
              type="email"
              id="emailInput"
              placeholder="Your email"
              autoComplete="off"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <VisuallyHidden>
              <label htmlFor="emailInput">Your email address</label>
            </VisuallyHidden>
            <NewsLetterSubmitButton
              initial={false}
              animate={isChecked ? 'checked' : 'unchecked'}
              variants={buttonVariant}
              whileHover="hover"
              whileTap="press"
              transition={{
                type: 'spring',
                stiffness: 200,
                mass: 1,
                damping: 8,
              }}
              disabled={isChecked || isLoading}
              custom={isChecked}
              type="submit"
              aria-label="Subscribe to my newsletter"
              title="Subscribe to my newsletter"
            >
              
            </NewsLetterSubmitButton>
          </NewsLetterForm> */}
        {error ? (
          // @ts-ignore
          error.message.includes('already subscribed') ? (
            <ErrorMessage>
              Looks like you already subscribed! If you think this is a mistake
              you can still subscribe by heading directly to my{' '}
              <Anchor href="https://buttondown.email/MaximeHeckel" underline>
                Buttondown publication
              </Anchor>
              .
            </ErrorMessage>
          ) : (
            <ErrorMessage>
              😬 woops! We just hit a snag here, but don&apos;t worry! You can
              still subscribe by heading directly to my{' '}
              <Anchor href="https://buttondown.email/MaximeHeckel" underline>
                Buttondown publication
              </Anchor>
              .
            </ErrorMessage>
          )
        ) : null}
        {isSuccess ? (
          <p
            style={{
              marginTop: '16px',
              textAlign: 'center',
            }}
          >
            (You will receive a confirmation email in a few seconds)
          </p>
        ) : null}
      </NewsletterFormContent>
    </Card>
  );
};

export default NewsletterForm;
