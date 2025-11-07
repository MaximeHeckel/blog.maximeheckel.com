import fs from 'fs';
import GPT3Tokenizer from 'gpt3-tokenizer';
import matter from 'gray-matter';
import path from 'path';

const MAX_TOKEN = 256;
const CHUNK_OVERLAP = 50; // ~20% overlap for better context continuity

// Remove JSX syntax from a string, preserving meaningful text like alt attributes
function removeJSX(str) {
  // First, extract alt text from Image/img components (handle multiline)
  const altTextRegex = /<(?:Image|img)[^>]*alt=["']([^"']+)["'][^>]*\/?>/gs;
  let result = str.replace(altTextRegex, (match, altText) => ` ${altText} `);

  // Remove all JSX component tags (opening, closing, self-closing) - handle multiline
  result = result.replace(/<\/?[A-Z][A-Za-z0-9]*[^>]*>/gs, '');

  // Remove all remaining HTML tags
  result = result.replace(/<[^>]+>/g, '');

  // Clean up JSX props that might remain (like width={...}, height={...})
  result = result.replace(/\b\w+={[^}]*}/g, '');
  result = result.replace(/\b\w+=["'][^"']*["']/g, '');

  // Clean up leftover closing brackets and whitespace
  result = result.replace(/\/>/g, '');
  result = result.replace(/\s+/g, ' ');

  return result.trim();
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
          // Process content: extract links and remove JSX (do this once for entire section)
          const processed = extractLink(removeJSX(currentContent));
          currentSection.content = replaceNewlineWithSpace(processed).trim();
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

      // Just accumulate raw content (we'll process it when closing the section)
      currentContent += `${line}\n`;
    } else {
      // Append the line to the current section content when inside a code block
      currentContent += `${line}\n`;
    }

    charPosition += lineLength;
  }

  // Close the last section
  if (currentSection) {
    currentSection.end = charPosition;
    // Process content: extract links and remove JSX
    const processed = extractLink(removeJSX(currentContent));
    currentSection.content = replaceNewlineWithSpace(processed).trim();
  }

  // If no sections were found, create a default one
  if (sections.length === 0) {
    const processed = extractLink(removeJSX(currentContent));
    sections.push({
      title: '',
      heading: '',
      start: 0,
      end: charPosition,
      content: replaceNewlineWithSpace(processed).trim(),
    });
  }

  // All section content is already processed and has newlines replaced with spaces
  const cleanedContent = sections.map((s) => s.content).join(' ');

  return { content: cleanedContent, sections, codeBlocks };
}

function splitIntoChunks(inputText, sections = [], codeBlocks = []) {
  const Tokenizer = GPT3Tokenizer.default;
  const chunks = [];

  const tokenizer = new Tokenizer({ type: 'gpt3' });

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

  // Process each section independently to avoid mixing content across sections
  for (const section of sections) {
    const sectionText = section.content;
    const { text: tokens } = tokenizer.encode(sectionText);

    let chunk = {
      tokens: [],
      start: section.start,
    };

    let currentPos = section.start;

    for (let i = 0; i < tokens.length; i++) {
      const word = tokens[i];
      const newChunkTokens = [...chunk.tokens, word];

      if (newChunkTokens.length > MAX_TOKEN) {
        // Save the current chunk
        const chunkText = chunk.tokens.join('');
        const chunkEnd = currentPos + chunkText.length;

        // Determine content type
        const contentTypeInfo = getContentType(chunk.start, chunkEnd);

        chunks.push({
          text: chunkText,
          start: chunk.start,
          end: chunkEnd,
          section: section.title || '',
          heading: section.heading || '',
          contentType: contentTypeInfo.type,
          language: contentTypeInfo.language,
        });

        currentPos = chunkEnd + 1;

        // Implement overlap: keep last CHUNK_OVERLAP tokens for next chunk
        const overlapTokens = chunk.tokens.slice(-CHUNK_OVERLAP);
        chunk = {
          tokens: [...overlapTokens, word],
          start: currentPos - overlapTokens.join('').length,
        };
      } else {
        chunk = {
          ...chunk,
          tokens: newChunkTokens,
        };
      }
    }

    // Push the final chunk for this section if it has content
    if (chunk.tokens.length > 0) {
      const chunkText = chunk.tokens.join('');
      const chunkEnd = currentPos + chunkText.length;

      // Determine content type
      const contentTypeInfo = getContentType(chunk.start, chunkEnd);

      chunks.push({
        text: chunkText,
        start: chunk.start,
        end: chunkEnd,
        section: section.title || '',
        heading: section.heading || '',
        contentType: contentTypeInfo.type,
        language: contentTypeInfo.language,
      });
    }
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
