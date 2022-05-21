import {
  Button,
  Card,
  Flex,
  Switch,
  TextArea,
} from '@maximeheckel/design-system';
import React from 'react';

type PromptStatus = 'submitting' | 'idle';

type PromptState = {
  status: PromptStatus;
  value: string;
  base: string;
};

type PromptToggle = {
  id: string;
  text: string;
  targetSet: number;
};

interface OpenAIPlaygroundProps {
  set: number;
  toggle?: PromptToggle;
  rows?: number;
}

const responsesSet = [
  {
    prompt: '1. 🦁',
    completions: [
      '1. 🦁🏈🦁🏈🦁🏈🦁🏈🦁🏈🦁🏈🦁🏈🦁🏈🦁🏈🦁🏈🦁🏈',
      '1. 🦁\n2. 🦁\n3. 🦁\n4. 🦁\n5.\n\n🦁\n1. 🦁\n2. 🦁\n3. 🦁\n4. 🦁\n5.\n\n🦁\n1. 🦁\n2. 🦁\n3. 🦁\n',
      '1. 🦁🦁🦁\n\n🎁🎁🎁\n\n🎁🎁🎁\n\n🎁🎁🎁\n\n(Sealed)\n\n🎁🎁🎁\n\n🎁',
    ],
  },
  {
    prompt: '1. 🦁\n2. 🐢\n3. 🦄\n4. 🐶\n5. 🐰',
    completions: [
      '1. 🦁\n2. 🐢\n3. 🦄\n4. 🐶\n5. 🐰\n6. 🐯\n7. 🐼\n8. 🐟\n9. 🐬\n10. 🐟\n\n1. 🐏\n2. 🐁\n3. 🐻\n4. 🐰\n5. 🐒\n6.',
      '1. 🦁\n2. 🐢\n3. 🦄\n4. 🐶\n5. 🐰\n6. 🐻\n7. 🐱\n8. 🐰\n9. 🐻\n10. 🐒\n11. 🐰\n12. 🦁\n13. 🐧\n14. 🐻\n15. 🦁\n16.',
      '1. 🦁\n2. 🐢\n3. 🦄\n4. 🐶\n5. 🐰\n6. 🐧\n7. 🐼\n8. 🐻\n9. 🐮\n10. 🐰\n11. 🐻\n12. 🐉\n13. 🦄\n14. 🐊\n15. 🐌\n16. \nAnimals Animals Bear',
    ],
  },
  {
    prompt: `While migrating my blog to Next.js, I took the opportunity to address the big performance pitfalls that were degrading the reader's experience in the previous version. With Core Web Vitals becoming one of the biggest factors in search ranking in 2021, I needed to get my act together and finally find workarounds to these issues before they impact my overall traffic. One of those issues was embed tweets. I often find myself in need to quote or reference a tweet in my MDX blog posts. However, using the classic Twitter embed iframe is not the best solution for that: they are slow to load and triggers a lot of Content Layout Shift (CLS) which hurts the performance of my blog.

I recently migrated my blog to Next.js and took the opportunity to address some performance issues. One of those issues was due to embed tweets which triggered a lot of CLS.

Something that originally caught my attention with Gatsby was its use of GraphQL. It became more of a curiosity over time honestly. While I'm sure it makes sense for many sites at scale (e-commerce, bigger and more complex publications), at least to me the GraphQL felt like an extra level of complexity that felt unnecessary. The more I iterated on my blog, the more the technical choice of GraphQL felt unjustified (for my use-case at least), building data sources felt way more complicated than it should have been.

I did not understand why GraphQL was necessary. It ended up slowing me down more than helping me when building my blog

Moreover, as the community grew, so did the number of plugins! This is a positive thing, don't get me wrong. But just try to search for RSS in the Gatsby Plugins website. There are 22 plugins (as I'm writing these words) doing more or less the same thing but each of them in a slightly different way. One would need to do a lot of digging to find which one is the "official"/"recommended" one to use which is not ideal. I'm pretty sure a little bit of curation in the plugin section would go a long way.

Gatsby plugins are not well curated. It's not easy to find the best plugin for a specific use-case.

The short answer to this is that you can't train GPT-3. To "tell" GPT-3 what output you want, you have to use what is referred to by the OpenAI team as the few-shot learning technique where you provide just a few examples of what you expect as input. There are other ways to "guide" GPT-3 into being more specific with its output by using fine-tuning.
    `,
    completions: [
      `While migrating my blog to Next.js, I took the opportunity to address the big performance pitfalls that were degrading the reader's experience in the previous version. With Core Web Vitals becoming one of the biggest factors in search ranking in 2021, I needed to get my act together and finally find workarounds to these issues before they impact my overall traffic. One of those issues was embed tweets. I often find myself in need to quote or reference a tweet in my MDX blog posts. However, using the classic Twitter embed iframe is not the best solution for that: they are slow to load and triggers a lot of Content Layout Shift (CLS) which hurts the performance of my blog.

I recently migrated my blog to Next.js and took the opportunity to address some performance issues. One of those issues was due to embed tweets which triggered a lot of CLS.

Something that originally caught my attention with Gatsby was its use of GraphQL. It became more of a curiosity over time honestly. While I'm sure it makes sense for many sites at scale (e-commerce, bigger and more complex publications), at least to me the GraphQL felt like an extra level of complexity that felt unnecessary. The more I iterated on my blog, the more the technical choice of GraphQL felt unjustified (for my use-case at least), building data sources felt way more complicated than it should have been.

I did not understand why GraphQL was necessary. It ended up slowing me down more than helping me when building my blog

Moreover, as the community grew, so did the number of plugins! This is a positive thing, don't get me wrong. But just try to search for RSS in the Gatsby Plugins website. There are 22 plugins (as I'm writing these words) doing more or less the same thing but each of them in a slightly different way. One would need to do a lot of digging to find which one is the "official"/"recommended" one to use which is not ideal. I'm pretty sure a little bit of curation in the plugin section would go a long way.

Gatsby plugins are not well curated. It's not easy to find the best plugin for a specific use-case.

The short answer to this is that you can't train GPT-3. To "tell" GPT-3 what output you want, you have to use what is referred to by the OpenAI team as the few-shot learning technique where you provide just a few examples of what you expect as input. There are other ways to "guide" GPT-3 into being more specific with its output by using fine-tuning.

I found that there was a lot of hype around GPT-3 and that it was the next big thing. But when I started digging into it, I found that there was a lot of things that were not working. For example, I found out that you can't train GPT-3 to recognize
    `,
      `While migrating my blog to Next.js, I took the opportunity to address the big performance pitfalls that were degrading the reader's experience in the previous version. With Core Web Vitals becoming one of the biggest factors in search ranking in 2021, I needed to get my act together and finally find workarounds to these issues before they impact my overall traffic. One of those issues was embed tweets. I often find myself in need to quote or reference a tweet in my MDX blog posts. However, using the classic Twitter embed iframe is not the best solution for that: they are slow to load and triggers a lot of Content Layout Shift (CLS) which hurts the performance of my blog.

I recently migrated my blog to Next.js and took the opportunity to address some performance issues. One of those issues was due to embed tweets which triggered a lot of CLS.

Something that originally caught my attention with Gatsby was its use of GraphQL. It became more of a curiosity over time honestly. While I'm sure it makes sense for many sites at scale (e-commerce, bigger and more complex publications), at least to me the GraphQL felt like an extra level of complexity that felt unnecessary. The more I iterated on my blog, the more the technical choice of GraphQL felt unjustified (for my use-case at least), building data sources felt way more complicated than it should have been.

I did not understand why GraphQL was necessary. It ended up slowing me down more than helping me when building my blog

Moreover, as the community grew, so did the number of plugins! This is a positive thing, don't get me wrong. But just try to search for RSS in the Gatsby Plugins website. There are 22 plugins (as I'm writing these words) doing more or less the same thing but each of them in a slightly different way. One would need to do a lot of digging to find which one is the "official"/"recommended" one to use which is not ideal. I'm pretty sure a little bit of curation in the plugin section would go a long way.

Gatsby plugins are not well curated. It's not easy to find the best plugin for a specific use-case.

The short answer to this is that you can't train GPT-3. To "tell" GPT-3 what output you want, you have to use what is referred to by the OpenAI team as the few-shot learning technique where you provide just a few examples of what you expect as input. There are other ways to "guide" GPT-3 into being more specific with its output by using fine-tuning.

The most common question I get about GPT-3 is how to train it to produce the right output. The answer is that you can't. You have to use the few-shot learning technique. I'm not sure what the answer is here. But it would be nice to have some kind
    `,
      `While migrating my blog to Next.js, I took the opportunity to address the big performance pitfalls that were degrading the reader's experience in the previous version. With Core Web Vitals becoming one of the biggest factors in search ranking in 2021, I needed to get my act together and finally find workarounds to these issues before they impact my overall traffic. One of those issues was embed tweets. I often find myself in need to quote or reference a tweet in my MDX blog posts. However, using the classic Twitter embed iframe is not the best solution for that: they are slow to load and triggers a lot of Content Layout Shift (CLS) which hurts the performance of my blog.

I recently migrated my blog to Next.js and took the opportunity to address some performance issues. One of those issues was due to embed tweets which triggered a lot of CLS.

Something that originally caught my attention with Gatsby was its use of GraphQL. It became more of a curiosity over time honestly. While I'm sure it makes sense for many sites at scale (e-commerce, bigger and more complex publications), at least to me the GraphQL felt like an extra level of complexity that felt unnecessary. The more I iterated on my blog, the more the technical choice of GraphQL felt unjustified (for my use-case at least), building data sources felt way more complicated than it should have been.

I did not understand why GraphQL was necessary. It ended up slowing me down more than helping me when building my blog

Moreover, as the community grew, so did the number of plugins! This is a positive thing, don't get me wrong. But just try to search for RSS in the Gatsby Plugins website. There are 22 plugins (as I'm writing these words) doing more or less the same thing but each of them in a slightly different way. One would need to do a lot of digging to find which one is the "official"/"recommended" one to use which is not ideal. I'm pretty sure a little bit of curation in the plugin section would go a long way.

Gatsby plugins are not well curated. It's not easy to find the best plugin for a specific use-case.

The short answer to this is that you can't train GPT-3. To "tell" GPT-3 what output you want, you have to use what is referred to by the OpenAI team as the few-shot learning technique where you provide just a few examples of what you expect as input. There are other ways to "guide" GPT-3 into being more specific with its output by using fine-tuning.

There is no way to train GPT-3 to be more specific with its output. You have to provide a few examples of what you expect as input. In my case, I have the data from my RSS feed in a separate data source. The data source gets populated by a cron job
    `,
    ],
  },
  {
    prompt: `input: While migrating my blog to Next.js, I took the opportunity to address the big performance pitfalls that were degrading the reader's experience in the previous version. With Core Web Vitals becoming one of the biggest factors in search ranking in 2021, I needed to get my act together and finally find workarounds to these issues before they impact my overall traffic. One of those issues was embed tweets. I often find myself in need to quote or reference a tweet in my MDX blog posts. However, using the classic Twitter embed iframe is not the best solution for that: they are slow to load and triggers a lot of Content Layout Shift (CLS) which hurts the performance of my blog.

summary: I recently migrated my blog to Next.js and took the opportunity to address some performance issues. One of those issues was due to embed tweets which triggered a lot of CLS.

input: Something that originally caught my attention with Gatsby was its use of GraphQL. It became more of a curiosity over time honestly. While I'm sure it makes sense for many sites at scale (e-commerce, bigger and more complex publications), at least to me the GraphQL felt like an extra level of complexity that felt unnecessary. The more I iterated on my blog, the more the technical choice of GraphQL felt unjustified (for my use-case at least), building data sources felt way more complicated than it should have been.

summary: I did not understand why GraphQL was necessary. It ended up slowing me down more than helping me when building my blog

input: Moreover, as the community grew, so did the number of plugins! This is a positive thing, don't get me wrong. But just try to search for RSS in the Gatsby Plugins website. There are 22 plugins (as I'm writing these words) doing more or less the same thing but each of them in a slightly different way. One would need to do a lot of digging to find which one is the "official"/"recommended" one to use which is not ideal. I'm pretty sure a little bit of curation in the plugin section would go a long way.

summary: Gatsby plugins are not well curated. It's not easy to find the best plugin for a specific use-case.

input: The short answer to this is that you can't train GPT-3. To "tell" GPT-3 what output you want, you have to use what is referred to by the OpenAI team as the few-shot learning technique where you provide just a few examples of what you expect as input. There are other ways to "guide" GPT-3 into being more specific with its output by using fine-tuning.
    `,
    completions: [
      `input: While migrating my blog to Next.js, I took the opportunity to address the big performance pitfalls that were degrading the reader's experience in the previous version. With Core Web Vitals becoming one of the biggest factors in search ranking in 2021, I needed to get my act together and finally find workarounds to these issues before they impact my overall traffic. One of those issues was embed tweets. I often find myself in need to quote or reference a tweet in my MDX blog posts. However, using the classic Twitter embed iframe is not the best solution for that: they are slow to load and triggers a lot of Content Layout Shift (CLS) which hurts the performance of my blog.

summary: I recently migrated my blog to Next.js and took the opportunity to address some performance issues. One of those issues was due to embed tweets which triggered a lot of CLS.

input: Something that originally caught my attention with Gatsby was its use of GraphQL. It became more of a curiosity over time honestly. While I'm sure it makes sense for many sites at scale (e-commerce, bigger and more complex publications), at least to me the GraphQL felt like an extra level of complexity that felt unnecessary. The more I iterated on my blog, the more the technical choice of GraphQL felt unjustified (for my use-case at least), building data sources felt way more complicated than it should have been.

summary: I did not understand why GraphQL was necessary. It ended up slowing me down more than helping me when building my blog

input: Moreover, as the community grew, so did the number of plugins! This is a positive thing, don't get me wrong. But just try to search for RSS in the Gatsby Plugins website. There are 22 plugins (as I'm writing these words) doing more or less the same thing but each of them in a slightly different way. One would need to do a lot of digging to find which one is the "official"/"recommended" one to use which is not ideal. I'm pretty sure a little bit of curation in the plugin section would go a long way.

summary: Gatsby plugins are not well curated. It's not easy to find the best plugin for a specific use-case.

input: The short answer to this is that you can't train GPT-3. To "tell" GPT-3 what output you want, you have to use what is referred to by the OpenAI team as the few-shot learning technique where you provide just a few examples of what you expect as input. There are other ways to "guide" GPT-3 into being more specific with its output by using fine-tuning.

summary: You can't train GPT-3 to output what you want. GPT-3 can be "guided" into being more specific with its output by using fine-tuning.
    `,
      `input: While migrating my blog to Next.js, I took the opportunity to address the big performance pitfalls that were degrading the reader's experience in the previous version. With Core Web Vitals becoming one of the biggest factors in search ranking in 2021, I needed to get my act together and finally find workarounds to these issues before they impact my overall traffic. One of those issues was embed tweets. I often find myself in need to quote or reference a tweet in my MDX blog posts. However, using the classic Twitter embed iframe is not the best solution for that: they are slow to load and triggers a lot of Content Layout Shift (CLS) which hurts the performance of my blog.

summary: I recently migrated my blog to Next.js and took the opportunity to address some performance issues. One of those issues was due to embed tweets which triggered a lot of CLS.

input: Something that originally caught my attention with Gatsby was its use of GraphQL. It became more of a curiosity over time honestly. While I'm sure it makes sense for many sites at scale (e-commerce, bigger and more complex publications), at least to me the GraphQL felt like an extra level of complexity that felt unnecessary. The more I iterated on my blog, the more the technical choice of GraphQL felt unjustified (for my use-case at least), building data sources felt way more complicated than it should have been.

summary: I did not understand why GraphQL was necessary. It ended up slowing me down more than helping me when building my blog

input: Moreover, as the community grew, so did the number of plugins! This is a positive thing, don't get me wrong. But just try to search for RSS in the Gatsby Plugins website. There are 22 plugins (as I'm writing these words) doing more or less the same thing but each of them in a slightly different way. One would need to do a lot of digging to find which one is the "official"/"recommended" one to use which is not ideal. I'm pretty sure a little bit of curation in the plugin section would go a long way.

summary: Gatsby plugins are not well curated. It's not easy to find the best plugin for a specific use-case.

input: The short answer to this is that you can't train GPT-3. To "tell" GPT-3 what output you want, you have to use what is referred to by the OpenAI team as the few-shot learning technique where you provide just a few examples of what you expect as input. There are other ways to "guide" GPT-3 into being more specific with its output by using fine-tuning.

summary: GPT-3 is not trainable. You can only provide a few examples of what you want it to output.
    `,
      `input: While migrating my blog to Next.js, I took the opportunity to address the big performance pitfalls that were degrading the reader's experience in the previous version. With Core Web Vitals becoming one of the biggest factors in search ranking in 2021, I needed to get my act together and finally find workarounds to these issues before they impact my overall traffic. One of those issues was embed tweets. I often find myself in need to quote or reference a tweet in my MDX blog posts. However, using the classic Twitter embed iframe is not the best solution for that: they are slow to load and triggers a lot of Content Layout Shift (CLS) which hurts the performance of my blog.

summary: I recently migrated my blog to Next.js and took the opportunity to address some performance issues. One of those issues was due to embed tweets which triggered a lot of CLS.

input: Something that originally caught my attention with Gatsby was its use of GraphQL. It became more of a curiosity over time honestly. While I'm sure it makes sense for many sites at scale (e-commerce, bigger and more complex publications), at least to me the GraphQL felt like an extra level of complexity that felt unnecessary. The more I iterated on my blog, the more the technical choice of GraphQL felt unjustified (for my use-case at least), building data sources felt way more complicated than it should have been.

summary: I did not understand why GraphQL was necessary. It ended up slowing me down more than helping me when building my blog

input: Moreover, as the community grew, so did the number of plugins! This is a positive thing, don't get me wrong. But just try to search for RSS in the Gatsby Plugins website. There are 22 plugins (as I'm writing these words) doing more or less the same thing but each of them in a slightly different way. One would need to do a lot of digging to find which one is the "official"/"recommended" one to use which is not ideal. I'm pretty sure a little bit of curation in the plugin section would go a long way.

summary: Gatsby plugins are not well curated. It's not easy to find the best plugin for a specific use-case.

input: The short answer to this is that you can't train GPT-3. To "tell" GPT-3 what output you want, you have to use what is referred to by the OpenAI team as the few-shot learning technique where you provide just a few examples of what you expect as input. There are other ways to "guide" GPT-3 into being more specific with its output by using fine-tuning.

summary: GPT-3 is not trainable. To get the output you want, you need to provide a few examples of what you expect as input.
    `,
    ],
  },
];

