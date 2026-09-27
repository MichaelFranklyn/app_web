export interface MarkOrdersDeliveredResponse {
  markOrdersDelivered: {
    delivered: number;
    stockedProducts: number;
    failures: { orderId: string; message: string }[];
  };
}
