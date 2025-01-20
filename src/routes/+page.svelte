<script lang="ts">
	import { get } from 'svelte/store';
	import { apiUrl } from '../store/url';
	import { authStore } from '../store/auth';
	import { gotoWithBase } from '$lib/utils';

	let email = '';
	let password = '';

	const handleLogin = async () => {
		if (email && password) {
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

				if (res.ok) {
					const data = await res.json();
					if (data.verified === false) {
						alert('인증되지 않은 계정입니다.');
						return;
					}
					authStore.set(data.token);
					gotoWithBase('/ku-requests');
				} else {
					if (res.status === 400) {
						alert('이메일 또는 비밀번호가 일치하지 않습니다.');
					} else {
						alert('로그인에 실패했습니다.');
					}
				}
			} catch (error) {
				alert('서버와의 연결에 실패했습니다.');
			}
		} else {
			alert('이메일과 비밀번호를 입력하세요.');
		}
	};
</script>

<main>
	<h1>Login</h1>
	<form on:submit|preventDefault={handleLogin}>
		<input type="email" placeholder="Email" bind:value={email} />
		<input type="password" placeholder="Password" bind:value={password} />
		<button type="submit">Login</button>
	</form>
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: calc(100vh - 100px); /* 네비게이션 바 높이 보정 */
		background-color: #f9f9f9;
	}

	h1 {
		margin-bottom: 20px;
	}

	form {
		display: flex;
		flex-direction: column;
		width: 300px;
	}

	input {
		padding: 10px;
		margin-bottom: 10px;
		border: 1px solid #ccc;
		border-radius: 5px;
	}

	button {
		padding: 10px;
		background-color: #5a67d8;
		color: white;
		border: none;
		border-radius: 5px;
		cursor: pointer;
	}

	button:hover {
		background-color: #4c51bf;
	}
</style>
