import React from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";

const components: Components = {
  h1: ({ node: _node, ...props }) => <h1 className="mt-6 mb-3 text-2xl font-bold leading-tight text-white first:mt-0" {...props} />,
  h2: ({ node: _node, ...props }) => <h2 className="mt-6 mb-3 text-xl font-bold text-purple-300 first:mt-0" {...props} />,
  h3: ({ node: _node, ...props }) => <h3 className="mt-4 mb-2 text-lg font-bold text-slate-200 first:mt-0" {...props} />,
  p: ({ node: _node, ...props }) => <p className="mb-4 leading-relaxed text-slate-400 last:mb-0" {...props} />,
  ul: ({ node: _node, ...props }) => <ul className="mb-4 ml-6 list-disc space-y-1 text-slate-400" {...props} />,
  ol: ({ node: _node, ...props }) => <ol className="mb-4 ml-6 list-decimal space-y-1 text-slate-400" {...props} />,
  li: ({ node: _node, ...props }) => <li className="pl-1 leading-relaxed" {...props} />,
  strong: ({ node: _node, ...props }) => <strong className="font-bold text-slate-200" {...props} />,
  em: ({ node: _node, ...props }) => <em className="italic" {...props} />,
  img: ({ node: _node, ...props }) => <img className="my-6 h-auto max-w-full rounded-xl" {...props} />,
};

export function MarkdownArticle({ content, className }: { content: string; className?: string }) {
  return (
    <div className={className}>
      <ReactMarkdown rehypePlugins={[rehypeRaw, rehypeSanitize]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
