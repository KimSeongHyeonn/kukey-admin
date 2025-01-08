import { writable } from 'svelte/store';

// API URL 전역 상태
export const apiUrl = writable<string>('http://localhost:3000/');
