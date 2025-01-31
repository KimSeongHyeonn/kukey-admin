import { readable } from 'svelte/store';
import { PUBLIC_API_URL } from '$env/static/public';

// API URL store
export const apiUrl = readable<string>(PUBLIC_API_URL || 'http://localhost:3000/');
