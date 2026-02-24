# TODO: Integrate NotchPay Payment System

## Backend Changes
- [ ] Update Order model (backend/src/models/Order.ts) to add payment.reference and payment.channel fields
- [ ] Install notchpay-node dependency in backend
- [ ] Create notchpay.service.ts (backend/src/services/notchpay.service.ts) with initiatePayment and verifyPayment functions
- [ ] Update orderRoutes.ts (backend/src/routes/orderRoutes.ts) to add payment routes: POST /orders/:orderId/payment/initiate, POST /webhooks/notchpay, GET /orders/:orderId/payment/verify
- [ ] Add NotchPay environment variables to backend config (backend/src/config/index.ts)

## Frontend Changes
- [ ] Update checkout.tsx (frontend/src/pages/checkout.tsx) to add payment method options and handle online payment initiation
- [ ] Create PaymentCallback.tsx (frontend/src/pages/PaymentCallback.tsx) for post-payment verification
- [ ] Update orderService.ts (frontend/src/services/orderService.ts) to include payment initiation API call

## Followup Steps
- [ ] Test payment flow in test mode
- [ ] Update .env file with test keys
- [ ] Ensure webhook URL is configured in NotchPay dashboard
