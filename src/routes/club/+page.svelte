<script lang="ts">
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { apiUrl } from '../../store/url';
	import { fetchWithAuth } from '$lib/utils';
	import { goto } from '$app/navigation';

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
		if (keyword) finalUrl += `&keyword=${keyword}`;
		if (category !== '전체 카테고리') finalUrl += `&category=${category}`;

		const data = await fetchWithAuth(finalUrl, {
			method: 'GET'
		});
		if (!data) {
			goto('/');
			alert('로그인이 필요합니다.');
		}
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
		if (!response) {
			goto('/');
			alert('로그인이 필요합니다.');
		}
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
		if (!response) {
			goto('/');
			alert('로그인이 필요합니다.');
		}
		alert('클럽이 수정되었습니다.');
		closeEditModal();
		await loadClubData();
	};

	const deleteClub = async (clubId: number) => {
		if (!confirm('정말로 삭제하시겠습니까?')) return;
		const response = await fetchWithAuth(url + 'club/' + clubId, {
			method: 'DELETE'
		});
		if (!response) {
			goto('/');
			alert('로그인이 필요합니다.');
		}
		alert('클럽이 삭제되었습니다.');
		await loadClubData();
	};
</script>

<main>
	<h1>Clubs</h1>

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
		<div class="add-club-button-container">
			<button class="add-club-button" on:click={openAddModal}>Add New Club</button>
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
						<div class="button-container">
							<button on:click={() => toggleDetails(club.clubId)}>
								{isExpanded[club.clubId] ? 'Hide Details' : 'Show Details'}
							</button>
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
										<a href={'//' + club.instagramLink} target="_blank">Visit Instagram</a>
									{:else}
										Not Available
									{/if}
								</p>
								<p>
									<strong>YouTube:</strong>
									{#if club.youtubeLink}
										<a href={'//' + club.youtubeLink} target="_blank">Visit YouTube</a>
									{:else}
										Not Available
									{/if}
								</p>
							</div>
							<div class="club-actions">
								<div class="club-buttons">
									<button class="edit-button" on:click={() => openEditModal(club)}>Edit</button>
									<button class="delete-button" on:click={() => deleteClub(club.clubId)}
										>Delete</button
									>
								</div>
							</div>
						</div>
					</div>
				{/if}
			</div>
		{/each}
	</div>

	<!-- 클럽 추가 모달 -->
	{#if isAddModalOpen}
		<div class="modal">
			<div class="modal-content">
				<h2>Add New Club</h2>

				<div class="modal-input">
					<div class="form-group">
						<label for="name">Name:</label>
						<input id="name" type="text" bind:value={newClub.name} placeholder="Name" />
					</div>

					<div class="form-group">
						<label for="category">Category:</label>
						<select id="category" bind:value={newClub.category} placeholder="Category">
							{#each newCategory as item}
								<option value={item}>{item}</option>
							{/each}
						</select>
					</div>

					<div class="form-group">
						<label for="summary">Summary:</label>
						<input id="summary" type="text" bind:value={newClub.summary} placeholder="Summary" />
					</div>

					<div class="form-group">
						<label for="regularMeeting">Regular Meeting:</label>
						<input
							id="regularMeeting"
							type="text"
							bind:value={newClub.regularMeeting}
							placeholder="Regular meeting"
						/>
					</div>

					<div class="form-group">
						<label for="recruitmentPeriod">Recruitment Period:</label>
						<input
							id="recruitmentPeriod"
							type="text"
							bind:value={newClub.recruitmentPeriod}
							placeholder="Recruitment period"
						/>
					</div>

					<div class="form-group">
						<label for="instagramLink">Instagram Link:</label>
						<input
							id="instagramLink"
							type="text"
							bind:value={newClub.instagramLink}
							placeholder="Instagram link"
						/>
					</div>

					<div class="form-group">
						<label for="youtubeLink">YouTube Link:</label>
						<input
							id="youtubeLink"
							type="text"
							bind:value={newClub.youtubeLink}
							placeholder="YouTube link"
						/>
					</div>

					<div class="form-group">
						<label for="description">Description:</label>
						<textarea id="description" bind:value={newClub.description} placeholder="Description"
						></textarea>
					</div>

					<div class="form-group">
						<label for="image">Image:</label>
						<input
							id="image"
							type="file"
							accept="image/*"
							on:change={handleFileChange}
							placeholder="Image"
						/>
					</div>
				</div>

				<div class="modal-buttons">
					<button on:click={addNewClub}>Save</button>
					<button on:click={closeAddModal}>Cancel</button>
				</div>
			</div>
		</div>
	{/if}

	{#if isEditModalOpen}
		<div class="modal">
			<div class="modal-content">
				<h2>Edit Club</h2>
				<div class="modal-input">
					<div class="form-group">
						<label for="edit-name">Name:</label>
						<input id="edit-name" type="text" bind:value={selectedClub.name} />
					</div>

					<div class="form-group">
						<label for="edit-category">Category:</label>
						<select id="edit-category" bind:value={selectedClub.category}>
							{#each newCategory as item}
								<option value={item}>{item}</option>
							{/each}
						</select>
					</div>

					<div class="form-group">
						<label for="edit-summary">Summary:</label>
						<input id="edit-summary" type="text" bind:value={selectedClub.summary} />
					</div>

					<div class="form-group">
						<label for="edit-regularMeeting">Regular Meeting:</label>
						<input id="edit-regularMeeting" type="text" bind:value={selectedClub.regularMeeting} />
					</div>

					<div class="form-group">
						<label for="edit-recruitmentPeriod">Recruitment Period:</label>
						<input
							id="edit-recruitmentPeriod"
							type="text"
							bind:value={selectedClub.recruitmentPeriod}
						/>
					</div>

					<div class="form-group">
						<label for="edit-instagramLink">Instagram Link:</label>
						<input id="edit-instagramLink" type="text" bind:value={selectedClub.instagramLink} />
					</div>

					<div class="form-group">
						<label for="edit-youtubeLink">YouTube Link:</label>
						<input id="edit-youtubeLink" type="text" bind:value={selectedClub.youtubeLink} />
					</div>

					<div class="form-group">
						<label for="edit-description">Description:</label>
						<textarea id="edit-description" bind:value={selectedClub.description}></textarea>
					</div>

					<div class="form-group">
						<label for="edit-image">Image:</label>
						<input id="edit-image" type="file" accept="image/*" on:change={handleFileChange} />
					</div>
				</div>

				<div class="modal-buttons">
					<button on:click={updateClub}>Update</button>
					<button on:click={closeEditModal}>Cancel</button>
				</div>
			</div>
		</div>
	{/if}
</main>

<style>
	/* 메인 스타일 */
	main {
		padding: 1rem;
		max-width: 800px;
		margin: 0 auto;
	}

	h1 {
		text-align: center;
		margin-bottom: 2rem;
	}

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

	.add-club-button-container {
		display: flex;
		justify-content: flex-end;
		margin-top: 2rem;
		width: 50%;
	}

	.add-club-button {
		background-color: #3182ce;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 5px;
		cursor: pointer;
		font-size: 16px;
	}

	.add-club-button:hover {
		background-color: #2b6cb0;
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

		.add-club-button-container {
			justify-content: flex-start;
			margin-top: 0rem;
			width: 100%;
		}

		.add-club-button {
			width: 100%;
			text-align: center;
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

	.button-container {
		margin-top: auto;
	}

	.club-basic-info button {
		margin-top: 0.5rem;
		background-color: #3182ce;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 5px;
		cursor: pointer;
		font-size: 14px;
	}

	.club-basic-info button:hover {
		background-color: #2b6cb0;
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

	.club-actions {
		align-self: flex-end;
		display: flex;
		gap: 0.5rem;
	}

	.club-buttons {
		display: flex;
		gap: 0.5rem;
	}

	/* 버튼 스타일 */
	.edit-button,
	.delete-button {
		padding: 0.5rem 1rem;
		border-radius: 5px;
		font-size: 14px;
		cursor: pointer;
		border: none;
		color: white;
	}

	.edit-button {
		background-color: #3182ce;
	}

	.edit-button:hover {
		background-color: #2b6cb0;
	}

	.delete-button {
		background-color: #e53e3e;
	}

	.delete-button:hover {
		background-color: #c53030;
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
		background: white;
		padding: 2rem;
		border-radius: 10px;
		width: 400px;
		max-width: 90%;
		max-height: 90vh;
		overflow: hidden;
	}

	.modal-input {
		overflow-y: auto;
		max-height: 60vh;
		padding-right: 10px;
	}

	.modal-content h2 {
		margin-top: 0;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: bold;
	}

	.form-group input,
	.form-group textarea,
	.form-group select {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid #ccc;
		border-radius: 5px;
		box-sizing: border-box;
		font-family: 'Noto Sans KR', 'Roboto', sans-serif;
	}

	.form-group textarea {
		resize: none;
		height: 100px;
	}

	.modal-buttons {
		display: flex;
		justify-content: space-between;
		margin-top: 1rem;
	}

	.modal-buttons button {
		background: #3182ce;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 5px;
		cursor: pointer;
	}

	.modal-buttons button:hover {
		background: #2b6cb0;
	}

	.modal-buttons button:nth-child(2) {
		background: #e53e3e;
	}

	.modal-buttons button:nth-child(2):hover {
		background: #c53030;
	}
</style>
