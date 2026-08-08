import ReactMarkdown from "react-markdown";

// The model returns markdown; map each element onto the design's type styles.
const COMPONENTS = {
  p: ({ children }) => <p className="font-body-md text-body-md mb-md last:mb-0 leading-relaxed">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold text-on-surface">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => (
    <ul className="list-disc list-outside ml-md space-y-sm mb-md text-[15px] marker:text-primary">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-outside ml-md space-y-sm mb-md text-[15px] marker:text-primary marker:font-semibold">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="text-on-surface-variant">{children}</li>,
  h1: ({ children }) => <h3 className="font-headline-sm text-headline-sm text-on-surface mb-sm mt-md">{children}</h3>,
  h2: ({ children }) => <h3 className="font-headline-sm text-[18px] font-semibold text-on-surface mb-sm mt-md">{children}</h3>,
  h3: ({ children }) => <h4 className="font-label-md text-[16px] font-semibold text-on-surface mb-xs mt-md">{children}</h4>,
  // react-markdown v9 drops the `inline` flag, so `code` styles inline by default
  // and `pre` overrides its child for fenced blocks.
  code: ({ children }) => (
    <code className="font-mono text-[13px] bg-surface-container-high text-primary px-1 py-0.5 rounded">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="my-md p-md rounded-lg bg-surface-container-high overflow-x-auto
      [&>code]:bg-transparent [&>code]:p-0 [&>code]:text-on-surface">
      {children}
    </pre>
  ),
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline">
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-primary/30 pl-md italic text-on-surface-variant my-md">
      {children}
    </blockquote>
  ),
};

export function Markdown({ children }) {
  return <ReactMarkdown components={COMPONENTS}>{children}</ReactMarkdown>;
}

export default Markdown;
