<script lang="ts">
	import { get, writable } from 'svelte/store';
	import { onMount } from 'svelte';
	import { fetchWithAuth } from '$lib/utils/fetch';
	import Button from '$lib/components/Button.svelte';
	import DarkBackground from '$lib/components/DarkBackground.svelte';
	import { apiUrl } from '$lib/stores/url';

	const url = get(apiUrl);

	let requests: {
		id: number;
		imgDir: string;
		studentNumber: number;
		lastUpdated: Date;
	}[] = [];

	const getRequests = async () => {
		const data = await fetchWithAuth(url + 'auth/admin/request', {
			method: 'GET'
		});

		return data;
	};

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

		if (data.success) {
			requests = requests.filter((request) => request.id !== id);
			alert(isAllow ? '인증이 완료되었습니다.' : '인증이 거절되었습니다.');
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
	<h1 class="title">Authentication request</h1>

	{#if requests.length > 0}
		<p class="description">남은 인증 요청 수 : {requests.length}</p>
		<div class="card-container">
			{#each requests as request}
				<div class="card">
					<button
						class="image-button"
						on:click={() => handleImageClick(request.imgDir)}
						aria-label="View image"
					>
						<img class="card-image" src={request.imgDir} alt="Request" />
					</button>
					<p><strong>ID:</strong> {request.id}</p>
					<p><strong>Student Number:</strong> {request.studentNumber}</p>
					<p><strong>Last Updated:</strong> {new Date(request.lastUpdated).toLocaleString()}</p>
					<div class="buttons">
						<Button type="primary" onClick={() => handleButtonClick(request.id, true)}>
							Accept
						</Button>
						<Button type="negative" onClick={() => handleButtonClick(request.id, false)}>
							Deny
						</Button>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<p class="description">No authentication requests available.</p>
	{/if}

	<DarkBackground isOpen={$isModalOpen}>
		<button class="image-button" on:click={closeModal} aria-label="Close image">
			<img class="modal-image" src={$modalImage} alt="Modal" />
		</button>
	</DarkBackground>
</main>

<style>
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
		display: flex;
		justify-content: center;
	}

	.card-image {
		width: 100%;
		height: auto;
		border-radius: 8px;
	}

	.card-image:hover {
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

	.modal-image {
		max-width: 90%;
		max-height: 90%;
		border-radius: 10px;
	}
</style>
