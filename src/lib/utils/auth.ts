import { authStore } from '$lib/stores/auth';
import { isLoading } from '$lib/stores/loading';
import { apiUrl } from '$lib/stores/url';
import { get } from 'svelte/store';

export const login = async (email: string, password: string): Promise<boolean> => {
	isLoading.set(true);
	const url = get(apiUrl);
	const reqJson = {
		email: email,
		password: password,
		keepingLogin: false
	};
	try {
		const res = await fetch(url + 'auth/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(reqJson)
		});
		const data = await res.json();
		if (res.ok) {
			if (data.verified === false) {
				alert('인증되지 않은 계정입니다.');
				return false;
			}
			authStore.set(data.token);
			return true;
		} else {
			if (data.errorCode === 1001) {
				alert('올바르지 않은 이메일입니다.');
			} else if (data.errorCode === 1002) {
				alert('올바르지 않은 비밀번호입니다.');
			} else {
				alert('로그인에 실패했습니다.');
			}
			return false;
		}
	} catch (error) {
		alert('서버와의 연결에 실패했습니다.');
		return false;
	} finally {
		isLoading.set(false);
	}
};

export const refreshToken = async (): Promise<boolean> => {
	const url = get(apiUrl);
	const auth = get(authStore);
	if (!auth.refreshToken) return false;
	try {
		const res = await fetch(url + 'auth/refresh', {
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
	} catch (error) {
		return false;
	}
};

export const checkAuth = (): boolean => {
	const token = get(authStore);
	return token.accessToken !== null;
};
