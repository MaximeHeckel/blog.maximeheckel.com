import fs from 'fs';
import GPT3Tokenizer from 'gpt3-tokenizer';
import matter from 'gray-matter';
import path from 'path';

const MAX_TOKEN = 512;
const CHUNK_OVERLAP = 100; // 20% overlap for better context continuity

// Remove JSX syntax from a string
function removeJSX(str) {
  const regex = /<[^>]+>/g;
  return str.replace(regex, '');
}

// Extract the link text from a markdown link
function extractLink(text) {
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
  return text.replace(regex, (match, p1, p2) => p1);
}

// Replace newline characters with spaces within a string
function replaceNewlineWithSpace(str) {
  return str.replace(/\n/g, ' ');
}

// // Extract sections from an MDX file content
// function createChunks(mdxContent) {
//   const lines = mdxContent.split('\n');
//   const sections = {};
//   let currentSection = '';
//   let currentContent = '';
//   let inCodeBlock = false;

//   for (const line of lines) {
//     // Toggle the inCodeBlock flag when encountering code blocks
//     if (line.startsWith('```')) {
//       inCodeBlock = !inCodeBlock;
//     }

//     if (!inCodeBlock) {
//       if (line.startsWith('## ')) {
//         // Store the previous section and start a new one when encountering section headings
//         if (currentSection) {
//           sections[currentSection] = currentContent.trim();
//         }
//         currentSection = line.slice(3).trim();
//         currentContent = '';
//       } else {
//         // Extract the link text from the line, remove any JSX syntax, and append it to the current section content
//         const processed = extractLink(removeJSX(line));
//         currentContent += `${processed}\n`;
//       }
//     } else {
//       // Append the line to the current section content when inside a code block
//       currentContent += `${line}\n`;
//     }

//     // Replace newline characters with spaces in the current section content
//     currentContent = replaceNewlineWithSpace(currentContent);
//   }

//   // Store the last section when there are no more lines to process
//   if (currentSection) {
//     sections[currentSection] = currentContent.trim();
//   }

//   return sections;
// }

function cleanMDXFile(mdxContent) {
  const lines = mdxContent.split('\n');
  const sections = [];
  const codeBlocks = []; // Track code block positions
  let currentSection = null;
  let currentHeading = '';
  let currentContent = '';
  let inCodeBlock = false;
  let codeBlockLanguage = '';
  let codeBlockStart = 0;
  let charPosition = 0;

  for (const line of lines) {
    const lineLength = line.length + 1; // +1 for newline character

    // Toggle the inCodeBlock flag when encountering code blocks
    if (line.startsWith('```')) {
      if (!inCodeBlock) {
        // Starting a code block
        inCodeBlock = true;
        codeBlockStart = charPosition;
        // Extract language from code block start
        codeBlockLanguage = line.slice(3).trim();
      } else {
        // Ending a code block
        inCodeBlock = false;
        codeBlocks.push({
          start: codeBlockStart,
          end: charPosition + lineLength,
          language: codeBlockLanguage,
        });
        codeBlockLanguage = '';
      }
    }

    // Track section headings (H2 and H3)
    if (!inCodeBlock) {
      if (line.startsWith('## ')) {
        // Close previous section if exists
        if (currentSection) {
          currentSection.end = charPosition - 1;
          currentSection.content = currentContent.trim();
        }

        // Start new section
        currentHeading = line.slice(3).trim();
        currentSection = {
          title: currentHeading,
          heading: currentHeading,
          start: charPosition,
          end: 0,
          content: '',
        };
        sections.push(currentSection);
        currentContent = '';
      } else if (line.startsWith('### ')) {
        // H3 subsection - update heading but keep same section
        const subheading = line.slice(4).trim();
        if (currentSection) {
          currentSection.heading = `${currentSection.title} > ${subheading}`;
        }
      }

      // Extract the link text from the line, remove any JSX syntax, and append it to the current section content
      const processed = extractLink(removeJSX(line));
      currentContent += `${processed}\n`;
    } else {
      // Append the line to the current section content when inside a code block
      currentContent += `${line}\n`;
    }

    charPosition += lineLength;
  }

  // Close the last section
  if (currentSection) {
    currentSection.end = charPosition;
    currentSection.content = currentContent.trim();
  }

  // If no sections were found, create a default one
  if (sections.length === 0) {
    sections.push({
      title: '',
      heading: '',
      start: 0,
      end: charPosition,
      content: currentContent.trim(),
    });
  }

  // Replace newline characters with spaces in all section content
  const cleanedContent = sections
    .map((s) => replaceNewlineWithSpace(s.content))
    .join(' ');

  return { content: cleanedContent, sections, codeBlocks };
}

