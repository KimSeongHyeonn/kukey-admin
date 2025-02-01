<script lang="ts">
	import { get } from 'svelte/store';
	import { onMount } from 'svelte';
	import { apiUrl } from '$lib/stores/url';
	import { fetchWithAuth } from '$lib/utils/fetch';
	import Button from '$lib/components/Button.svelte';
	import DarkBackground from '$lib/components/DarkBackground.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import Input from '$lib/components/Input.svelte';

	const url = get(apiUrl);

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

	// API 호출 함수
	const getCalendar = async (year: number, semester: number) => {
		const data = await fetchWithAuth(url + `calendar/academic?year=${year}&semester=${semester}`, {
			method: 'GET'
		});

		return data;
	};

	// 초기 연도와 학기 설정
	let year = new Date().getFullYear();
	let semester = new Date().getMonth() < 6 ? 1 : 2;

	// 연도와 학기 선택 시 데이터 가져오기
	const loadCalendarData = async () => {
		const data = await getCalendar(year, semester);
		calendar = data;
	};

	// 초기화 시 데이터 가져오기
	onMount(async () => {
		await loadCalendarData();
	});

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

	// 수정 및 추가 모달 상태 관리
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

		alert('일정이 수정되었습니다.');
		isEditModalOpen = false;
		await loadCalendarData();
	};

	// 일정 추가 API 호출
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

		alert('일정이 삭제되었습니다.');
		await loadCalendarData();
	};
</script>

<main>
	<h1 class="title">Academic Calendar</h1>

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
		<div class="add-button">
			<Button width="100%" onClick={openAddModal}>Add Schedule</Button>
		</div>
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
							<div class="schedule-buttons">
								<Button type="secondary" onClick={() => openEditModal(schedule)}>Edit</Button>
								<Button type="negative" onClick={() => deleteSchedule(schedule.id)}>Delete</Button>
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
	<DarkBackground isOpen={isEditModalOpen}>
		<Modal title="Edit Schedule">
			<Input type="text" name="Title" bind:content={selectedSchedule.title} />
			<Input type="textarea" name="Description" bind:content={selectedSchedule.description} />
			<Input type="date" name="Start Date" bind:content={selectedSchedule.startDate} />
			<Input type="date" name="End Date" bind:content={selectedSchedule.endDate} />
			<div class="modal-buttons">
				<Button onClick={updateSchedule}>Save</Button>
				<Button type="negative" onClick={() => (isEditModalOpen = false)}>Cancel</Button>
			</div>
		</Modal>
	</DarkBackground>

	<!-- 일정 추가 모달 -->
	<DarkBackground isOpen={isAddModalOpen}>
		<Modal title="Add Schedule">
			<Input type="text" name="Title" bind:content={newSchedule.title} />
			<Input type="textarea" name="Description" bind:content={newSchedule.description} />
			<Input type="date" name="Start Date" bind:content={newSchedule.startDate} />
			<Input type="date" name="End Date" bind:content={newSchedule.endDate} />
			<div class="modal-buttons">
				<Button onClick={addSchedule}>Save</Button>
				<Button type="negative" onClick={() => (isAddModalOpen = false)}>Cancel</Button>
			</div>
		</Modal>
	</DarkBackground>
</main>

<style>
	.header-container {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
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

	.schedule-buttons {
		display: flex;
		gap: 1rem;
		margin-top: 1rem;
	}

	.modal-buttons {
		display: flex;
		justify-content: space-between;
		margin-top: 1rem;
	}
</style>
