'use client';

import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onError: (error: Error) => void;
}

interface State {
  hasError: boolean;
}

export class DemoMigrationBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    this.props.onError(error);
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}
