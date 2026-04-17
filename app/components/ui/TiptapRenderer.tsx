'use client';

import React from 'react';
import { cn } from '@/app/lib/utils';
import { TiptapContent, TiptapAnyNode, TiptapMark } from '@/app/lib/tiptap-types';

interface TiptapRendererProps {
  content: any; // TODO: Improve type safety with TiptapContent when types are refined
  className?: string;
  as?: 'div' | 'inline';
}

const isObject = (v: any): v is Record<string, any> => typeof v === 'object' && v !== null;

// Block types that should NOT be nested inside a paragraph
const BLOCK_TYPES = new Set(['paragraph', 'heading', 'blockquote', 'codeBlock', 'bulletList', 'orderedList', 'listItem', 'taskList', 'taskItem', 'table', 'tableRow', 'tableCell', 'tableHeader', 'doc']);

const isBlockNode = (node: any): boolean => {
  return isObject(node) && typeof node.type === 'string' && BLOCK_TYPES.has(node.type);
};

const getFullImageUrl = (url?: string): string | undefined => {
  if (!url) return undefined;
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return url;
  return `/uploads/${url}`;
};

// Normalize common malformed structures
const normalizeNode = (node: any): any => {
  if (node == null) return null;
  
  if (typeof node === 'string') {
    const trimmed = node.trim();
    
    // Always try to parse stringified JSON
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed);
        return normalizeNode(parsed);
      } catch (error) {
        // If parsing fails, return the string as-is to be displayed as text
        return node;
      }
    }
    // Return plain strings as-is
    return node;
  }
  
  if (Array.isArray(node)) {
    return node.map(normalizeNode).filter(Boolean);
  }
  
  if (!isObject(node)) return node;
  
  // Handle doc-inside-text
  if (node.type === 'text' && isObject(node.text)) {
    return normalizeNode(node.text);
  }
  
  // Handle doc - normalize its content
  if (node.type === 'doc' && Array.isArray(node.content)) {
    return {
      type: 'doc',
      content: normalizeContentArray(node.content)
    };
  }
  
  // Handle paragraph with nested blocks - EXTRACT the blocks!
  if (node.type === 'paragraph' && Array.isArray(node.content)) {
    const inlineContent: any[] = [];
    const extractedBlocks: any[] = [];
    
    for (const child of node.content) {
      if (isBlockNode(child) && child.type !== 'text') {
        // This is a nested block - EXTRACT it!
        extractedBlocks.push(child);
      } else {
        inlineContent.push(child);
      }
    }
    
    // If we extracted blocks, return them as siblings (not nested)
    if (extractedBlocks.length > 0) {
      // Return as a doc with multiple children so the parent can handle them
      const children: any[] = [];
      if (inlineContent.length > 0) {
        children.push({ type: 'paragraph', content: inlineContent.map(normalizeNode) });
      }
      children.push(...extractedBlocks.map(normalizeNode));
      return { type: 'doc', content: children };
    }
    
    // Valid paragraph with only inline content
    return {
      ...node,
      content: inlineContent.map(normalizeNode).filter(Boolean)
    };
  }
  
  // Normalize content array for other nodes
  if (Array.isArray(node.content)) {
    return {
      ...node,
      content: node.content.map(normalizeNode).filter(Boolean)
    };
  }
  
  return node;
};

// Normalize an array of content, flattening any extracted docs
const normalizeContentArray = (content: any[]): any[] => {
  const result: any[] = [];
  
  for (const item of content) {
    const normalized = normalizeNode(item);
    if (!normalized) continue;
    
    // If normalization returned a doc, flatten its content
    if (normalized.type === 'doc' && Array.isArray(normalized.content)) {
      result.push(...normalized.content);
    } else {
      result.push(normalized);
    }
  }
  
  return result;
};

// Extract plain text from a node for fallback
const extractText = (node: any): string => {
  if (node == null) return '';
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (!isObject(node)) return String(node);
  
  if (node.type === 'text') {
    if (typeof node.text === 'string') return node.text;
    return extractText(node.text);
  }
  
  if (Array.isArray(node.content)) {
    return node.content.map(extractText).join('');
  }
  
  return '';
};

