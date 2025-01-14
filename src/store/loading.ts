import { writable } from 'svelte/store';

// API URL 전역 상태
export const isLoading = writable<boolean>(false);
