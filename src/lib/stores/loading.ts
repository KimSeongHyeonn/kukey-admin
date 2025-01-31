import { writable } from 'svelte/store';

// loading store
export const isLoading = writable<boolean>(false);
