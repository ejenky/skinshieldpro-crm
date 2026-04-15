import PocketBase from 'pocketbase';

const pb = new PocketBase(import.meta.env.VITE_PB_URL || '/pb');

// Disable PB's built-in auto-cancellation of duplicate requests. React StrictMode
// double-invokes effects in dev, which was triggering "autocancelled" errors
// and leaving hooks with empty state after a hard refresh.
pb.autoCancellation(false);

export default pb;
