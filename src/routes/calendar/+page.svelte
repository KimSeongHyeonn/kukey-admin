<script lang="ts">
	import { get } from 'svelte/store';
	import { apiUrl } from '../../store/url';
	import { fetchWithAuth } from '$lib/utils';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	const url = get(apiUrl);

	// 초기 연도와 학기 설정
	let year = new Date().getFullYear();
	let semester = new Date().getMonth() < 6 ? 1 : 2;

	// API 호출 함수
	const getCalendar = async (year: number, semester: number) => {
		const data = await fetchWithAuth(url + `calendar/academic?year=${year}&semester=${semester}`, {
			method: 'GET'
		});
		if (!data) {
			goto('/');
			alert('로그인이 필요합니다.');
		}
		return data;
	};

	let calendar: {
		month: number;
		schedules: {
			id: number;
			title: string;
			description: string;
			startDate: Date;
			startDay: string;
			endDate: Date;
			endDay: string;
		}[];
	}[] = [];

	// 초기화 시 데이터 가져오기
	onMount(async () => {
		await loadCalendarData();
	});

	// 연도와 학기 선택 시 데이터 가져오기
	const loadCalendarData = async () => {
		const data = await getCalendar(year, semester);
		calendar = data;
	};

	// 월 이름 반환 함수
	const getMonthName = (month: number) => {
		const monthNames = [
			'January',
			'February',
			'March',
			'April',
			'May',
			'June',
			'July',
			'August',
			'September',
			'October',
			'November',
			'December'
		];
		return monthNames[month - 1];
	};

	// 수정 및 추가가 모달 상태 관리
	let isEditModalOpen = false;
	let selectedSchedule = {
		id: 0,
		title: '',
		description: '',
		startDate: '',
		endDate: ''
	};

	let isAddModalOpen = false;
	let newSchedule = {
		title: '',
		description: '',
		startDate: '',
		endDate: ''
	};

	// 일정 수정 모달 열기
	const openEditModal = (schedule: any) => {
		selectedSchedule = {
			...schedule,
			startDate: new Date(schedule.startDate).toISOString().split('T')[0],
			endDate: new Date(schedule.endDate).toISOString().split('T')[0]
		};
		isEditModalOpen = true;
	};

	// 일정 추가 모달 열기
	const openAddModal = () => {
		newSchedule = {
			title: '',
			description: '',
			startDate: '',
			endDate: ''
		};
		isAddModalOpen = true;
	};

	// 일정 수정 API 호출
	const updateSchedule = async () => {
		const reqJson = {
			title: selectedSchedule.title,
			description: selectedSchedule.description,
			startDate: selectedSchedule.startDate,
			endDate: selectedSchedule.endDate
		};

		if (
			!selectedSchedule.title ||
			!selectedSchedule.description ||
			!selectedSchedule.startDate ||
			!selectedSchedule.endDate
		) {
			alert('빈 필드가 존재합니다.');
			return;
		}

		const response = await fetchWithAuth(url + `calendar/${selectedSchedule.id}`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(reqJson)
		});
		if (!response) {
			goto('/');
			alert('로그인이 필요합니다.');
			return;
		}

		alert('일정이 수정되었습니다.');
		isEditModalOpen = false;
		await loadCalendarData();
	};

	const addSchedule = async () => {
		const reqJson = {
			title: newSchedule.title,
			description: newSchedule.description,
			startDate: newSchedule.startDate,
			endDate: newSchedule.endDate,
			isAcademic: true
		};

		if (
			!newSchedule.title ||
			!newSchedule.description ||
			!newSchedule.startDate ||
			!newSchedule.endDate
		) {
			alert('빈 필드가 존재합니다.');
			return;
		}

		const response = await fetchWithAuth(url + 'calendar', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(reqJson)
		});
		if (!response) {
			goto('/');
			alert('로그인이 필요합니다.');
			return;
		}

		alert('일정이 추가되었습니다.');
		isAddModalOpen = false;
		await loadCalendarData();
	};

	// 일정 삭제 API 호출
	const deleteSchedule = async (id: number) => {
		const confirmed = confirm('정말 삭제하시겠습니까?');
		if (!confirmed) return;

		const response = await fetchWithAuth(url + `calendar/${id}`, {
			method: 'DELETE'
		});

		if (!response) {
			goto('/');
			alert('로그인이 필요합니다.');
			return;
		}

		alert('일정이 삭제되었습니다.');
		await loadCalendarData();
	};
</script>

