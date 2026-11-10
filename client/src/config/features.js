/**
 * Feature Flags Configuration for MeethaCart
 * 
 * M4/M5 shopping and order flows are enabled; later milestone features remain locked.
 */

export const FEATURES = {
  CART_AND_CHECKOUT: true,
  ORDERS_AND_TRACKING: true,
  WALLET_AND_PAYMENTS: false,
  NOTIFICATIONS: false,
  CUSTOM_REQUESTS_BIDDING: false,
  REVIEWS_AND_RATINGS: false,
  MESSAGES_AND_CHAT: false,
  SELLER_FOLLOW: false,
  CLASSES_AND_WORKSHOPS: false,
  ANALYTICS_AND_FORECASTING: false
};

export const isFeatureEnabled = (featureKey) => {
  return Boolean(FEATURES[featureKey]);
};

export default FEATURES;
