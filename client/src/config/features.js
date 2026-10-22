/**
 * Feature Flags Configuration for MeethaCart
 * 
 * MILESTONE 3 LOCK:
 * Out-of-scope features are locked to false for the MID evaluation.
 * Simply flip flags to true to re-enable when developing later milestones.
 */

export const FEATURES = {
  CART_AND_CHECKOUT: false,
  ORDERS_AND_TRACKING: false,
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
