#!/usr/bin/env bash
set -euo pipefail

# Resets the Sentry demo bug files to their original (buggy) state.
# Run this after merging a fix PR to make the demo repeatable.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
ORDER_FILE="$REPO_ROOT/src/lib/demo/order-processor.ts"
FORMAT_FILE="$REPO_ROOT/src/lib/demo/format-payment.ts"

cat > "$ORDER_FILE" << 'ORDEREOF'
import { formatPaymentReceipt } from './format-payment';

export interface PaymentMethod {
  type: 'credit_card' | 'bank_transfer' | 'crypto';
  details: {
    last4: string;
    brand: string;
  };
}

export interface Order {
  id: string;
  item: string;
  quantity: number;
  unitPrice: number;
  paymentMethod: PaymentMethod;
}

export function processOrder(order: Order) {
  const total = order.quantity * order.unitPrice;

  const receipt = formatPaymentReceipt(order.paymentMethod);

  return {
    orderId: order.id,
    total,
    receipt,
    status: 'confirmed' as const,
    timestamp: new Date().toISOString(),
  };
}
ORDEREOF

cat > "$FORMAT_FILE" << 'FORMATEOF'
import type { PaymentMethod } from './order-processor';

export function formatPaymentReceipt(payment: PaymentMethod): string {
  const brand = payment.details.brand.toUpperCase();
  const masked = payment.details.last4;
  return `${brand} ending in ${masked}`;
}
FORMATEOF

cd "$REPO_ROOT"
git add "$ORDER_FILE" "$FORMAT_FILE"
git commit -m "chore: reset sentry demo bug for next run"
echo ""
echo "Demo bug reset. Push to main to redeploy:"
echo "  git push origin main"
