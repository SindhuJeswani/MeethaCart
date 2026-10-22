/**
 * Backend Feature Flags Configuration for MeethaCart
 * 
 * MILESTONE 3 LOCK:
 * Controls exposure of post-Milestone 3 APIs.
 */

export const FEATURES = {
  ORDERS_API: false,
  PAYMENTS_WALLET_API: false,
  NOTIFICATIONS_API: false,
  CUSTOM_REQUESTS_API: false,
  CHAT_MESSAGES_API: false,
  REVIEWS_API: false,
  ANALYTICS_API: false
};

export const isFeatureEnabled = (featureKey) => {
  return Boolean(FEATURES[featureKey]);
};

export default FEATURES;
