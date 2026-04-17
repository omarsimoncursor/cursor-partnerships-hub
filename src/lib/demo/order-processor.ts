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
