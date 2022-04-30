import { Anchor, Flex, Text } from '@maximeheckel/design-system';
import { format } from 'date-fns';
import Image from 'next/image';
import { TransformedTweet } from 'types/tweet';
import { LikeIcon, ReplyIcon, RetweetIcon, TwitterLogo } from './Icons';
import {
  TweetWrapper,
  Avatar,
  Name,
  ImageGrid,
  SingleImageWrapper,
  ActionIcons,
  singleImage,
} from './Styles';

interface Props {
  tweet: TransformedTweet;
}

/*
  Note: this is heavily inspired by https://github.com/leerob/leerob.io/blob/main/components/Tweet.js 
*/
const Tweet = (props: Props) => {
  const { tweet } = props;

  // TODO: There's a race condition happening where the tweet might end up being undefined at first
  if (!tweet || !tweet.author) {
    return null;
  }

  const {
    author,
    media,
    created_at,
    public_metrics,
    id,
    text,
    referenced_tweets,
  } = tweet;

  const authorURL = `https://twitter.com/${author.username}`;
  const likeURL = `https://twitter.com/intent/like?tweet_id=${id}`;
  const retweetURL = `https://twitter.com/intent/retweet?tweet_id=${id}`;
  const replyURL = `https://twitter.com/intent/tweet?in_reply_to=${id}`;
  const tweetURL = `https://twitter.com/${author.username}/status/${id}`;
  const createdAt = new Date(created_at);

  const quoteTweet =
    referenced_tweets && referenced_tweets.find((t) => t.type === 'quoted');

  return (
    <TweetWrapper>
      <Flex alignItems="center" justifyContent="space-between">
        <Flex alignItems="center">
          <Avatar href={authorURL} target="_blank" rel="noopener noreferrer">
            <Image
              alt={author.username}
              height={46}
              width={46}
              src={author.profile_image_url}
            />
          </Avatar>
          <Name
            href={authorURL}
            className="author"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Text
              css={{ marginBottom: 0, lineHeight: '1.5' }}
              title={author.name}
              variant="primary"
              weight="4"
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
            </Text>
            <Text
              css={{ marginBottom: 0, lineHeight: 'initial' }}
              variant="tertiary"
              title={`@${author.username}`}
              size="2"
            >
              @{author.username}
            </Text>
          </Name>
        </Flex>
        <a
          href={tweetURL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`@${author.username}'s Twitter profile`}
        >
          <TwitterLogo />
        </a>
      </Flex>
      <Text
        as="p"
        variant="primary"
        css={{
          marginTop: '1rem',
          marginBottom: '1rem',
          whiteSpace: 'pre-wrap',
        }}
      >
        {text}
      </Text>
      {media && media.length > 1 ? (
        <ImageGrid>
          {media.map((m) => (
            <div
              key={m.media_key}
              style={{
                borderRadius: 'var(--border-radius-1)',
                overflow: 'hidden',
              }}
            >
              <Image
                alt={text}
                layout="intrinsic"
                height={m.height}
                width={m.width}
                src={m.url}
              />
            </div>
          ))}
        </ImageGrid>
      ) : null}
      {media && media.length === 1 ? (
        <SingleImageWrapper>
          {media.map((m) => (
            <Image
              key={m.media_key}
              alt={text}
              height={m.height}
              width={m.width}
              src={m.url}
              className={singleImage()}
            />
          ))}
        </SingleImageWrapper>
      ) : null}
      {quoteTweet ? <Tweet tweet={{ ...quoteTweet }} /> : null}
      <Anchor
        discreet
        href={tweetURL}
        target="_blank"
        rel="noopener noreferrer"
      >
        <time
          title={`Time Posted: ${createdAt.toUTCString()}`}
          dateTime={createdAt.toISOString()}
        >
          {format(createdAt, 'h:mm a - MMM d, y')}
        </time>
      </Anchor>
      <Flex
        css={{
          marginTop: '1rem',
        }}
      >
        <ActionIcons href={replyURL} target="_blank" rel="noopener noreferrer">
          <ReplyIcon />
          <span>{public_metrics.reply_count}</span>
        </ActionIcons>
        <ActionIcons
          href={retweetURL}
          target="_blank"
          rel="noopener noreferrer"
        >
          <RetweetIcon />
          <span>{public_metrics.retweet_count}</span>
        </ActionIcons>
        <ActionIcons href={likeURL} target="_blank" rel="noopener noreferrer">
          <LikeIcon />
          <span>{public_metrics.like_count}</span>
        </ActionIcons>
      </Flex>
    </TweetWrapper>
  );
};

export default Tweet;
