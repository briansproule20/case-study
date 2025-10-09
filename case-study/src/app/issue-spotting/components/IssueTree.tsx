'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { IssueNode } from '@/lib/types';

interface IssueTreeProps {
  nodes: IssueNode[];
  depth?: number;
}

function IssueNodeComponent({ node, depth = 0 }: { node: IssueNode; depth?: number }) {
  const [isExpanded, setIsExpanded] = useState(depth < 2); // Auto-expand first 2 levels

  const hasChildren = node.children && node.children.length > 0;

  const typeColors = {
    Issue: 'bg-primary text-primary-foreground',
    SubIssue: 'bg-blue-100 text-blue-800',
    Element: 'bg-green-100 text-green-800',
    Defense: 'bg-orange-100 text-orange-800'
  };

  return (
    <div className={cn("space-y-1", depth > 0 && "ml-4")}>
      <div className="flex items-start gap-2">
        {hasChildren && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-1 text-muted-foreground hover:text-foreground"
          >
            {isExpanded ? (
              <ChevronDown className="size-4" />
            ) : (
              <ChevronRight className="size-4" />
            )}
          </button>
        )}
        {!hasChildren && <div className="w-4" />}
        
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={cn("text-xs", typeColors[node.type])}>
              {node.type}
            </Badge>
            <span className="font-medium text-sm">{node.title}</span>
          </div>
          {node.notes && (
            <p className="text-xs text-muted-foreground pl-2 border-l-2 border-muted">
              {node.notes}
            </p>
          )}
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="space-y-1">
          {node.children!.map((child, idx) => (
            <IssueNodeComponent key={idx} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function IssueTree({ nodes, depth = 0 }: IssueTreeProps) {
  if (!nodes || nodes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {nodes.map((node, idx) => (
        <IssueNodeComponent key={idx} node={node} depth={depth} />
      ))}
    </div>
  );
}

