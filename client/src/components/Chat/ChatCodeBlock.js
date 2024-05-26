// src/components/Chat/CodeBlock.js
import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// Import the style file you want to use
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CodeBlock = ({ language, value }) => {
  // Create a new style object that overrides the properties you want to change
  const customStyle = {
    ...vscDarkPlus, // Spread the existing styles first
    // Override the styles for the code tag within the class that matches the language-
    'code[class*="language-"]': {
      ...vscDarkPlus['code[class*="language-"]'], // Spread the existing code styles
      fontSize: '1.2em', // Set your desired font size
    },
    // Do the same for the pre tag if necessary
    'pre[class*="language-"]': {
      ...vscDarkPlus['pre[class*="language-"]'], // Spread the existing pre styles
      fontSize: '.75em', // Ensure the pre tag also gets the new font size
    },
  };

  return (
    <SyntaxHighlighter language={language} style={customStyle}>
      {value}
    </SyntaxHighlighter>
  );
};

export default CodeBlock;