// Render marks (bold, italic, etc.)
const renderMarks = (text: React.ReactNode, marks?: TiptapMark[]): React.ReactNode => {
  if (!marks || marks.length === 0) return text;
  
  return marks.reduce<React.ReactNode>((acc, mark, idx) => {
    switch (mark?.type) {
      case 'bold':
        return <strong key={idx}>{acc}</strong>;
      case 'italic':
        return <em key={idx}>{acc}</em>;
      case 'strike':
      case 'strikethrough':
        return <s key={idx}>{acc}</s>;
      case 'code':
        return <code key={idx} className="bg-gray-100 px-1 rounded text-sm">{acc}</code>;
      case 'link':
        return (
          <a 
            key={idx}
            href={mark.attrs?.href || '#'} 
            target={mark.attrs?.target || '_self'}
            rel={mark.attrs?.rel || undefined}
            className="hover:underline"
          >
            {acc}
          </a>
        );
      case 'underline':
        return <u key={idx}>{acc}</u>;
      default:
        return acc;
    }
  }, text);
};

// Render a single node to React elements
const renderNode = (node: any, key?: React.Key): React.ReactNode => {
  if (node == null) return null;
  
  if (typeof node === 'string' || typeof node === 'number') {
    return <React.Fragment key={key}>{String(node)}</React.Fragment>;
  }
  
  if (Array.isArray(node)) {
    return (
      <React.Fragment key={key}>
        {node.map((child, i) => renderNode(child, i))}
      </React.Fragment>
    );
  }
  
  if (!isObject(node)) return null;
  
  const normalized = normalizeNode(node);
  if (!normalized) return null;
  
  // Handle doc - just render content
  if (normalized.type === 'doc') {
    return (
      <React.Fragment key={key}>
        {normalized.content?.map((child: any, i: number) => renderNode(child, i))}
      </React.Fragment>
    );
  }
  
  // Handle text node
  if (normalized.type === 'text') {
    const text = typeof normalized.text === 'string' ? normalized.text : extractText(normalized.text);
    if (!text) return null;
    return <React.Fragment key={key}>{renderMarks(text, normalized.marks)}</React.Fragment>;
  }
  
  // Handle heading
  if (normalized.type === 'heading') {
    const level = normalized.attrs?.level || 1;
    const children = normalized.content?.map((child: any, i: number) => renderNode(child, i));
    
    switch (level) {
      case 1: return <h1 key={key} className="text-4xl font-bold">{children}</h1>;
      case 2: return <h2 key={key} className="text-3xl font-bold">{children}</h2>;
      case 3: return <h3 key={key} className="text-2xl font-bold">{children}</h3>;
      case 4: return <h4 key={key} className="text-xl font-bold">{children}</h4>;
      case 5: return <h5 key={key} className="text-lg font-bold">{children}</h5>;
      case 6: return <h6 key={key} className="text-base font-bold">{children}</h6>;
      default: return <h1 key={key} className="text-4xl font-bold">{children}</h1>;
    }
  }
  
  // Handle paragraph
  if (normalized.type === 'paragraph') {
    const children = normalized.content?.map((child: any, i: number) => renderNode(child, i));
    return <p key={key}>{children}</p>;
  }

  // Handle image
  if (normalized.type === 'image') {
    const src = getFullImageUrl(normalized.attrs?.src);
    if (!src) return null;
    const alt = normalized.attrs?.alt || '';
    const title = normalized.attrs?.title;
    return (
      <img
        key={key}
        src={src}
        alt={alt}
        title={title}
        className="max-w-full h-auto rounded-lg"
        loading="lazy"
      />
    );
  }
  
  // Handle hard break
  if (normalized.type === 'hardBreak') {
    return <br key={key} />;
  }
  
  // Handle list items
  if (normalized.type === 'listItem') {
    const children = normalized.content?.map((child: any, i: number) => renderNode(child, i));
    return <li key={key}>{children}</li>;
  }
  
  // Handle bullet list
  if (normalized.type === 'bulletList') {
    const children = normalized.content?.map((child: any, i: number) => renderNode(child, i));
    return <ul key={key} className="list-disc pl-5">{children}</ul>;
  }
  
  // Handle ordered list
  if (normalized.type === 'orderedList') {
    const children = normalized.content?.map((child: any, i: number) => renderNode(child, i));
    return <ol key={key} className="list-decimal pl-5">{children}</ol>;
  }
  
  // Handle blockquote
  if (normalized.type === 'blockquote') {
    const children = normalized.content?.map((child: any, i: number) => renderNode(child, i));
    return (
      <blockquote key={key} className="border-l-4 border-gray-300 pl-4 italic">
        {children}
      </blockquote>
    );
  }
  
  // Handle code block
  if (normalized.type === 'codeBlock') {
    const content = extractText(normalized.content);
    return (
      <pre key={key} className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
        <code>{content}</code>
      </pre>
    );
  }
  
  // Default: try to render content
  if (Array.isArray(normalized.content)) {
    return (
      <React.Fragment key={key}>
        {normalized.content.map((child: any, i: number) => renderNode(child, i))}
      </React.Fragment>
    );
  }
  
  return null;
};