function splitIntoChunks(inputText, sections = [], codeBlocks = []) {
  const Tokenizer = GPT3Tokenizer.default;
  const chunks = [];
  let chunk = {
    tokens: [],
    start: 0,
    end: 0,
  };

  let start = 0;

  const tokenizer = new Tokenizer({ type: 'gpt3' });

  const { text } = tokenizer.encode(inputText);

  // Helper function to detect if a position is inside a code block
  const getCodeBlockAt = (position) => {
    return codeBlocks.find((cb) => cb.start <= position && cb.end >= position);
  };

  // Helper function to determine content type of a chunk
  const getContentType = (chunkStart, chunkEnd) => {
    const codeBlock = codeBlocks.find(
      (cb) =>
        (cb.start >= chunkStart && cb.start <= chunkEnd) ||
        (cb.end >= chunkStart && cb.end <= chunkEnd) ||
        (cb.start <= chunkStart && cb.end >= chunkEnd)
    );

    if (codeBlock) {
      // Calculate what percentage of the chunk is code
      const overlapStart = Math.max(chunkStart, codeBlock.start);
      const overlapEnd = Math.min(chunkEnd, codeBlock.end);
      const overlapLength = overlapEnd - overlapStart;
      const chunkLength = chunkEnd - chunkStart;
      const codePercentage = overlapLength / chunkLength;

      if (codePercentage > 0.5) {
        return { type: 'code', language: codeBlock.language };
      }
    }
    return { type: 'prose', language: '' };
  };

  for (let i = 0; i < text.length; i++) {
    const word = text[i];
    const newChunkTokens = [...chunk.tokens, word];

    if (newChunkTokens.length > MAX_TOKEN) {
      const chunkText = chunk.tokens.join('');
      const chunkEnd = start + chunkText.length;

      // Find which section this chunk belongs to based on character position
      const chunkMiddle = start + Math.floor(chunkText.length / 2);
      const currentSection = sections.find(
        (s) => s.start <= chunkMiddle && s.end >= chunkMiddle
      );

      // Determine content type
      const contentTypeInfo = getContentType(start, chunkEnd);

      chunks.push({
        text: chunkText,
        start,
        end: chunkEnd,
        section: currentSection?.title || '',
        heading: currentSection?.heading || '',
        contentType: contentTypeInfo.type,
        language: contentTypeInfo.language,
      });

      start += chunkText.length + 1;

      // Implement overlap: keep last CHUNK_OVERLAP tokens for next chunk
      const overlapTokens = chunk.tokens.slice(-CHUNK_OVERLAP);
      chunk = {
        tokens: [...overlapTokens, word],
        start: start - overlapTokens.join('').length,
        end: start,
      };
    } else {
      chunk = {
        ...chunk,
        tokens: newChunkTokens,
      };
    }
  }

  // Push the final chunk if it has content
  if (chunk.tokens.length > 0) {
    const chunkText = chunk.tokens.join('');
    const chunkEnd = start + chunkText.length;
    const chunkMiddle = start + Math.floor(chunkText.length / 2);
    const currentSection = sections.find(
      (s) => s.start <= chunkMiddle && s.end >= chunkMiddle
    );

    // Determine content type
    const contentTypeInfo = getContentType(start, chunkEnd);

    chunks.push({
      text: chunkText,
      start,
      end: chunkEnd,
      section: currentSection?.title || '',
      heading: currentSection?.heading || '',
      contentType: contentTypeInfo.type,
      language: contentTypeInfo.language,
    });
  }

  return chunks;
}

// Process an MDX file and extract its sections
async function processMdxFile(filePath) {
  try {
    const fileContent = await fs.promises.readFile(filePath, 'utf8');
    const parsedContent = matter(fileContent);

    const { data: metadata, content } = parsedContent;

    const { content: text, sections, codeBlocks } = cleanMDXFile(content);
    const chunks = splitIntoChunks(text, sections, codeBlocks);

    return { metadata, chunks };
  } catch (error) {
    throw new Error(`Error processing MDX file: ${error}`);
  }
}

export default processMdxFile;
