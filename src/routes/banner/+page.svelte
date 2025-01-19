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
	let banners: { id: number; imageUrl: string; title: string }[] = [];

	// 초기화 시 배너 리스트 가져오기
	onMount(async () => {
		const data = await getBanners();
		banners = data;
	});

	// 배너 삭제 함수
	const deleteBanner = async (id: number) => {
		const isConfirmed = confirm('정말로 삭제하시겠습니까?');
		if (!isConfirmed) return;

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
	let selectedFileName: string = '';
	let bannerTitle: string = '';
	let isModalOpen = false; // 모달창 상태 관리

	// 파일 선택 핸들러
	const handleFileChange = (event: Event) => {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files.length > 0) {
			selectedFile = input.files[0];
			selectedFileName = selectedFile.name;
		}
	};

	// 배너 업로드 함수
	const uploadBanner = async () => {
		if (!selectedFile) {
			alert('이미지를 선택하세요.');
			return;
		}
		if (!bannerTitle) {
			alert('제목을 입력하세요.');
			return;
		}

		// FormData 생성
		const formData = new FormData();
		formData.append('image', selectedFile);
		formData.append('title', bannerTitle);

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
		banners = [newBanner, ...banners];

		// 업로드 후 상태 초기화 및 모달 닫기
		selectedFile = null;
		selectedFileName = '';
		bannerTitle = '';
		isModalOpen = false;
	};
</script>

<main>
	<h1>Banners</h1>

	<div class="header-container">
		{#if banners.length > 0}
			<p>현재 배너 이미지 수 : {banners.length}</p>
		{:else}
			<p>No banners available.</p>
		{/if}
		<!-- 업로드 버튼 -->
		<button class="upload-banner-button" on:click={() => (isModalOpen = true)}>
			Upload New Banner
		</button>
	</div>

	{#if banners.length > 0}
		<div class="banner-list">
			{#each banners as banner}
				<div class="banner-card">
					<img src={banner.imageUrl} alt={`Banner ${banner.id}`} class="banner-image" />
					<div class="banner-info">
						<div class="banner-info-text">
							<p><strong>Title:</strong> {banner.title}</p>
							<p><strong>ID:</strong> {banner.id}</p>
						</div>
						<button class="delete-button" on:click={() => deleteBanner(banner.id)}> Delete </button>
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<!-- 모달창 -->
	{#if isModalOpen}
		<div class="modal">
			<div class="modal-content">
				<h2>Upload New Banner</h2>
				<input type="text" placeholder="Banner Title" bind:value={bannerTitle} />
				<div class="custom-file-input">
					<input type="file" id="file-input" accept="image/*" on:change={handleFileChange} hidden />
					<input
						type="text"
						placeholder="Choose an image..."
						bind:value={selectedFileName}
						readonly
					/>
					<label for="file-input" class="file-button">Choose File</label>
				</div>
				<div class="modal-buttons">
					<button class="upload-button" on:click={uploadBanner}> Upload </button>
					<button class="cancel-button" on:click={() => (isModalOpen = false)}> Cancel </button>
				</div>
			</div>
		</div>
	{/if}
</main>

<style>
	/* 메인 스타일 */
	main {
		padding: 1rem;
		text-align: center;
	}

	h1 {
		text-align: center;
		margin-bottom: 2rem;
	}

	.header-container {
		display: flex;
		justify-content: space-between;
		align-items: center;
		max-width: 800px;
		margin: 0 auto;
		margin-bottom: 1rem;
	}

	.header-container p {
		margin: 0;
		font-size: 18px;
		color: #333;
	}

	@media (max-width: 768px) {
		.header-container {
			flex-direction: column;
			gap: 1rem;
			text-align: center;
		}
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

	.banner-info-text {
		text-align: left;
	}

	.banner-info-text p {
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

	/* 업로드 버튼 스타일 */
	.upload-banner-button {
		background-color: #38a169;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 5px;
		cursor: pointer;
		font-size: 16px;
	}

	.upload-banner-button:hover {
		background-color: #2f855a;
	}

	.upload-banner-button:active {
		background-color: #276749;
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

	.modal-content {
		background-color: white;
		padding: 2rem;
		border-radius: 10px;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
		text-align: center;
		width: 400px;
		max-width: 90%;
	}

	.modal-content h2 {
		margin-top: 0;
	}

	.modal-buttons {
		display: flex;
		justify-content: space-between;
		margin-top: 1rem;
	}

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

	.cancel-button {
		background-color: #e53e3e;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 5px;
		cursor: pointer;
		font-size: 16px;
	}

	.cancel-button:hover {
		background-color: #c53030;
	}

	/* 텍스트 입력 스타일 */
	input[type='text'] {
		display: block;
		width: 100%;
		padding: 0.5rem;
		margin-bottom: 1rem;
		border: 1px solid #ccc;
		border-radius: 5px;
		box-sizing: border-box;
		font-size: 12px;
	}

	/* 파일 입력 스타일 */
	input[type='file'] {
		display: block;
		margin-bottom: 2rem;
	}

	/* 커스텀 파일 입력 스타일 */
	.custom-file-input {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.custom-file-input input[type='text'] {
		flex: 1;
		padding: 0.5rem;
		border: 1px solid #ccc;
		border-radius: 5px;
		color: #333;
		margin-bottom: 0;
	}

	.custom-file-input .file-button {
		background-color: #3182ce;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 5px;
		cursor: pointer;
		text-align: center;
		font-size: 12px;
	}

	.custom-file-input .file-button:hover {
		background-color: #2b6cb0;
	}

	.custom-file-input .file-button:active {
		background-color: #2c5282;
	}

	.custom-file-input input[type='file'] {
		display: none;
	}
</style>
