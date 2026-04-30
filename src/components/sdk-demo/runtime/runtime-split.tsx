'use client';

import { useCallback, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import type { ResolvedScript } from '@/lib/sdk-demo/scripts/pick-script';
import type { RuntimeStep } from '@/lib/sdk-demo/types';
import { AgentNetwork } from './agent-network';
import { SdkEventStream } from './sdk-event-stream';

interface RuntimeSplitProps {
  script: ResolvedScript;
  onComplete: () => void;
  finished: boolean;
}

export function RuntimeSplit({ script, onComplete, finished }: RuntimeSplitProps) {
  const [emittedSteps, setEmittedSteps] = useState<RuntimeStep[]>([]);

  const handleStep = useCallback((step: RuntimeStep) => {
    setEmittedSteps((prev) => [...prev, step]);
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,0.85fr)_auto_minmax(0,1.1fr)] gap-3 items-stretch">
        <div className="min-h-[520px] max-h-[calc(100vh-220px)]">
          <SdkEventStream steps={emittedSteps} script={script} finished={finished} />
        </div>
        <div className="hidden md:flex items-center justify-center">
          <div className="bg-dark-bg rounded-full w-8 h-8 flex items-center justify-center border border-dark-border">
            <ArrowRight className="w-3.5 h-3.5 text-text-tertiary" />
          </div>
        </div>
        <div className="min-h-[520px] max-h-[calc(100vh-220px)]">
          <AgentNetwork script={script} onStep={handleStep} onComplete={onComplete} />
        </div>
      </div>
    </div>
  );
}
