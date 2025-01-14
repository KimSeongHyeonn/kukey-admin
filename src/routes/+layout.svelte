<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { checkAuth } from '$lib/utils';
	import { writable } from 'svelte/store';

	// 햄버거 메뉴 상태 관리
	const isMenuOpen = writable(false);

	// 페이지 이동 함수
	const navigate = (href: string) => {
		if (!checkAuth()) {
			goto('/');
			alert('로그인이 필요합니다.');
		} else {
			goto(href);
			isMenuOpen.set(false); // 메뉴 닫기
		}
	};
</script>

<!-- 네비게이션 바 -->
{#if page.url.pathname !== '/'}
	<nav class="navbar">
		<div class="navbar-logo">
			<h1>🍪KU-key Admin</h1>
		</div>

		<!-- 햄버거 메뉴 버튼 -->
		<button
			class="navbar-burger"
			on:click={() => isMenuOpen.update((v) => !v)}
			class:is-active={$isMenuOpen}
			type="button"
			aria-label="Toggle navigation"
		>
			<span></span>
			<span></span>
			<span></span>
		</button>

		<!-- 네비게이션 링크 -->
		<div class="navbar-links {$isMenuOpen ? 'is-active' : ''}">
			<button on:click={() => navigate('/ku-requests')}>KU-Requests</button>
			<button on:click={() => navigate('/reports')}>Reports</button>
			<button on:click={() => navigate('/calendar')}>Calendar</button>
			<button on:click={() => navigate('/club')}>Club</button>
			<button on:click={() => navigate('/banner')}>Banner</button>
			<!-- 추가된 버튼 -->
		</div>
	</nav>
{/if}

<main class={page.url.pathname === '/' ? 'no-padding' : ''}>
	<slot />
</main>

<style>
	/* 네비게이션 바 스타일 */
	.navbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background-color: #1e1e1e;
		color: white;
		padding: 1rem 2rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		position: fixed;
		width: 100%;
		top: 0;
		left: 0;
		height: 60px;
		z-index: 1000;
		box-sizing: border-box;
	}

	/* 로고 스타일 */
	.navbar-logo h1 {
		font-size: 24px;
		font-weight: bold;
		cursor: pointer;
		color: #fff;
		margin: 0;
	}

	/* 햄버거 메뉴 버튼 스타일 */
	.navbar-burger {
		display: none;
		flex-direction: column;
		cursor: pointer;
		gap: 5px;
		background: none;
		border: none;
		padding: 0;
		width: 30px;
		height: 30px;
	}

	.navbar-burger span {
		width: 100%;
		height: 3px;
		background-color: #fff;
		border-radius: 2px;
		transition: all 0.3s ease-in-out;
	}

	/* 햄버거 메뉴 버튼 활성화 상태 */
	.navbar-burger.is-active span:nth-child(1) {
		transform: rotate(45deg) translate(5px, 5px);
	}

	.navbar-burger.is-active span:nth-child(2) {
		opacity: 0;
	}

	.navbar-burger.is-active span:nth-child(3) {
		transform: rotate(-45deg) translate(5px, -5px);
	}

	/* 네비게이션 링크 스타일 */
	.navbar-links {
		display: flex;
		gap: 1.5rem;
	}

	.navbar-links button {
		background-color: transparent;
		color: #ccc;
		border: none;
		font-size: 16px;
		cursor: pointer;
		padding: 0.5rem 1rem;
		border-radius: 5px;
		transition:
			background-color 0.3s,
			color 0.3s;
	}

	.navbar-links button:hover {
		background-color: #444;
		color: white;
	}

	/* 메인 콘텐츠 스타일 */
	main {
		padding-top: 55px;
		background-color: #f9f9f9;
	}

	.no-padding {
		padding-top: 0;
	}

	/* 반응형 스타일 (모바일) */
	@media (max-width: 768px) {
		.navbar-links {
			display: none;
			flex-direction: column;
			background-color: #1e1e1e;
			position: absolute;
			top: 60px;
			right: 0;
			width: 100%;
			padding: 1rem 2rem;
		}

		.navbar-links.is-active {
			display: flex;
		}

		.navbar-burger {
			display: flex;
		}
	}
</style>
