import { simulateReadableStream } from 'ai';

export const OpenAIMockStream = async () => {
  // eslint-disable-next-line no-console
  console.info('=== MOCK STREAM ===');

  // Mock answer text
  const mockAnswer = `You can compose CSS variables by assigning a partial value to a variable and then reuse it in the composition of other variables. This allows you to easily create a color scale and update it by simply changing the base color.

Below is an example of defining a base color and composing the rest of the blue color scale with it:

\`\`\`css
:root {
  --base-blue: 222, 89%;
  --lightest-blue: hsla(var(--base-blue), 95%);
  --lighter-blue: hsla(var(--base-blue), 80%);
  --light-blue: hsla(var(--base-blue), 65%);
  --blue: hsla(var(--base-blue), 50%);
  --dark-blue: hsla(var(--base-blue), 35%);
  --darker-blue: hsla(var(--base-blue), 20%);
  --darkest-blue: hsla(var(--base-blue), 5%);
}
\`\`\`

This way, you can use these CSS variables elsewhere in your code, and they will always be updated in the case of a change to the \`--base-blue\` variable.`;

  // Mock sources
  const mockSources = [
    {
      title: 'A guide to CSS variable composition',
      url: '/posts/guide-to-css-variables',
    },
    {
      title: 'Advanced theming with CSS',
      url: '/posts/advanced-theming-css',
    },
  ];

  // Return an object that mimics streamObject's result
  return {
    toTextStreamResponse() {
      // Build the complete JSON string first
      const completeData = {
        answer: mockAnswer,
        sources: mockSources,
      };
      const completeJson = JSON.stringify(completeData);

      // Split into progressive chunks - each chunk adds more to the accumulated JSON
      const chunks: string[] = [];
      const chunkSize = 50; // characters per chunk

      for (let i = 0; i < completeJson.length; i += chunkSize) {
        chunks.push(completeJson.slice(i, i + chunkSize));
      }

      const stream = simulateReadableStream({
        initialDelayInMs: 100,
        chunkDelayInMs: 30,
        chunks,
      }).pipeThrough(new TextEncoderStream());

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
        },
      });
    },
  };
};
