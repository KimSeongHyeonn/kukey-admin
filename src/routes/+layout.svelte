<script lang="ts">
	import { goto } from '$app/navigation';
	import { checkAuth } from '$lib/utils';

	const navigate = (href: string) => {
		if (!checkAuth()) {
			goto('/');
			alert('로그인이 필요합니다.');
		} else {
			goto(href);
		}
	};
</script>

<nav>
	<button on:click={() => navigate('/ku-requests')}>KU-Requests</button>
	<button on:click={() => navigate('/reports')}>Reports</button>
	<button on:click={() => navigate('/calendar')}>Calendar</button>
	<button on:click={() => navigate('/club')}>Club</button>
</nav>

<main>
	<slot />
</main>

<style>
	/* 네비게이션 바 스타일 */
	nav {
		display: flex;
		justify-content: center;
		background-color: #222;
		padding: 1rem;
		border-bottom: 2px solid #444;
		height: 45px;
	}

	/* 버튼 스타일 */
	nav button {
		background-color: transparent;
		color: #ccc;
		border: none;
		padding: 0.8rem 1.5rem;
		margin: 0 1rem;
		font-size: 18px;
		cursor: pointer;
		border-radius: 5px;
		transition:
			background-color 0.3s,
			color 0.3s;
	}

	/* hover 효과 */
	nav button:hover {
		background-color: #444;
		color: white;
	}

	/* 활성화된 페이지 스타일 */
	nav button:focus {
		background-color: #666;
		color: white;
	}
</style>
