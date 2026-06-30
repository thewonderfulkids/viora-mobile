# Sprint 18 — Premium Membership & Payment System

## Added

- `src/app/premium.tsx`
- `src/types/premium.ts`
- `src/hooks/usePremium.ts`
- `src/repositories/subscriptionRepository.ts`
- `src/repositories/paymentRepository.ts`
- `src/services/premium/premiumPlans.ts`
- `src/services/premium/premiumService.ts`
- `src/services/premium/paymentService.ts`
- `src/services/premium/index.ts`
- `src/components/premium/*`

## Updated

- `src/app/(tabs)/profile.tsx`
- `src/components/profile/ProfileSubscriptionCard.tsx`
- `src/components/index.ts`
- `src/hooks/index.ts`
- `src/repositories/index.ts`
- `src/services/index.ts`
- `src/types/index.ts`
- `src/firebase/firestoreCollections.ts`
- `firestore.rules`
- `firestore.indexes.json`

## Plan Model

- Viora Free — ₹0
- Viora Plus Monthly — ₹299/month
- Viora Plus Yearly — ₹2,499/year
- Viora Pro — ₹5,999/year
- Viora Elite Family — ₹24,999/year, up to 4 members

## Payment Design

- Payment provider abstraction is ready for Razorpay, Google Play Billing, Apple IAP and Stripe.
- Current mobile-side flow records a payment intent and supports manual/test activation in Firestore.
- Real money capture should be connected through backend/webhook before public paid launch.

## Validation

Run:

```bash
npx tsc --noEmit
npx expo-doctor
npx expo export --platform web
```

Deploy rules/indexes when ready:

```bash
firebase deploy --only firestore
```
