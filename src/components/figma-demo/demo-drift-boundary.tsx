'use client';

import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /**
   * Defensive: if a child component crashes during the QA sweep we still want
   * the demo page to recover gracefully rather than blank-screen. This is NOT
   * the drift signal path — visual drift is detected by the QA-sweep overlay
   * inside `DesignQACard` and surfaced via its `onDriftDetected` callback.
   */
  onError?: (error: Error) => void;
}

interface State {
  hasError: boolean;
}

export class DemoDriftBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center text-text-tertiary text-sm py-12">
          Demo encountered an unexpected error. Reset to try again.
        </div>
      );
    }
    return this.props.children;
  }
}
