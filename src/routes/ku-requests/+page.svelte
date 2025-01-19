<script lang="ts">
	import { get, writable } from 'svelte/store';
	import { apiUrl } from '../../store/url';
	import { fetchWithAuth } from '$lib/utils';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	const url = get(apiUrl);
	const getRequests = async () => {
		const data = await fetchWithAuth(url + 'auth/admin/request', {
			method: 'GET'
		});
		if (!data) {
			goto('/');
			alert('로그인이 필요합니다.');
		}
		return data;
	};

	let requests: {
		id: number;
		imgDir: string;
		studentNumber: number;
		lastUpdated: Date;
	}[] = [];

	onMount(async () => {
		const data = await getRequests();
		requests = data;
	});

	const handleButtonClick = async (id: number, isAllow: boolean) => {
		const reqJson = {
			verify: isAllow
		};
		const data: { success: boolean } = await fetchWithAuth(url + 'auth/admin/request/' + id, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(reqJson)
		});
		if (!data) {
			goto('/');
			alert('로그인이 필요합니다.');
		}
		if (data.success) {
			requests = requests.filter((request) => request.id !== id);
		}
	};

	// 모달 상태 관리
	const isModalOpen = writable(false);
	const modalImage = writable('');

	const handleImageClick = (imgDir: string) => {
		modalImage.set(imgDir);
		isModalOpen.set(true);
	};

	const closeModal = () => {
		isModalOpen.set(false);
	};
</script>

<main>
	<h1>Authentication request</h1>

	{#if requests.length > 0}
		<p>남은 인증 요청 수 : {requests.length}</p>
		<div class="card-container">
			{#each requests as request}
				<div class="card">
					<button
						class="image-button"
						type="button"
						on:click={() => handleImageClick(request.imgDir)}
						aria-label="View image"
					>
						<img src={request.imgDir} alt="Request" />
					</button>
					<p><strong>ID:</strong> {request.id}</p>
					<p><strong>Student Number:</strong> {request.studentNumber}</p>
					<p><strong>Last Updated:</strong> {new Date(request.lastUpdated).toLocaleString()}</p>
					<div class="buttons">
						<button on:click={() => handleButtonClick(request.id, true)}>Accept</button>
						<button on:click={() => handleButtonClick(request.id, false)}>Deny</button>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<p class="no-requests-message">No authentication requests available.</p>
	{/if}

	{#if $isModalOpen}
		<div
			class="modal"
			on:click={closeModal}
			role="button"
			tabindex="0"
			aria-label="Close Modal"
			on:keydown={(e) => e.key === 'Escape' && closeModal()}
		>
			<img src={$modalImage} alt="Modal" />
		</div>
	{/if}
</main>

<style>
	/* 메인 스타일 */
	main {
		padding: 1rem;
	}

	h1 {
		text-align: center;
		margin-bottom: 2rem;
	}

	p {
		text-align: center;
		margin-bottom: 1rem;
	}

	/* 카드 컨테이너 */
	.card-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rem;
	}

	/* 카드 스타일 */
	.card {
		background-color: white;
		padding: 1.5rem;
		border-radius: 10px;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
		text-align: center;
		width: 100%;
		max-width: 800px;
		margin: 0 1rem;
		box-sizing: border-box;
	}

	.image-button {
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
	}

	.image-button img {
		width: 100%;
		height: auto;
		border-radius: 8px;
	}

	.image-button img:hover {
		transform: scale(1.05);
		transition: transform 0.2s ease-in-out;
	}

	.card p {
		margin: 0.5rem 0;
	}

	/* 버튼 스타일 */
	.buttons {
		margin-top: 1rem;
		display: flex;
		justify-content: center;
		gap: 1rem;
	}

	/* Accept 버튼 스타일 */
	.buttons button:nth-child(1) {
		background-color: #38a169;
	}

	.buttons button:nth-child(1):hover {
		background-color: #2f855a;
	}

	.buttons button:nth-child(1):active {
		background-color: #276749;
	}

	/* Deny 버튼 스타일 */
	.buttons button:nth-child(2) {
		background-color: #e53e3e;
	}

	.buttons button:nth-child(2):hover {
		background-color: #c53030;
	}

	.buttons button:nth-child(2):active {
		background-color: #9b2c2c;
	}

	button {
		padding: 0.8rem 1.2rem;
		color: white;
		border: none;
		border-radius: 5px;
		cursor: pointer;
		font-size: 14px;
	}

	.no-requests-message {
		text-align: center;
		font-size: 18px;
		color: #666;
		margin-top: 2rem;
	}

	/* 모달 스타일 */
	.modal {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.8);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
	}

	.modal img {
		max-width: 90%;
		max-height: 90%;
		border-radius: 10px;
	}
</style>
