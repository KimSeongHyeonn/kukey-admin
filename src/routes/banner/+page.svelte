<script lang="ts">
	import { get } from 'svelte/store';
	import { onMount } from 'svelte';
	import { apiUrl } from '$lib/stores/url';
	import { fetchWithAuth } from '$lib/utils/fetch';
	import Button from '$lib/components/Button.svelte';
	import DarkBackground from '$lib/components/DarkBackground.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import Input from '$lib/components/Input.svelte';

	// API URL 가져오기
	const url = get(apiUrl);

	// 배너 리스트
	let banners: { id: number; imageUrl: string; title: string; link: string | null }[] = [];

	// 배너 리스트 가져오기
	const getBanners = async () => {
		const data = await fetchWithAuth(url + 'banner', {
			method: 'GET'
		});

		return data;
	};

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

		banners = banners.filter((banner) => banner.id !== id);
		alert('배너가 삭제되었습니다.');
	};

	// 이미지 파일 상태 관리
	let selectedFile: File | null = null;
	let selectedFileName: string = '';
	let bannerTitle: string = '';
	let bannerLink: string = '';
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
		if (bannerLink) {
			formData.append('link', bannerLink);
		}

		// POST 요청
		const data = await fetchWithAuth(url + 'banner', {
			method: 'POST',
			body: formData
		});

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
	<h1 class="title">Banners</h1>

	<div class="header-container">
		{#if banners.length > 0}
			<p class="description">현재 배너 이미지 수 : {banners.length}</p>
		{:else}
			<p class="description">No banners available.</p>
		{/if}
		<!-- 업로드 버튼 -->
		<div class="add-button">
			<Button width="100%" onClick={() => (isModalOpen = true)}>Upload New Banner</Button>
		</div>
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
							<p><strong>Link:</strong> {banner.link ?? 'no link available'}</p>
						</div>
						<Button type="negative" onClick={() => deleteBanner(banner.id)}>Delete</Button>
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<!-- 모달창 -->
	<DarkBackground isOpen={isModalOpen}>
		<Modal title="Upload New Banner">
			<Input type="text" name="Title" bind:content={bannerTitle} />
			<Input type="text" name="Link" bind:content={bannerLink} />
			<Input type="image" name="Image" onChange={handleFileChange} />
			<div class="modal-buttons">
				<Button onClick={uploadBanner}>Upload</Button>
				<Button type="negative" onClick={() => (isModalOpen = false)}>Cancel</Button>
			</div>
		</Modal>
	</DarkBackground>
</main>

<style>
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

		.add-button {
			width: 100%;
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

	.modal-buttons {
		display: flex;
		justify-content: space-between;
		margin-top: 1rem;
	}
</style>
