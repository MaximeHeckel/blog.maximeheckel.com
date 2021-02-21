import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import React from 'react';
import { useMutation } from 'react-query';

const NewsletterFormWrapper = styled('div')`
  margin-left: -10px;
  background: var(--maximeheckel-colors-foreground);
  box-shadow: var(--maximeheckel-shadow-1);
  border-radius: var(--border-radius-2);
  overflow: hidden;
  position: relative;
  > svg {
    position: absolute;
    width: 100%;
    top: -30px;
  }

  path,
  rect {
    stroke: var(--maximeheckel-colors-typeface-0);
  }

  span {
    padding: 6px 0px 7px 0px;
    color: var(--maximeheckel-colors-brand);
    background: var(--maximeheckel-colors-emphasis);
  }

  @media (max-width: 700px) {
    > svg {
      left: -50%;
      width: 200%;
    }
  }
`;

const NewsletterFormContent = styled('div')<{ withOffset?: boolean }>`
  padding: ${(p) => (p.withOffset ? '150px 48px 48px 48px' : '36px 24px')};
  h3 {
    max-width: 600px;
    color: var(--maximeheckel-colors-typeface-0);
  }
  p {
    color: var(--maximeheckel-colors-typeface-1);
    font-weight: 500;
    margin-bottom: 0px;
  }
  @media (max-width: 700px) {
    padding: ${(p) => (p.withOffset ? '150px 0px 30px 20px;' : '24px 4px')};
  }
  ul {
    margin-left: 18px;
    margin-top: 30px;
    li {
      list-style-image: url("data:image/svg+xml,%3Csvg width='16' height='14' viewBox='0 0 16 14' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M11.5858 8H1.5C0.947715 8 0.5 7.55228 0.5 7V7C0.5 6.44771 0.947715 6 1.5 6H11.5858L7.41421 1.82843C7.02369 1.4379 7.02576 0.80267 7.41628 0.412145V0.412145C7.80519 0.0232345 8.43722 0.0193376 8.8284 0.405968L14.7811 6.28944C15.1769 6.68063 15.1772 7.31967 14.7818 7.71124L8.82841 13.6065C8.43734 13.9938 7.80462 13.99 7.41545 13.6008V13.6008C7.02531 13.2107 7.02263 12.5761 7.41222 12.1854L11.5858 8Z' fill='%235184F9'/%3E%3C/svg%3E%0A");
    }
  }
`;

const NewsLetterFormWrapper = styled('div')`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NewsLetterForm = styled(motion.form)`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid var(--maximeheckel-colors-brand);
  border-radius: var(--border-radius-1);
  margin: 45px auto 0px auto;
  width: 100%;
  background: var(--maximeheckel-colors-body);
`;

const NewsLetterInput = styled(motion.input)`
  width: 65%;
  height: 50px;
  outline: none;
  background-color: transparent;
  color: var(--maximeheckel-colors-typeface-1);
  font-size: 18px;
  font-weight: 500;
  letter-spacing: 0.3px;
  padding: 0px 16px;
  border: none;
  box-shadow: none;
  will-change: width;
  @media (max-width: 700px) {
    font-size: 16px;
  }
`;

const NewsLetterSubmitButton = styled(motion.button)`
  width: 150px;
  height: 50px;
  background-color: var(--maximeheckel-colors-brand);
  color: var(--maximeheckel-colors-body);
  font-size: 18px;
  font-weight: 500;
  letter-spacing: 0.3px;
  border-radius: var(--border-radius-1);
  box-shadow: none;
  border: none;
  cursor: pointer;
  outline: none;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;

  &:disabled {
    cursor: not-allowed;
  }

  path {
    stroke: var(--maximeheckel-colors-body) !important;
  }

  @media (max-width: 700px) {
    font-size: 16px;
  }
`;

const NewsletterHeader = () => (
  <svg
    width="100%"
    height="218"
    viewBox="0 0 700 218"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clipPath="url(#clip0)">
      <g opacity="0.4" filter="url(#filter0_f)">
        <path
          d="M410.534 81.1764C410.534 110.557 371.688 169.571 276.765 169.571C181.843 169.571 53.1709 143.633 53.1709 114.252C53.1709 84.8715 65.6687 48 160.591 48C255.514 48 410.534 51.7955 410.534 81.1764Z"
          fill="#FF008C"
        />
      </g>
      <g opacity="0.5" filter="url(#filter1_f)">
        <path
          d="M661.5 114.486C661.5 143.971 635.186 170 536.18 170C437.173 170 302.965 143.971 302.965 114.486C302.965 85.0015 236.87 48 415.007 48C693.172 48 661.5 85.0015 661.5 114.486Z"
          fill="#336EF5"
        />
      </g>
      <rect
        x="308.604"
        y="89.9522"
        width="13.8414"
        height="32.8933"
        rx="6.92069"
        strokeWidth="3"
      />
      <path
        d="M308.696 93.775C310.58 90.6447 314.892 89.1137 318.328 90.3553C321.763 91.597 323.022 95.1412 321.138 98.2715L308.853 118.689C306.97 121.82 302.658 123.351 299.222 122.109C295.786 120.867 294.528 117.323 296.411 114.193L302.554 103.984L308.696 93.775Z"
        strokeWidth="3"
      />
      <path
        d="M299.679 107.864L299.679 107.864L299.672 107.875L293.344 118.593C291.649 121.463 287.708 122.878 284.568 121.743C281.447 120.615 280.304 117.396 282.015 114.552L294.95 93.0546C296.647 90.234 300.532 88.8544 303.628 89.9732C306.725 91.0926 307.859 94.2883 306.159 97.1095L299.679 107.864Z"
        strokeWidth="3"
      />
      <path
        d="M381.6 92.3336H414.934C417.225 92.3336 419.1 94.2086 419.1 96.5003V121.5C419.1 123.792 417.225 125.667 414.934 125.667H381.6C379.309 125.667 377.434 123.792 377.434 121.5V96.5003C377.434 94.2086 379.309 92.3336 381.6 92.3336Z"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M419.1 96.5003L398.267 111.084L377.434 96.5003"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M343 109H357"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M350 102L357 109L350 116"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  </svg>
);

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

const VisuallyHidden = styled('div')`
  border: 0;
  clip: rect(1px 1px 1px 1px); /* IE6, IE7 */
  clip; rect(1px, 1px, 1px, 1px);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  width: 1px;
`;

const ErrorMessage = styled('p')`
  margin-top: 16px;
  color: #fd3c3c !important;
  max-width: 800px !important;
`;

const subscribeCall = (data: { email: string }) =>
  fetch('https://api.mhkl.io/api/newsletter/subscribe/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  }).then(async (res) => {
    const data = await res.json();
    if (data.error && data.error !== '') {
      throw new Error(data.error);
    }
  });

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
    <NewsletterFormWrapper>
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
              <a href="https://buttondown.email/MaximeHeckel">my newsletter</a>{' '}
              to receive a monthly diggest containing:
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
                  frontend development or anything I&apos;m currently interested
                  in to further expand your skillset as a developer 📝
                </p>
              </li>
            </ul>
          </>
        ) : (
          <p>
            Get email from me about my ideas, frontend development resources and
            tips as well as exclusive previews of upcoming articles.
          </p>
        )}

        <NewsLetterFormWrapper>
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
        </NewsLetterFormWrapper>
        {error ? (
          // @ts-ignore
          error.message.includes('already subscribed') ? (
            <ErrorMessage>
              Looks like you already subscribed! If you think this is a mistake
              you can still subscribe by heading directly to my{' '}
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
    </NewsletterFormWrapper>
  );
};

export default NewsletterForm;
