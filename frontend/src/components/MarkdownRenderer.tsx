import ReactMarkdown from "react-markdown";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/** Renders markdown text with consistent styling for The Oracle's output. */
export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  if (!content) return null;

  return (
    <div className={className}>
      <ReactMarkdown
        components={{
          p: ({ children }) => (
            <p style={{ marginBottom: "1em", lineHeight: 1.85, fontSize: "1.05rem" }}>
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong style={{ fontWeight: 600, color: "inherit" }}>
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em style={{ fontStyle: "italic", opacity: 0.9 }}>{children}</em>
          ),
          h1: ({ children }) => (
            <h3 style={{ fontWeight: 700, marginTop: "1.5em", marginBottom: "0.5em" }}>
              {children}
            </h3>
          ),
          h2: ({ children }) => (
            <h4 style={{ fontWeight: 600, marginTop: "1.2em", marginBottom: "0.5em" }}>
              {children}
            </h4>
          ),
          h3: ({ children }) => (
            <h5 style={{ fontWeight: 600, marginTop: "1em", marginBottom: "0.4em" }}>
              {children}
            </h5>
          ),
          ul: ({ children }) => (
            <ul style={{ paddingLeft: "1.5em", marginBottom: "1em" }}>{children}</ul>
          ),
          ol: ({ children }) => (
            <ol style={{ paddingLeft: "1.5em", marginBottom: "1em" }}>{children}</ol>
          ),
          li: ({ children }) => (
            <li style={{ marginBottom: "0.4em", lineHeight: 1.7 }}>{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote
              style={{
                borderLeft: "3px solid var(--oracle-accent, #c4956a)",
                paddingLeft: "1em",
                marginLeft: 0,
                opacity: 0.85,
                fontStyle: "italic",
              }}
            >
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code
              style={{
                background: "rgba(255,255,255,0.1)",
                padding: "0.15em 0.4em",
                borderRadius: "4px",
                fontSize: "0.9em",
              }}
            >
              {children}
            </code>
          ),
          hr: () => (
            <hr
              style={{
                border: "none",
                borderTop: "1px solid rgba(255,255,255,0.1)",
                margin: "1.5em 0",
              }}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