<main>
	<h1>Academic Calendar</h1>

	<div class="header-container">
		<!-- 연도와 학기 선택 섹션 -->
		<div class="selection-container">
			<div class="select">
				<label for="year-select">Year:</label>
				<select id="year-select" bind:value={year} on:change={loadCalendarData}>
					{#each Array(4)
						.fill(0)
						.map((_, i) => new Date().getFullYear() + i - 1) as optionYear}
						<option value={optionYear}>{optionYear}</option>
					{/each}
				</select>
			</div>

			<div class="select">
				<label for="semester-select">Semester:</label>
				<select id="semester-select" bind:value={semester} on:change={loadCalendarData}>
					<option value={1}>1</option>
					<option value={2}>2</option>
				</select>
			</div>
		</div>

		<!-- 일정 추가 버튼 -->
		<button class="add-button" on:click={openAddModal}>Add Schedule</button>
	</div>

	<!-- 월별 일정 표시 -->
	{#each calendar as monthData}
		<section class="month-section">
			<h2>{getMonthName(monthData.month)}</h2>

			{#if monthData.schedules.length > 0}
				<ul class="schedule-list">
					{#each monthData.schedules as schedule}
						<li class="schedule-item">
							<h3>{schedule.title}</h3>
							<p>{schedule.description}</p>
							<p>
								<strong>Start:</strong>
								{new Date(schedule.startDate).toLocaleDateString()} ({schedule.startDay})<br />
								<strong>End:</strong>
								{new Date(schedule.endDate).toLocaleDateString()} ({schedule.endDay})
							</p>
							<div class="buttons">
								<button on:click={() => openEditModal(schedule)}>Edit</button>
								<button on:click={() => deleteSchedule(schedule.id)}>Delete</button>
							</div>
						</li>
					{/each}
				</ul>
			{:else}
				<p>No schedules for this month.</p>
			{/if}
		</section>
	{/each}

	<!-- 수정 모달 -->
	{#if isEditModalOpen}
		<div class="modal">
			<div class="modal-content">
				<h2>Edit Schedule</h2>
				<div class="form-group">
					<label for="title">Title</label>
					<input id="title" type="text" bind:value={selectedSchedule.title} placeholder="Title" />
				</div>
				<div class="form-group">
					<label for="description">Description</label>
					<textarea
						id="description"
						bind:value={selectedSchedule.description}
						placeholder="Description"
					></textarea>
				</div>
				<div class="form-group">
					<label for="start-date">Start Date</label>
					<input id="start-date" type="date" bind:value={selectedSchedule.startDate} />
				</div>
				<div class="form-group">
					<label for="end-date">End Date</label>
					<input id="end-date" type="date" bind:value={selectedSchedule.endDate} />
				</div>
				<div class="modal-buttons">
					<button on:click={updateSchedule}>Save</button>
					<button on:click={() => (isEditModalOpen = false)}>Cancel</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- 일정 추가 모달 -->
	{#if isAddModalOpen}
		<div class="modal">
			<div class="modal-content">
				<h2>Add Schedule</h2>
				<div class="form-group">
					<label for="title">Title</label>
					<input id="title" type="text" bind:value={newSchedule.title} placeholder="Title" />
				</div>
				<div class="form-group">
					<label for="description">Description</label>
					<textarea id="description" bind:value={newSchedule.description} placeholder="Description"
					></textarea>
				</div>
				<div class="form-group">
					<label for="start-date">Start Date</label>
					<input id="start-date" type="date" bind:value={newSchedule.startDate} />
				</div>
				<div class="form-group">
					<label for="end-date">End Date</label>
					<input id="end-date" type="date" bind:value={newSchedule.endDate} />
				</div>
				<div class="modal-buttons">
					<button on:click={addSchedule}>Save</button>
					<button on:click={() => (isAddModalOpen = false)}>Cancel</button>
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

	.header-container {
		display: flex;
		justify-content: space-between;
		align-items: center;
		max-width: 800px;
		margin: 0 auto;
		margin-bottom: 1rem;
	}

	@media (max-width: 768px) {
		.header-container {
			flex-direction: column;
			gap: 1rem;
			text-align: center;
		}

		.selection-container {
			width: 100%;
		}

		.add-button {
			width: 100%;
		}
	}

	/* 선택 섹션 스타일 */
	.selection-container {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 1rem;
		margin: 0;
	}

	.selection-container .select {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 0.5rem;
	}

	.select label {
		font-weight: bold;
		color: #333;
		margin-bottom: 0;
	}

	.select select {
		padding: 0.5rem;
		border: 1px solid #ccc;
		border-radius: 5px;
		font-size: 16px;
	}

	/* 버튼 스타일 */
	.add-button {
		background-color: #4caf50;
		color: white;
		padding: 0.6rem 1.2rem;
		border: none;
		border-radius: 8px;
		font-size: 16px;
		cursor: pointer;
		transition: background-color 0.3s ease;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.add-button:hover {
		background-color: #45a049;
	}

	.add-button:active {
		background-color: #388e3c;
		box-shadow: none;
	}

	/* 월 섹션 스타일 */
	.month-section {
		margin-bottom: 2rem;
		padding: 1rem;
		border: 1px solid #ccc;
		border-radius: 8px;
		background-color: #f9f9f9;
	}

	.month-section h2 {
		margin: 0 0 1rem;
		color: #333;
		font-size: 24px;
	}

	/* 일정 목록 스타일 */
	.schedule-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.schedule-item {
		margin-bottom: 1rem;
		padding: 1rem;
		border: 1px solid #ddd;
		border-radius: 5px;
		background-color: white;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.schedule-item h3 {
		margin: 0 0 0.5rem;
		color: #222;
		font-size: 18px;
	}

	.schedule-item p {
		margin: 0.5rem 0;
		color: #555;
	}

	.modal {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.8);
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
	}

	.modal-content h2 {
		margin-top: 0;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	.modal-buttons {
		display: flex;
		justify-content: space-between;
		margin-top: 1rem;
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: bold;
	}

	input,
	textarea {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid #ccc;
		border-radius: 5px;
		box-sizing: border-box;
		font-family: 'Noto Sans KR', 'Roboto', sans-serif;
	}

	textarea {
		resize: none;
		height: 100px;
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

	.buttons {
		display: flex;
		gap: 1rem;
		margin-top: 1rem;
	}

	.schedule-item button {
		background: #007bff;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 5px;
		cursor: pointer;
	}

	.schedule-item button:hover {
		background: #0056b3;
	}

	.schedule-item button:nth-child(2) {
		background: #e53e3e;
	}

	.schedule-item button:nth-child(2):hover {
		background: #c53030;
	}
</style>
