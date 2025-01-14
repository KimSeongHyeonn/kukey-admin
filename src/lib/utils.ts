import { get } from 'svelte/store';
import { authStore } from '../store/auth';
import { apiUrl } from '../store/url';
import { isLoading } from '../store/loading';

const refreshToken = async () => {
	const url = get(apiUrl);
	const auth = get(authStore);
	if (!auth.refreshToken) return false;
	const res = await fetch(`${url}auth/refresh`, {
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

export const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<any> => {
	isLoading.set(true);
	const auth = get(authStore);
	const headers = new Headers(options.headers);
	if (auth.accessToken) {
		headers.set('Authorization', `Bearer ${auth.accessToken}`);
	}
	const res = await fetch(url, { ...options, headers });
	if (res.ok) {
		isLoading.set(false);
		try {
			return await res.json();
		} catch (e) {
			return res;
		}
	} else {
		if (res.status === 401) {
			const success = await refreshToken();
			if (success) {
				isLoading.set(false);
				return fetchWithAuth(url, options);
			}
		}
		isLoading.set(false);
		return null;
	}
};

export const checkAuth = () => {
	const token = get(authStore);
	return token.accessToken !== null;
};
