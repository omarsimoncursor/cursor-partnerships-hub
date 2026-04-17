'use client';

import { useState } from 'react';
import { Lock } from 'lucide-react';

interface PasswordGateProps {
  password: string;
  recipientName: string;
  recipientTitle: string;
  children: React.ReactNode;
}

export function PasswordGate({ password, recipientName, recipientTitle, children }: PasswordGateProps) {
  const [input, setInput] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.toLowerCase() === password.toLowerCase()) {
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  if (unlocked) return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-dark-bg">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 rounded-2xl bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center mx-auto mb-8">
          <Lock className="w-7 h-7 text-accent-blue" />
        </div>

        <p className="text-sm text-text-tertiary uppercase tracking-wider mb-2">Prepared for</p>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-1">{recipientName}</h1>
        <p className="text-base text-text-secondary mb-10">{recipientTitle}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(false); }}
            placeholder="Enter password"
            className="w-full px-4 py-3 rounded-xl bg-dark-surface border border-dark-border text-text-primary text-center text-lg font-mono placeholder:text-text-tertiary focus:outline-none focus:border-accent-blue/50 transition-colors"
            autoFocus
          />
          {error && (
            <p className="text-sm text-accent-red">Incorrect password. Please try again.</p>
          )}
          <button
            type="submit"
            className="w-full px-4 py-3 rounded-xl bg-accent-blue/10 border border-accent-blue/30 text-accent-blue font-semibold hover:bg-accent-blue/20 transition-colors"
          >
            View Brief
          </button>
        </form>
      </div>
    </div>
  );
}
