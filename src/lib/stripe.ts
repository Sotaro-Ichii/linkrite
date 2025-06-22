import { loadStripe } from '@stripe/stripe-js';

// Stripeの公開キーを環境変数から取得
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default stripePromise; 