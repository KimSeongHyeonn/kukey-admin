<script lang="ts">
	import '../app.css';
	import { afterNavigate, beforeNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { checkAuth, gotoWithBase } from '$lib/utils';
	import { writable } from 'svelte/store';
	import { isLoading } from '../store/loading';
	import { base } from '$app/paths';

	// 햄버거 메뉴 상태 관리
	const isMenuOpen = writable(false);

	// 페이지 이동 함수
	const navigate = (href: string) => {
		if (!checkAuth()) {
			gotoWithBase('/');
			alert('로그인이 필요합니다.');
		} else {
			gotoWithBase(href);
			isMenuOpen.set(false); // 메뉴 닫기
		}
	};

	// 페이지 이동 시 로딩 상태 변경
	beforeNavigate(() => {
		isLoading.set(true);
	});

	afterNavigate(() => {
		isLoading.set(false);
	});
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
	<!-- 로딩 스피너 표시 -->
	{#if $isLoading}
		<div class="loading-overlay">
			<div class="spinner"></div>
		</div>
	{/if}

	<slot />
</main>

<style>
	/* 메인 콘텐츠 스타일 */
	main {
		padding-top: 55px;
		background-color: #f9f9f9;
	}

	.no-padding {
		padding-top: 0;
	}

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
		color: #fff;
		margin: 0;
		line-height: 1;
	}

	/* 햄버거 메뉴 버튼 스타일 */
	.navbar-burger {
		display: none;
		flex-direction: column;
		justify-content: space-around;
		cursor: pointer;
		background: none;
		border: none;
		padding: 0;
		width: 30px;
		height: 30px;
	}

	.navbar-burger span {
		display: block;
		width: 24px;
		height: 3px;
		background-color: #fff;
		border-radius: 2px;
		transition: all 0.3s ease-in-out;
	}

	/* 햄버거 메뉴 버튼 활성화 상태 (X자 모양) */
	.navbar-burger.is-active span:nth-child(1) {
		transform: rotate(45deg) translate(7px, 7px);
	}

	.navbar-burger.is-active span:nth-child(2) {
		opacity: 0;
	}

	.navbar-burger.is-active span:nth-child(3) {
		transform: rotate(-45deg) translate(7px, -7px);
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

	/* 반응형 스타일 (모바일) */
	@media (max-width: 768px) {
		.navbar {
			padding: 1rem;
		}

		.navbar-logo {
			flex-grow: 1;
		}

		.navbar-links {
			display: none;
			flex-direction: column;
			background-color: #1e1e1e;
			position: absolute;
			top: 60px;
			left: 50%;
			transform: translateX(-50%);
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

	/* 로딩 오버레이 스타일 */
	.loading-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 2000;
	}

	/* 스피너 스타일 */
	.spinner {
		width: 50px;
		height: 50px;
		border: 5px solid #ccc;
		border-top: 5px solid #2c3e50;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
</style>
