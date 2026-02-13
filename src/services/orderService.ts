import api from './api';

/**
 * Order item for API requests
 */
export interface OrderItem {
  product_id: number;
  quantity: number;
}

/**
 * Request payload for placing a new order
 */
export interface PlaceOrderRequest {
  user_phone: string;
  user_name: string;
  user_email?: string;
  shipping_address: string;
  payment_method: string;
  items: OrderItem[];
}

/**
 * Response from placing an order
 */
export interface PlaceOrderResponse {
  order_id: number;
  status: string;
  total_amount: number;
  payment_method: string;
  message: string;
}

/**
 * Response from uploading payment receipt
 */
export interface PaymentReceiptUploadResponse {
  order_id: number;
  receipt_url: string;
  status: string;
  message: string;
}

/**
 * Place a new order with transactional support
 */
export const placeOrder = async (orderData: PlaceOrderRequest): Promise<PlaceOrderResponse> => {
  const response = await api.post('/orders/place', orderData);
  return response.data;
};

/**
 * Upload payment receipt for an order
 */
export const uploadPaymentReceipt = async (orderId: number, file: File): Promise<PaymentReceiptUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post(`/orders/${orderId}/payment-receipt`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
