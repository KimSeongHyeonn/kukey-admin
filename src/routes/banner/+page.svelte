<script lang="ts">
	import { get } from 'svelte/store';
	import { apiUrl } from '../../store/url';
	import { fetchWithAuth } from '$lib/utils';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	// API URL 가져오기
	const url = get(apiUrl);

	// 배너 리스트 가져오기
	const getBanners = async () => {
		const data = await fetchWithAuth(url + 'banner', {
			method: 'GET'
		});
		if (!data) {
			goto('/');
			alert('로그인이 필요합니다.');
		}
		return data;
	};

	// 배너 리스트
	let banners: { id: number; imageUrl: string }[] = [];

	// 초기화 시 배너 리스트 가져오기
	onMount(async () => {
		const data = await getBanners();
		banners = data;
	});

	// 배너 삭제 함수
	const deleteBanner = async (id: number) => {
		const response = await fetchWithAuth(url + `banner/${id}`, {
			method: 'DELETE'
		});
		if (!response) {
			goto('/');
			alert('로그인이 필요합니다.');
		}
		banners = banners.filter((banner) => banner.id !== id);
		alert('배너가 삭제되었습니다.');
	};

	// 이미지 파일 상태 관리
	let selectedFile: File | null = null;

	// 파일 선택 핸들러
	const handleFileChange = (event: Event) => {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files.length > 0) {
			selectedFile = input.files[0];
		}
	};

	// 배너 업로드 함수
	const uploadBanner = async () => {
		if (!selectedFile) {
			alert('이미지를 선택하세요.');
			return;
		}

		// FormData 생성
		const formData = new FormData();
		formData.append('image', selectedFile);

		// POST 요청
		const data = await fetchWithAuth(url + 'banner', {
			method: 'POST',
			body: formData
		});

		if (!data) {
			goto('/');
			alert('로그인이 필요합니다.');
		}
		alert('배너가 추가되었습니다.');
		const newBanner = data;
		banners = [...banners, newBanner];

		// 업로드 후 상태 초기화
		selectedFile = null;
		(document.getElementById('file-input') as HTMLInputElement).value = '';
	};
</script>

<main>
	<h1>Banners</h1>

	<!-- 이미지 업로드 섹션 -->
	<div class="upload-section">
		<h2>Upload New Banner</h2>
		<input type="file" id="file-input" accept="image/*" on:change={handleFileChange} />
		<button class="upload-button" on:click={uploadBanner}> Upload </button>
	</div>

	{#if banners.length > 0}
		<div class="banner-list">
			{#each banners as banner}
				<div class="banner-card">
					<img src={banner.imageUrl} alt={`Banner ${banner.id}`} class="banner-image" />
					<div class="banner-info">
						<p><strong>ID:</strong> {banner.id}</p>
						<button class="delete-button" on:click={() => deleteBanner(banner.id)}> Delete </button>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<p>No banners available.</p>
	{/if}
</main>

<style>
	/* 메인 스타일 */
	main {
		padding: 1rem;
		text-align: center;
	}

	h1 {
		margin-bottom: 2rem;
	}

	/* 배너 목록 스타일 */
	.banner-list {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	/* 배너 카드 스타일 */
	.banner-card {
		position: relative;
		background-color: white;
		border-radius: 12px;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
		overflow: hidden;
		max-width: 800px;
		margin: 0 auto;
	}

	/* 배너 이미지 스타일 */
	.banner-image {
		width: 100%;
		height: auto;
		display: block;
		border-radius: 12px 12px 0 0;
	}

	/* 배너 정보 스타일 */
	.banner-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
	}

	.banner-info p {
		margin: 0;
		font-size: 16px;
		color: #333;
	}

	/* 삭제 버튼 스타일 */
	.delete-button {
		background-color: #e53e3e;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 5px;
		cursor: pointer;
		font-size: 16px;
	}

	.delete-button:hover {
		background-color: #c53030;
	}

	.delete-button:active {
		background-color: #9b2c2c;
	}

	/* 업로드 섹션 스타일 */
	.upload-section {
		margin-top: 2rem;
		background-color: #f9f9f9;
		padding: 1rem;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		max-width: 800px;
		margin: 2rem auto;
	}

	.upload-section h2 {
		margin-bottom: 1rem;
	}

	/* 파일 입력 스타일 */
	input[type='file'] {
		display: block;
		margin-bottom: 1rem;
	}

	/* 업로드 버튼 스타일 */
	.upload-button {
		background-color: #3182ce;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 5px;
		cursor: pointer;
		font-size: 16px;
	}

	.upload-button:hover {
		background-color: #2b6cb0;
	}

	.upload-button:active {
		background-color: #2c5282;
	}
</style>