export const TiptapRenderer: React.FC<TiptapRendererProps> = ({ 
  content, 
  className,
  as = 'div'
}) => {
  // Handle null/undefined
  if (content == null) return null;
  
  // Handle plain text strings directly (not Tiptap JSON)
  if (typeof content === 'string') {
    const trimmed = content.trim();
    // If it looks like JSON, try to parse it
    if ((trimmed.startsWith('{') || trimmed.startsWith('[')) && 
        (trimmed.endsWith('}') || trimmed.endsWith(']'))) {
      try {
        const parsed = JSON.parse(trimmed);
        const normalized = normalizeNode(parsed);
        if (!normalized) return null;
        const rendered = renderNode(normalized);
        if (as === 'inline') {
          return <span className={className}>{rendered}</span>;
        }
        return (
          <div className={cn('prose prose-gray max-w-none', className)}>
            {rendered}
          </div>
        );
      } catch {
        // JSON parse failed, render as plain text
        return <span className={className}>{trimmed}</span>;
      }
    }
    // Plain text - render directly
    return <span className={className}>{trimmed}</span>;
  }
  
  // Normalize and render Tiptap JSON content
  const normalized = normalizeNode(content);
  
  if (!normalized) return null;
  
  // If normalized is a string, render it directly
  if (typeof normalized === 'string') {
    return <span className={className}>{normalized}</span>;
  }
  
  // If it's a doc with single paragraph/heading, render inline-friendly ONLY when as="inline"
  if (as === 'inline' && normalized.type === 'doc' && Array.isArray(normalized.content) && normalized.content.length > 0) {
    const firstNode = normalized.content[0];
    
    // Single heading - render just the heading content
    if (normalized.content.length === 1 && firstNode?.type === 'heading') {
      const children = firstNode.content?.map((child: any, i: number) => renderNode(child, i));
      return <span className={className}>{children}</span>;
    }
    
    // Single paragraph - render just the paragraph content
    if (normalized.content.length === 1 && firstNode?.type === 'paragraph') {
      const children = firstNode.content?.map((child: any, i: number) => renderNode(child, i));
      return <span className={className}>{children}</span>;
    }
    
    // For inline mode with multiple nodes, render all nodes but without block-level formatting
    const children = normalized.content.map((child: any, i: number) => {
      if (child.type === 'heading') {
        return child.content?.map((textChild: any, j: number) => renderNode(textChild, `${i}-${j}`));
      } else if (child.type === 'paragraph') {
        return child.content?.map((textChild: any, j: number) => renderNode(textChild, `${i}-${j}`));
      }
      return renderNode(child, i);
    }).flat();
    return <span className={className}>{children}</span>;
  }
  
  // Render full structure
  const rendered = renderNode(normalized);
  
  if (as === 'inline') {
    return <span className={className}>{rendered}</span>;
  }
  
  return (
    <div className={cn('prose prose-gray max-w-none', className)}>
      {rendered}
    </div>
  );
};