const OpenAIPlayground = (props: OpenAIPlaygroundProps) => {
  const { set, toggle, rows = 9 } = props;

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [selectedSet, setSelectedSet] = React.useState(set);

  const prompt = React.useMemo(() => responsesSet[selectedSet].prompt, [
    selectedSet,
  ]);

  const completions = React.useMemo(
    () => responsesSet[selectedSet].completions,
    [selectedSet]
  );

  const [promptState, setPromptState] = React.useState<PromptState>({
    status: 'idle',
    value: prompt,
    base: prompt,
  });

  const switchPrompt = React.useCallback((set: number) => {
    setPromptState({
      status: 'idle',
      value: responsesSet[set].prompt,
      base: responsesSet[set].prompt,
    });
  }, []);

  const scrollTextAreaToBottom = () => {
    if (textareaRef && textareaRef.current) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  };

  const makeRequest = async () => {
    setPromptState((prev) => ({ ...prev, status: 'submitting' }));

    const selectedCompletion =
      completions[Math.floor(Math.random() * completions.length)];

    setTimeout(() => {
      setPromptState((prev) => ({
        ...prev,
        status: 'idle',
        value: selectedCompletion,
      }));
      scrollTextAreaToBottom();
    }, 1200);
  };

  React.useEffect(() => {
    scrollTextAreaToBottom();
  }, []);

  return (
    <Card
      css={{
        marginBottom: '2.25rem',
      }}
    >
      <Card.Body>
        <TextArea
          aria-label="Prompt"
          label="Prompt"
          id="playground-1"
          value={promptState.value}
          onChange={() => {}}
          readOnly
          resize="none"
          rows={rows}
          ref={textareaRef}
        />
        <br />
        {toggle ? (
          <>
            <Switch
              aria-label={toggle.text}
              id={toggle.id}
              label={toggle.text}
              toggled={selectedSet === toggle.targetSet}
              onChange={(event) => {
                // @ts-ignore
                if (event.target.checked) {
                  setSelectedSet(toggle.targetSet);
                  switchPrompt(toggle.targetSet);
                } else {
                  setSelectedSet(set);
                  switchPrompt(set);
                }
              }}
            />
            <br />
          </>
        ) : null}
        <Flex alignItems="center" justifyContent="space-between">
          <Button
            disabled={promptState.status === 'submitting'}
            variant="primary"
            onClick={() => makeRequest()}
          >
            {promptState.status === 'submitting' ? 'Computing 🤖' : 'Submit ✨'}
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              setPromptState((prev) => ({
                ...prev,
                value: prev.base,
              }))
            }
          >
            Reset
          </Button>
        </Flex>
      </Card.Body>
    </Card>
  );
};

export default OpenAIPlayground;
