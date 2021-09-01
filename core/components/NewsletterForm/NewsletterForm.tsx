import { css } from '@emotion/react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import React from 'react';
import { useMutation } from 'react-query';
import Card from '@theme/components/Card';
import { NewsletterHeader } from './Icons';
import {
  NewsLetterForm,
  NewsletterFormContent,
  NewsLetterInput,
  NewsLetterSubmitButton,
  VisuallyHidden,
  ErrorMessage,
} from './Styles';
import { subscribeCall } from './utils';
// import TextInput from '../TextInput';

const formVariant = {
  checked: {
    border: 'none',
    width: '150px',
  },
  unchecked: {},
};

const inputVariant = {
  checked: {
    width: '0px',
    padding: '0px',
  },
  unchecked: {},
};

const buttonVariant = {
  hover: (isChecked: boolean) => ({
    scale: isChecked ? 1 : 1.1,
  }),
  press: {
    scale: 1,
  },
  checked: {
    scale: 1,
    cursor: 'default',
  },
};

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
    <div
      css={css`
        margin-left: -8px;
        margin-right: -8px;
      `}
    >
      <Card depth={0}>
        {large ? <NewsletterHeader /> : null}
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
                <a href="https://buttondown.email/MaximeHeckel">
                  my newsletter
                </a>{' '}
                to receive a monthly digest containing:
              </p>
              <ul>
                <li>
                  <p>
                    Deep dives into some of my{' '}
                    <span>ideas and secret projects</span> that will inspire you
                    👨‍💻
                  </p>
                </li>
                <li>
                  <p>
                    <span>Exclusive previews of upcoming articles</span> on
                    frontent development, React, and SwiftUI 🤫
                  </p>
                </li>
                <li>
                  <p>
                    Some of my <span>favorite resources and tips</span> on
                    frontend development or anything I&apos;m currently
                    interested in to further expand your skillset as a developer
                    📝
                  </p>
                </li>
              </ul>
            </>
          ) : (
            <p>
              Get email from me about my ideas, frontend development resources
              and tips as well as exclusive previews of upcoming articles.
            </p>
          )}

          {/* <TextInput
            aria-label="Email"
            id="email-input"
            type="email"
            placeholder="your@email.com"
            autoComplete="off"
            value={email}
            onChange={(event) => setEmail(event.currentTarget.value)}
            required
          /> */}
          <NewsLetterForm
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
                height="28"
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
            </NewsLetterSubmitButton>
          </NewsLetterForm>
          {error ? (
            // @ts-ignore
            error.message.includes('already subscribed') ? (
              <ErrorMessage>
                Looks like you already subscribed! If you think this is a
                mistake you can still subscribe by heading directly to my{' '}
                <a href="https://buttondown.email/MaximeHeckel">
                  Buttondown publication
                </a>
                .
              </ErrorMessage>
            ) : (
              <ErrorMessage>
                😬 woops! We just hit a snag here, but don&apos;t worry! You can
                still subscribe by heading directly to my{' '}
                <a href="https://buttondown.email/MaximeHeckel">
                  Buttondown publication
                </a>
                .
              </ErrorMessage>
            )
          ) : null}
          {isSuccess ? (
            <p
              css={css`
                margin-top: 16px;
                text-align: center;
              `}
            >
              (You will receive a confirmation email in a few seconds)
            </p>
          ) : null}
        </NewsletterFormContent>
      </Card>
    </div>
  );
};

export default NewsletterForm;
