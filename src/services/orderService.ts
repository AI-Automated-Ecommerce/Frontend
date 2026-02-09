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
 * Place a new order with transactional support
 */
export const placeOrder = async (orderData: PlaceOrderRequest): Promise<PlaceOrderResponse> => {
  const response = await api.post('/orders/place', orderData);
  return response.data;
};
