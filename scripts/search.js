import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';
import GPT3Tokenizer from 'gpt3-tokenizer';
import OpenAI from 'openai';

const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const OPEN_AI_API_KEY = process.env.OPEN_AI_API_KEY;
const OPENAI_EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL;

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_API_KEY);
const openAI = new OpenAI({ apiKey: OPEN_AI_API_KEY });

// This is mainly used for testing purposes,
const search = async () => {
  const query = process.argv[2];
  const input = query.replace(/\n/g, ' ');

  const embeddingResponse = await openAI.embeddings.create({
    input,
    model: OPENAI_EMBEDDING_MODEL,
  });

  const embedding = embeddingResponse.data[0].embedding;

  // eslint-disable-next-line no-console
  console.log(embedding);

  try {
    const { data: documents, error } = await supabaseClient.rpc(
      'match_documents',
      {
        query_embedding: embedding,
        similarity_threshold: 0.8, // Choose an appropriate threshold for your data
        match_count: 10, // Choose the number of matches
      }
    );

    if (!!error) {
      // eslint-disable-next-line no-console
      console.error(error);
      return;
      //   throw error;
    }

    // eslint-disable-next-line no-console
    console.log('result', documents);

    const Tokenizer = GPT3Tokenizer.default;
    const tokenizer = new Tokenizer({ type: 'gpt3' });
    let tokenCount = 0;
    let contextText = '';

    for (let i = 0; i < documents.length; i++) {
      const document = documents[i];
      const content = document.content;
      const encoded = tokenizer.encode(content);
      tokenCount += encoded.text.length;

      // Limit context to max 1500 tokens (configurable)
      if (tokenCount > 1500) {
        break;
      }

      contextText += `${content.trim()}\n---\n`;
    }

    const prompt = `You are a very enthusiastic assistant to my blog who loves
    to help people and especially my readers! Given the following sections (below "Context sections") from my blog
    posts, answer question that a user may have using only that information, outputted in markdown format.
    Do not repeat exactly word for word the text of the sections.

    Only use the information provided in the context sections. Do not use any other information apart the blog posts.

    If too little context is provided from the blog posts or you are unsure and the answer is not explicitly written in any of the blog posts, say
    "Sorry, I don't know how to help with that. Maxime hasn't written about it yet."

    Context sections:
    ${contextText}  

    Answer as markdown (including related code snippets if available).
    `;

    try {
      const stream = await openAI.chat.completions.create(
        {
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'assistant',
              content: prompt,
            },
            { role: 'user', content: query },
          ],
          temperature: 0,
          max_tokens: 512,
          stream: true,
        },
        { responseType: 'stream' }
      );

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          process.stdout.write(content);
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Chat completion error', error);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error querying for results:', error);
  }
};

search();
