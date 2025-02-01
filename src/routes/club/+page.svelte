<script lang="ts">
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { fetchWithAuth, replaceSpecialCharacters } from '$lib/utils/fetch';
	import { apiUrl } from '$lib/stores/url';
	import Button from '$lib/components/Button.svelte';
	import DarkBackground from '$lib/components/DarkBackground.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import Input from '$lib/components/Input.svelte';

	const category = [
		'전체 카테고리',
		'Performing Arts',
		'Academic Research',
		'Sports',
		'Religious',
		'Exhibition & Creative Writing',
		'Humanities',
		'Living Culture',
		'Social',
		'Instrumental Arts'
	];

	const newCategory = category.filter((item) => item !== '전체 카테고리');

	type CategoryType = (typeof category)[number];

	const url = get(apiUrl);

	let keyword = '';
	let selectedCategory: CategoryType = '전체 카테고리';

	let isAddModalOpen = false;
	let newClub = {
		name: '',
		category: 'Performing Arts' as CategoryType,
		summary: '',
		regularMeeting: '',
		recruitmentPeriod: '',
		instagramLink: '',
		youtubeLink: '',
		description: '',
		image: null as File | null
	};

	let isEditModalOpen = false;
	let selectedClub = {
		clubId: 0,
		name: '',
		category: 'Performing Arts' as CategoryType,
		summary: '',
		regularMeeting: '',
		recruitmentPeriod: '',
		instagramLink: '',
		youtubeLink: '',
		description: '',
		image: null as File | null
	};

	const getClub = async (keyword: string, category: CategoryType) => {
		let finalUrl = url + 'club?isLogin=false';
		if (keyword) finalUrl += `&keyword=${replaceSpecialCharacters(keyword)}`;
		if (category !== '전체 카테고리') finalUrl += `&category=${replaceSpecialCharacters(category)}`;

		const data = await fetchWithAuth(finalUrl, {
			method: 'GET'
		});

		return data;
	};

	let clubs: {
		clubId: number;
		name: string;
		category: string;
		summary: string;
		regularMeeting: string;
		recruitmentPeriod: string;
		description: string;
		imageUrl: string;
		likeCount: number;
		instagramLink: string;
		youtubeLink: string;
		isLiked: boolean;
	}[] = [];

	let isExpanded: { [key: number]: boolean } = {};

	onMount(async () => {
		await loadClubData();
	});

	const loadClubData = async () => {
		if (keyword && keyword.length < 2) {
			alert('키워드는 2글자 이상 입력해주세요.');
			return;
		}
		const data = await getClub(keyword, selectedCategory);
		clubs = data;
		isExpanded = {};
		clubs.forEach((club) => {
			isExpanded[club.clubId] = false;
		});
	};

	const toggleDetails = (clubId: number) => {
		isExpanded[clubId] = !isExpanded[clubId];
	};

	const handleKeyPress = (event: KeyboardEvent) => {
		if (event.key === 'Enter') {
			loadClubData();
		}
	};

	const openAddModal = () => {
		isAddModalOpen = true;
	};

	const closeAddModal = () => {
		isAddModalOpen = false;
		newClub = {
			name: '',
			category: 'Performing Arts',
			summary: '',
			regularMeeting: '',
			recruitmentPeriod: '',
			instagramLink: '',
			youtubeLink: '',
			description: '',
			image: null
		};
	};

	const handleFileChange = (event: Event) => {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files.length > 0) {
			newClub.image = input.files[0];
			selectedClub.image = input.files[0];
		}
	};

	const addNewClub = async () => {
		if (!newClub.name) {
			alert('이름을 입력하세요.');
			return;
		}
		if (!newClub.category) {
			alert('카테고리를 선택하세요.');
			return;
		}
		if (!newClub.summary) {
			alert('요약을 입력하세요.');
			return;
		}
		if (!newClub.regularMeeting) {
			alert('정기 모임을 입력하세요.');
			return;
		}
		if (!newClub.recruitmentPeriod) {
			alert('모집 기간을 입력하세요.');
			return;
		}
		if (!newClub.description) {
			alert('설명을 입력하세요.');
			return;
		}
		if (!newClub.image) {
			alert('이미지를 선택하세요.');
			return;
		}

		const formData = new FormData();
		formData.append('name', newClub.name);
		formData.append('category', newClub.category);
		formData.append('summary', newClub.summary);
		formData.append('regularMeeting', newClub.regularMeeting);
		formData.append('recruitmentPeriod', newClub.recruitmentPeriod);
		formData.append('description', newClub.description);
		if (newClub.instagramLink) formData.append('instagramLink', newClub.instagramLink);
		if (newClub.youtubeLink) formData.append('youtubeLink', newClub.youtubeLink);
		formData.append('clubImage', newClub.image);

		const response = await fetchWithAuth(url + 'club', {
			method: 'POST',
			body: formData
		});

		alert('클럽이 추가되었습니다.');
		closeAddModal();
		await loadClubData();
	};

	const openEditModal = (club: any) => {
		selectedClub = { ...club };
		isEditModalOpen = true;
	};

	const closeEditModal = () => {
		isEditModalOpen = false;
		selectedClub = {
			clubId: 0,
			name: '',
			category: 'Performing Arts',
			summary: '',
			regularMeeting: '',
			recruitmentPeriod: '',
			instagramLink: '',
			youtubeLink: '',
			description: '',
			image: null
		};
	};

	const updateClub = async () => {
		if (!selectedClub.name) {
			alert('이름을 입력하세요.');
			return;
		}
		if (!selectedClub.category) {
			alert('카테고리를 선택하세요.');
			return;
		}
		if (!selectedClub.summary) {
			alert('요약을 입력하세요.');
			return;
		}
		if (!selectedClub.regularMeeting) {
			alert('정기 모임을 입력하세요.');
			return;
		}
		if (!selectedClub.recruitmentPeriod) {
			alert('모집 기간을 입력하세요.');
			return;
		}
		if (!selectedClub.description) {
			alert('설명을 입력하세요.');
			return;
		}

		const formData = new FormData();
		formData.append('name', selectedClub.name);
		formData.append('category', selectedClub.category);
		formData.append('summary', selectedClub.summary);
		formData.append('regularMeeting', selectedClub.regularMeeting);
		formData.append('recruitmentPeriod', selectedClub.recruitmentPeriod);
		formData.append('description', selectedClub.description);
		if (selectedClub.instagramLink) formData.append('instagramLink', selectedClub.instagramLink);
		if (selectedClub.youtubeLink) formData.append('youtubeLink', selectedClub.youtubeLink);
		if (selectedClub.image) formData.append('clubImage', selectedClub.image);

		const response = await fetchWithAuth(url + 'club/' + selectedClub.clubId, {
			method: 'PATCH',
			body: formData
		});

		alert('클럽이 수정되었습니다.');
		closeEditModal();
		await loadClubData();
	};

	const deleteClub = async (clubId: number) => {
		if (!confirm('정말로 삭제하시겠습니까?')) return;
		const response = await fetchWithAuth(url + 'club/' + clubId, {
			method: 'DELETE'
		});

		alert('클럽이 삭제되었습니다.');
		await loadClubData();
	};
