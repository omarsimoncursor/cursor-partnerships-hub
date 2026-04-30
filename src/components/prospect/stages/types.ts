import type { ReactElement } from 'react';

// Each vendor demo gets a "stage" — a vendor-themed visual that
// reacts to the agent step that's currently playing. The stage
// receives a normalized status payload so it can decide what to
// render at each beat.

export type StageStatus = 'idle' | 'running' | 'complete';

export type StageProps = {
  // Total number of agent steps for this vendor demo.
  totalSteps: number;
  // Currently active step index. -1 means idle.
  activeStep: number;
  // True for steps strictly before activeStep (or all of them when complete).
  status: StageStatus;
  // Account name to bake into the stage UI (e.g., "Cigna").
  account: string;
  // Vendor brand color.
  brand: string;
  // Page-wide accent color (the prospect's brand).
  pageAccent: string;
};

export type Stage = (props: StageProps) => ReactElement;
