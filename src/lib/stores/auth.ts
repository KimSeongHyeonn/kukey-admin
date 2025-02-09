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

if (sessionStorage.getItem('auth')) {
	const storedAuth = JSON.parse(sessionStorage.getItem('auth') as string);
	authStore.set(storedAuth);
}

authStore.subscribe((value) => {
	if (value) {
		sessionStorage.setItem('auth', JSON.stringify(value));
	} else {
		sessionStorage.removeItem('auth');
	}
});