</script>

<main>
	<h1 class="title">Clubs</h1>

	<div class="top-container">
		<!-- 카테고리와 검색어 입력 섹션 -->
		<div class="filter-container">
			<div class="select">
				<label for="category-select">Category:</label>
				<select id="category-select" bind:value={selectedCategory} on:change={loadClubData}>
					{#each category as item}
						<option value={item}>{item}</option>
					{/each}
				</select>
			</div>

			<div class="search">
				<label for="keyword-input">Keyword:</label>
				<input
					id="keyword-input"
					type="text"
					placeholder="Enter keyword"
					bind:value={keyword}
					on:keypress={handleKeyPress}
				/>
				<button class="search-button" on:click={loadClubData} aria-label="Search">
					<i class="fa-solid fa-magnifying-glass"></i>
				</button>
			</div>
		</div>
		<!-- 클럽 추가 버튼 -->
		<div class="add-button-container">
			<div class="add-button">
				<Button width="100%" onClick={openAddModal}>Add New Club</Button>
			</div>
		</div>
	</div>

	<!-- 클럽 목록 -->
	<div class="club-list">
		{#each clubs as club}
			<div class="club-card">
				<div class="club-content">
					<div class="club-basic-info">
						<h2>{club.name}</h2>
						<p><strong>Category:</strong> {club.category}</p>
						<p><strong>Summary:</strong> {club.summary}</p>
						<p><strong>Regular Meeting:</strong> {club.regularMeeting}</p>
						<p><strong>Recruitment Period:</strong> {club.recruitmentPeriod}</p>
						<div class="detail-button-container">
							<Button onClick={() => toggleDetails(club.clubId)}>
								{isExpanded[club.clubId] ? 'Hide Details' : 'Show Details'}
							</Button>
						</div>
					</div>
					<img src={club.imageUrl} alt="{club.name} Image" class="club-image" />
				</div>

				{#if isExpanded[club.clubId]}
					<div class="club-extra-info">
						<div class="extra-info-content">
							<div class="extra-details">
								<p><strong>Description:</strong> {club.description}</p>
								<p>
									<strong>Instagram:</strong>
									{#if club.instagramLink}
										<a class="link" href={club.instagramLink} target="_blank">Visit Instagram</a>
									{:else}
										Not Available
									{/if}
								</p>
								<p>
									<strong>YouTube:</strong>
									{#if club.youtubeLink}
										<a class="link" href={club.youtubeLink} target="_blank">Visit YouTube</a>
									{:else}
										Not Available
									{/if}
								</p>
							</div>
							<div class="club-actions">
								<div class="club-buttons">
									<Button type="secondary" onClick={() => openEditModal(club)}>Edit</Button>
									<Button type="negative" onClick={() => deleteClub(club.clubId)}>Delete</Button>
								</div>
							</div>
						</div>
					</div>
				{/if}
			</div>
		{/each}
	</div>

	<!-- 클럽 추가 모달 -->
	<DarkBackground isOpen={isAddModalOpen}>
		<Modal title="Add New Club">
			<div class="modal-inputs">
				<Input type="text" name="Name" bind:content={newClub.name} />
				<Input
					type="category"
					name="Category"
					bind:content={newClub.category}
					options={newCategory}
				/>
				<Input type="text" name="Summary" bind:content={newClub.summary} />
				<Input type="text" name="Regular Meeting" bind:content={newClub.regularMeeting} />
				<Input type="text" name="Recruitment Period" bind:content={newClub.recruitmentPeriod} />
				<Input type="text" name="Instagram Link" bind:content={newClub.instagramLink} />
				<Input type="text" name="YouTube Link" bind:content={newClub.youtubeLink} />
				<Input type="textarea" name="Description" bind:content={newClub.description} />
				<Input type="image" name="Image" onChange={handleFileChange} />
			</div>
			<div class="modal-buttons">
				<Button onClick={addNewClub}>Save</Button>
				<Button type="negative" onClick={closeAddModal}>Cancel</Button>
			</div>
		</Modal>
	</DarkBackground>

	<!-- 클럽 수정 모달 -->
	<DarkBackground isOpen={isEditModalOpen}>
		<Modal title="Edit Club">
			<div class="modal-inputs">
				<Input type="text" name="Name" bind:content={selectedClub.name} />
				<Input
					type="category"
					name="Category"
					bind:content={selectedClub.category}
					options={newCategory}
				/>
				<Input type="text" name="Summary" bind:content={selectedClub.summary} />
				<Input type="text" name="Regular Meeting" bind:content={selectedClub.regularMeeting} />
				<Input
					type="text"
					name="Recruitment Period"
					bind:content={selectedClub.recruitmentPeriod}
				/>
				<Input type="text" name="Instagram Link" bind:content={selectedClub.instagramLink} />
				<Input type="text" name="YouTube Link" bind:content={selectedClub.youtubeLink} />
				<Input type="textarea" name="Description" bind:content={selectedClub.description} />
				<Input type="image" name="Image" onChange={handleFileChange} />
			</div>
			<div class="modal-buttons">
				<Button onClick={updateClub}>Save</Button>
				<Button type="negative" onClick={closeEditModal}>Cancel</Button>
			</div>
		</Modal>
	</DarkBackground>
</main>

<style>
	.top-container {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.filter-container {
		width: 50%;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.select,
	.search {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
	}

	.filter-container label {
		font-weight: bold;
		color: #333;
	}

	.filter-container select,
	.filter-container input {
		padding: 0.5rem;
		border: 1px solid #ccc;
		border-radius: 5px;
		font-size: 14px;
		flex: 1;
	}

	.search-button {
		background-color: transparent;
		border: none;
		cursor: pointer;
		font-size: 18px;
		color: #666;
		padding: 0;
		outline: none;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
	}

	.search-button:hover {
		color: #333;
	}

	.add-button-container {
		display: flex;
		justify-content: flex-end;
		margin-top: 2rem;
		width: 50%;
	}

	@media (max-width: 768px) {
		.top-container {
			flex-direction: column;
			align-items: flex-start;
			margin-bottom: 1rem;
		}

		.filter-container {
			width: 100%;
		}

		.add-button-container {
			margin-top: 0rem;
			width: 100%;
		}

		.add-button {
			width: 100%;
		}
	}

	/* 클럽 카드 스타일 */
	.club-list {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.club-card {
		display: flex;
		flex-direction: column;
		border: 1px solid #ccc;
		border-radius: 8px;
		padding: 1rem;
		background-color: #f9f9f9;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.club-content {
		display: flex;
		gap: 1rem;
		align-items: stretch;
	}

	.club-image {
		flex: 1;
		width: 33%;
		height: auto;
		border-radius: 8px;
		object-fit: cover;
	}

	.club-basic-info {
		flex: 2;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	.club-basic-info h2 {
		margin: 0 0 0.5rem;
		color: #333;
	}

	.club-basic-info p {
		margin: 0.3rem 0;
		color: #555;
	}

	.detail-button-container {
		margin-top: auto;
	}

	.club-extra-info {
		margin-top: 1rem;
		border-top: 1px solid #ddd;
	}

	.extra-info-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 2rem;
	}

	.extra-details {
		flex: 2;
	}

	.extra-details p {
		margin: 0.5rem 0;
	}

	.link {
		color: #3182ce;
	}

	.club-actions {
		align-self: flex-end;
		display: flex;
		gap: 0.5rem;
	}

	.club-buttons {
		display: flex;
		gap: 0.5rem;
	}

	@media (max-width: 768px) {
		.extra-info-content {
			flex-direction: column;
			align-items: flex-start;
			gap: 1rem;
		}

		.club-actions {
			align-self: flex-start;
			width: 100%;
		}
	}

	.modal-inputs {
		overflow-y: auto;
		max-height: 60vh;
		padding-right: 10px;
	}

	.modal-buttons {
		display: flex;
		justify-content: space-between;
		margin-top: 1rem;
	}
</style>
