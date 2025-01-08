import { get } from 'svelte/store';
import { authStore } from '../store/auth';
import { apiUrl } from '../store/url';

const refreshToken = async () => {
	const url = get(apiUrl);
	const auth = get(authStore);
	const res = await fetch(`${url}/auth/refresh`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${auth.refreshToken}`
		}
	});
	if (res.ok) {
		const data = await res.json();
		authStore.set(data);
		return true;
	} else {
		return false;
	}
};

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
	const auth = get(authStore);
	const headers = new Headers(options.headers);
	if (auth.accessToken) {
		headers.set('Authorization', `Bearer ${auth.accessToken}`);
	}
	const res = await fetch(url, { ...options, headers });
	if (res.ok) {
		return res.json();
	} else {
		if (res.status === 401) {
			const success = await refreshToken();
			if (success) {
				return fetchWithAuth(url, options);
			}
		}
		return null;
	}
};

export const checkAuth = () => {
	const token = get(authStore);
	console.log(token);
	return token.accessToken !== null;
};
