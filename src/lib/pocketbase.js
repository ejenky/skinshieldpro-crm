import PocketBase from 'pocketbase';

const pb = new PocketBase(import.meta.env.VITE_PB_URL || 'http://159.65.184.35:8090');

export default pb;
