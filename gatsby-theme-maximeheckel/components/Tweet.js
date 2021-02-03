import { css } from '@emotion/react';
import Image from 'next/image';

const Tweet = ({ tweet }) => {
  const {
    author,
    media,
    created_at,
    public_metrics,
    id,
    text,
    referenced_tweets,
  } = tweet;

  const authorUrl = `https://twitter.com/${author.username}`;
  const likeUrl = `https://twitter.com/intent/like?tweet_id=${id}`;
  const retweetUrl = `https://twitter.com/intent/retweet?tweet_id=${id}`;
  const replyUrl = `https://twitter.com/intent/tweet?in_reply_to=${id}`;
  const tweetUrl = `https://twitter.com/${author.username}/status/${id}`;
  const createdAt = new Date(created_at);

  const formattedText = text.replace(/https:\/\/[\n\S]+/g, '');
  const quoteTweet =
    referenced_tweets && referenced_tweets.find((t) => t.type === 'quoted');

  return (
    <div
      css={css`
        color: var(--maximeheckel-colors-typeface-0);
        border-radius: 1rem;
        background-color: var(--maximeheckel-colors-body);
        padding-top: 1rem;
        padding-bottom: 1rem;
        margin-top: 1rem;
        margin-bottom: 1rem;
        padding-left: 1.5rem;
        padding-right: 1.5rem;
        width: 100%;

        border: solid 1px rgba(209, 213, 219, 1);

        a {
          text-decoration: none;
          color: rgba(107, 114, 128, 1);
        }
      `}
    >
      <div
        css={css`
          display: flex;
          align-items: center;
        `}
      >
        <a
          css={css`
            display: flex;
            height: 46px;
            width: 46px;
          `}
          href={authorUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            alt={author.username}
            height={46}
            width={46}
            src={author.profile_image_url}
            css={css`
              border-radius: 50%;
            `}
          />
        </a>
        <a
          href={authorUrl}
          className="author"
          target="_blank"
          rel="noopener noreferrer"
          css={css`
            display: flex;
            flex-direction: column;
            margin-left: 1rem;
          `}
        >
          <span
            css={css`
              display: flex;
              align-items: center;
              font-weight: 700;
              color: var(--maximeheckel-colors-typeface-0);
            `}
            title={author.name}
          >
            {author.name}
            {/* {author.verified ? (
              <svg
                aria-label="Verified Account"
                className="ml-1 text-blue-500 dark:text-white inline h-4 w-4"
                viewBox="0 0 24 24"
              >
                <g fill="currentColor">
                  <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z" />
                </g>
              </svg>
            ) : null} */}
          </span>
          <span title={`@${author.username}`}>@{author.username}</span>
        </a>
        <a
          css={css`
            margin-left: auto;
          `}
          href={authorUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg
            viewBox="328 355 335 276"
            height="24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M 630, 425    A 195, 195 0 0 1 331, 600    A 142, 142 0 0 0 428, 570    A  70,  70 0 0 1 370, 523    A  70,  70 0 0 0 401, 521    A  70,  70 0 0 1 344, 455    A  70,  70 0 0 0 372, 460    A  70,  70 0 0 1 354, 370    A 195, 195 0 0 0 495, 442    A  67,  67 0 0 1 611, 380    A 117, 117 0 0 0 654, 363    A  65,  65 0 0 1 623, 401    A 117, 117 0 0 0 662, 390    A  65,  65 0 0 1 630, 425    Z"
              style={{ fill: '#3BA9EE' }}
            />
          </svg>
        </a>
      </div>
      <div
        css={css`
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          white-space: pre-wrap;
          font-size: 1.125rem;
          line-height: 1.75rem;
        `}
      >
        {formattedText}
      </div>
      {media && media.length > 1 ? (
        <div
          css={css`
            display: inline-grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            -moz-column-gap: 0.5rem;
            column-gap: 0.5rem;
            row-grap: 0.5rem;
            margin-top: 0.5rem;
            margin-bottom: 0.5rem;
          `}
        >
          {media.map((m) => (
            <Image
              key={m.media_key}
              alt={text}
              height={m.height}
              width={m.width}
              src={m.url}
              css={css`
                border-radius: 20px;
              `}
            />
          ))}
        </div>
      ) : null}
      {media && media.length === 1 ? (
        <div
          css={css`
            margin-top: 0.5rem;
            margin-bottom: 0.5rem;
          `}
        >
          {media.map((m) => (
            <Image
              key={m.media_key}
              alt={text}
              height={m.height}
              width={m.width}
              src={m.url}
              css={css`
                border-radius: 20px;
              `}
            />
          ))}
        </div>
      ) : null}
      {quoteTweet ? <Tweet {...quoteTweet} /> : null}
      <a href={tweetUrl} target="_blank" rel="noopener noreferrer">
        <time
          title={`Time Posted: ${createdAt.toUTCString()}`}
          dateTime={createdAt.toISOString()}
        >
          {createdAt.toISOString()}
        </time>
      </a>
      <div
        css={css`
          display: flex;
          margin-top: 1rem;
        `}
      >
        <a
          css={css`
            display: flex;
            align-items: center;
            margin-right: 2rem;
          `}
          href={replyUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg
            css={css`
              margin-right: 1rem;
            `}
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path
              css={css`
                fill: currentColor;
              `}
              d="M14.046 2.242l-4.148-.01h-.002c-4.374 0-7.8 3.427-7.8 7.802 0 4.098 3.186 7.206 7.465 7.37v3.828c0 .108.045.286.12.403.143.225.385.347.633.347.138 0 .277-.038.402-.118.264-.168 6.473-4.14 8.088-5.506 1.902-1.61 3.04-3.97 3.043-6.312v-.017c-.006-4.368-3.43-7.788-7.8-7.79zm3.787 12.972c-1.134.96-4.862 3.405-6.772 4.643V16.67c0-.414-.334-.75-.75-.75h-.395c-3.66 0-6.318-2.476-6.318-5.886 0-3.534 2.768-6.302 6.3-6.302l4.147.01h.002c3.532 0 6.3 2.766 6.302 6.296-.003 1.91-.942 3.844-2.514 5.176z"
            />
          </svg>
          <span>{public_metrics.reply_count}</span>
        </a>
        <a
          css={css`
            display: flex;
            align-items: center;
            margin-right: 2rem;
          `}
          href={retweetUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg
            css={css`
              margin-right: 1rem;
            `}
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path
              css={css`
                fill: currentColor;
              `}
              d="M23.77 15.67c-.292-.293-.767-.293-1.06 0l-2.22 2.22V7.65c0-2.068-1.683-3.75-3.75-3.75h-5.85c-.414 0-.75.336-.75.75s.336.75.75.75h5.85c1.24 0 2.25 1.01 2.25 2.25v10.24l-2.22-2.22c-.293-.293-.768-.293-1.06 0s-.294.768 0 1.06l3.5 3.5c.145.147.337.22.53.22s.383-.072.53-.22l3.5-3.5c.294-.292.294-.767 0-1.06zm-10.66 3.28H7.26c-1.24 0-2.25-1.01-2.25-2.25V6.46l2.22 2.22c.148.147.34.22.532.22s.384-.073.53-.22c.293-.293.293-.768 0-1.06l-3.5-3.5c-.293-.294-.768-.294-1.06 0l-3.5 3.5c-.294.292-.294.767 0 1.06s.767.293 1.06 0l2.22-2.22V16.7c0 2.068 1.683 3.75 3.75 3.75h5.85c.414 0 .75-.336.75-.75s-.337-.75-.75-.75z"
            />
          </svg>
          <span>{public_metrics.retweet_count}</span>
        </a>
        <a
          css={css`
            display: flex;
            align-items: center;
            margin-right: 2rem;
          `}
          href={likeUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg
            css={css`
              margin-right: 1rem;
            `}
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path
              css={css`
                fill: currentColor;
              `}
              d="M12 21.638h-.014C9.403 21.59 1.95 14.856 1.95 8.478c0-3.064 2.525-5.754 5.403-5.754 2.29 0 3.83 1.58 4.646 2.73.813-1.148 2.353-2.73 4.644-2.73 2.88 0 5.404 2.69 5.404 5.755 0 6.375-7.454 13.11-10.037 13.156H12zM7.354 4.225c-2.08 0-3.903 1.988-3.903 4.255 0 5.74 7.035 11.596 8.55 11.658 1.52-.062 8.55-5.917 8.55-11.658 0-2.267-1.822-4.255-3.902-4.255-2.528 0-3.94 2.936-3.952 2.965-.23.562-1.156.562-1.387 0-.015-.03-1.426-2.965-3.955-2.965z"
            />
          </svg>
          <span>{public_metrics.like_count}</span>
        </a>
      </div>
    </div>
  );
};

export default Tweet;
