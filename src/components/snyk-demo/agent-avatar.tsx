'use client';

import { Bot } from 'lucide-react';

interface AgentAvatarProps {
  /** The verb the agent is doing right now. One short word. */
  verb: string;
  /** When true, the avatar reads "Done"; ring is green. */
  done?: boolean;
}

/**
 * Persistent agent chip in the top-left of the stage. The verb updates per
 * chapter ("Looking", "Tracing", ...). Replaces v2's identifier badges.
 *
 * Designed to be the only place a non-technical viewer needs to look to know
 * "what is the agent doing right now?".
 */
export function AgentAvatar({ verb, done }: AgentAvatarProps) {
  return (
    <div className="inline-flex items-center gap-3 px-3 py-2 rounded-full border bg-dark-bg/80 backdrop-blur-md"
      style={{ borderColor: done ? 'rgba(74,222,128,0.4)' : 'rgba(76,68,203,0.4)' }}
    >
      <div
        className="relative w-8 h-8 rounded-full flex items-center justify-center"
        style={{ background: done ? '#16A34A' : '#4C44CB' }}
      >
        <Bot className="w-4 h-4 text-white" />
        {!done && (
          <span
            className="absolute inset-0 rounded-full ring-2 animate-ping"
            style={{ ['--tw-ring-color' as string]: 'rgba(76,68,203,0.5)' }}
          />
        )}
      </div>
      <div>
        <p className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary leading-none mb-0.5">
          Cursor agent
        </p>
        <p className="text-sm font-semibold text-text-primary leading-tight">
          {verb}
          {!done && <span className="inline-block ml-1 animate-pulse">…</span>}
        </p>
      </div>
    </div>
  );
}
