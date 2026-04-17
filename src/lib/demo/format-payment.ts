import type { PaymentMethod } from './order-processor';

export function formatPaymentReceipt(payment: PaymentMethod): string {
  const brand = payment.details.brand.toUpperCase();
  const masked = payment.details.last4;
  return `${brand} ending in ${masked}`;
}
