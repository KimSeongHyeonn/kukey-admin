import { goto } from '$app/navigation';
import { authStore } from '$lib/stores/auth';
import { isLoading } from '$lib/stores/loading';
import { refreshToken } from '$lib/utils/auth';
import { get } from 'svelte/store';

export const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<any> => {
	isLoading.set(true);
	const auth = get(authStore);
	const headers = new Headers(options.headers);
	if (auth.accessToken) {
		headers.set('Authorization', `Bearer ${auth.accessToken}`);
	}
	try {
		const res = await fetch(url, { ...options, headers });
		if (res.ok) {
			try {
				return await res.json();
			} catch (e) {
				return res;
			}
		} else {
			if (res.status === 401) {
				const success = await refreshToken();
				if (success) {
					return fetchWithAuth(url, options);
				} else {
					alert('로그인이 필요합니다.');
					goto('/');
				}
			} else if (res.status === 404) {
				alert('페이지를 찾을 수 없습니다.');
				window.history.back();
			} else if (res.status === 403) {
				alert('권한이 필요합니다.');
				window.history.back();
			} else {
				alert('데이터 요청에 실패했습니다.');
			}
			return null;
		}
	} catch (error) {
		alert('서버와의 연결에 실패했습니다.');
		return null;
	} finally {
		isLoading.set(false);
	}
};

// 쿼리스트링 특수문자 처리
export const replaceSpecialCharacters = (str: string): string => {
	return str.replace(/&/g, '%26').replace(/\+/g, '%2B').replace(/=/g, '%3D');
};
