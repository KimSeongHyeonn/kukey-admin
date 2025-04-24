<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/components/Button.svelte';
	import { login } from '$lib/utils/auth';

	let email = '';
	let password = '';

	const handleLogin = async () => {
		if (email && password) {
			if (await login(email, password)) goto('/ku-requests');
		} else {
			alert('이메일과 비밀번호를 입력하세요.');
		}
	};
</script>

<main>
	<h1>Login</h1>
	<form>
		<input type="email" placeholder="Email" bind:value={email} />
		<input type="password" placeholder="Password" bind:value={password} />
		<Button onClick={handleLogin}>Login</Button>
	</form>
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: calc(100vh - 60px - 2rem);
	}

	h1 {
		margin-bottom: 20px;
		font-weight: 600;
	}

	form {
		display: flex;
		flex-direction: column;
		width: 300px;
	}

	input {
		padding: 8px;
		margin-bottom: 10px;
		border: 1px solid #ccc;
		border-radius: 5px;
		height: 40px;
	}
</style>
