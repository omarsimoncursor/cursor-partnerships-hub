'use client';

import { useState, useEffect } from 'react';
import { processOrder } from '@/lib/demo/order-processor';
import { ShoppingCart, CreditCard, Loader2 } from 'lucide-react';

const DEMO_ORDER = {
  id: 'ORD-20260415-001',
  item: 'Cursor Business License',
  quantity: 50,
  unitPrice: 40,
};

export function CheckoutCard() {
  const [processing, setProcessing] = useState(false);
  const [shouldFire, setShouldFire] = useState(false);

  useEffect(() => {
    if (!processing) return;
    const timer = setTimeout(() => setShouldFire(true), 1500);
    return () => clearTimeout(timer);
  }, [processing]);

  if (shouldFire) {
    processOrder({
      ...DEMO_ORDER,
      paymentMethod: {
        type: 'bank_transfer',
        // @ts-expect-error — intentional: bank transfers have no card details
        details: undefined,
      },
    });
  }

  function handleProcessOrder() {
    setProcessing(true);
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="rounded-xl border border-dark-border bg-dark-surface overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-dark-border bg-dark-bg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-accent-blue" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">Order Summary</p>
              <p className="text-xs text-text-tertiary">Demo checkout flow</p>
            </div>
          </div>
        </div>

        {/* Order details */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-primary">{DEMO_ORDER.item}</p>
              <p className="text-xs text-text-tertiary">{DEMO_ORDER.quantity} seats × ${DEMO_ORDER.unitPrice}/mo</p>
            </div>
            <p className="text-sm font-mono font-medium text-text-primary">
              ${(DEMO_ORDER.quantity * DEMO_ORDER.unitPrice).toLocaleString()}/mo
            </p>
          </div>

          <div className="h-px bg-dark-border" />

          {/* Payment method */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-dark-bg">
            <CreditCard className="w-4 h-4 text-text-tertiary" />
            <div>
              <p className="text-xs font-medium text-text-primary">Bank Transfer</p>
              <p className="text-xs text-text-tertiary">ACH Direct Debit</p>
            </div>
            <span className="ml-auto text-xs text-accent-green font-mono">Verified</span>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm font-medium text-text-secondary">Total</p>
            <p className="text-lg font-bold text-text-primary">
              ${(DEMO_ORDER.quantity * DEMO_ORDER.unitPrice).toLocaleString()}/mo
            </p>
          </div>

          {/* Submit button */}
          <button
            onClick={handleProcessOrder}
            disabled={processing}
            className="w-full py-3 px-4 rounded-lg bg-accent-blue text-dark-bg font-medium text-sm
                       hover:bg-accent-blue/90 transition-all duration-200 flex items-center justify-center gap-2
                       disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing order...
              </>
            ) : (
              'Process Order'
            )}
          </button>

          <p className="text-[11px] text-text-tertiary text-center">
            By continuing you agree to the terms of service
          </p>
        </div>
      </div>
    </div>
  );
}
