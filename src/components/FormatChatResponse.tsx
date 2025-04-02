import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";

// Define props type
interface FormattedResponseProps {
  msg: {
    text: string;
  };
}

const FormattedResponse: React.FC<FormattedResponseProps> = ({ msg }) => {
  return (
    <div className="whitespace-pre-wrap">
      {msg.text
        .split(/\n{2,}/) // Split paragraphs or sections
        .filter((block) => block.trim() !== "")
        .map((block, idx) => {
          // Handle code blocks
          if (block.includes("```")) {
            const langMatch = block.match(/```(\w+)?/); // Extract language if available
            const lang = langMatch ? langMatch[1] : "plaintext"; // Default to plaintext
            const codeContent = block.replace(/```(\w+)?/g, "").trim(); // Remove triple backticks

            return (
              <SyntaxHighlighter key={idx} language={lang} style={dracula}>
                {codeContent}
              </SyntaxHighlighter>
            );
          }

          // Handle section headings (### Heading)
          if (block.startsWith("### ")) {
            return (
              <h3 key={idx} className="text-lg font-semibold mt-4">
                {block.replace(/^### /, "")}
              </h3>
            );
          }

          // Handle numbered lists (1. Item)
          if (/^\d+\./.test(block)) {
            const listItems = block.split("\n").map((item, i) => (
              <li key={i} className="ml-4">
                {item.replace(/^\d+\.\s*/, "")}
              </li>
            ));
            return (
              <ol key={idx} className="list-decimal ml-6 space-y-1">{listItems}</ol>
            ); // Added `space-y-1` for proper spacing
          }

          // Handle unordered lists (- Item)
          if (/^-\s/.test(block)) {
            const listItems = block.split("\n").map((item, i) => (
              <li key={i} className="ml-4">
                {item.replace(/^- /, "")}
              </li>
            ));
            return (
              <ul key={idx} className="list-disc ml-6 space-y-1">{listItems}</ul>
            ); // Added `space-y-1` for proper spacing
          }

          // Handle bold text (**bold**)
          const formattedText = block.split(/(\*\*.*?\*\*)/).map((part, i) =>
            part.match(/^\*\*(.*?)\*\*$/) ? (
              <span key={i} className="font-bold text-blue-600">
                {part.replace(/\*\*/g, "")}
              </span>
            ) : (
              part
            )
          );

          return (
            <p key={idx} className="mb-2">
              {formattedText}
            </p>
          );
        })}
    </div>
  );
};

export default FormattedResponse;