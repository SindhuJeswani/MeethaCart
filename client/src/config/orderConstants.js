/**
 * MeethaCart Order Lifecycle & Status Constants (Client)
 * Placed -> Accepted -> Preparing -> Ready -> Completed
 */

export const ORDER_STATUS = {
  PLACED: 'Placed',
  ACCEPTED: 'Accepted',
  PREPARING: 'Preparing',
  READY: 'Ready',
  COMPLETED: 'Completed',
  REJECTED: 'Rejected'
};

export const ORDER_LIFECYCLE = [
  ORDER_STATUS.PLACED,
  ORDER_STATUS.ACCEPTED,
  ORDER_STATUS.PREPARING,
  ORDER_STATUS.READY,
  ORDER_STATUS.COMPLETED
];

export const NEXT_ORDER_STATUS = {
  [ORDER_STATUS.PLACED]: ORDER_STATUS.ACCEPTED,
  [ORDER_STATUS.ACCEPTED]: ORDER_STATUS.PREPARING,
  [ORDER_STATUS.PREPARING]: ORDER_STATUS.READY,
  [ORDER_STATUS.READY]: ORDER_STATUS.COMPLETED
};

export const PAYMENT_METHOD = {
  COD: 'COD'
};

export const PAYMENT_STATUS = {
  PENDING: 'Pending',
  COLLECTED: 'Collected'
};
