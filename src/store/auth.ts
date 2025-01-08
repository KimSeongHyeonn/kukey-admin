import { writable } from 'svelte/store';

// 인터페이스 정의
interface AuthState {
	accessToken: string | null;
	refreshToken: string | null;
}

// 초기 상태
const initialAuthState: AuthState = {
	accessToken: null,
	refreshToken: null
};

// Auth Store
export const authStore = writable<AuthState>(initialAuthState);
