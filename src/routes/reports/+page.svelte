<script lang="ts">
	import { writable } from 'svelte/store';
	import { get } from 'svelte/store';
	import { onMount } from 'svelte';
	import { fetchWithAuth } from '$lib/utils/fetch';
	import { apiUrl } from '$lib/stores/url';
	import Button from '$lib/components/Button.svelte';

	const url = get(apiUrl);

	let reports: {
		id: number;
		createdAt: Date;
		reason: string;
		isPost: boolean;
	}[] = [];

	const getReports = async () => {
		const data = await fetchWithAuth(url + 'report', {
			method: 'GET'
		});

		return data;
	};

	onMount(async () => {
		const data = await getReports();
		reports = data;
	});

	const reportDetails: {
		[id: number]: {
			reportedPost: {
				id: number;
				title: string;
				content: string;
				imgDirs: [string];
			};
			reportedComment: {
				id: number;
				content: string;
			};
			reportCount: number;
			reportedUser: {
				id: number;
				username: string;
			};
		};
	} = {};

	const openReportIds = writable<number[]>([]);

	const getReportDetails = async (id: number) => {
		const data = await fetchWithAuth(url + 'report/' + id, {
			method: 'GET'
		});

		return data;
	};

	// 슬라이더 인덱스 관리
	const sliderIndex: Record<number, number> = {};

	const nextSlide = (id: number) => {
		const length = reportDetails[id].reportedPost.imgDirs.length;
		sliderIndex[id] = sliderIndex[id] ? (sliderIndex[id] + 1) % length : 1 % length;
	};

	const prevSlide = (id: number) => {
		const length = reportDetails[id].reportedPost.imgDirs.length;
		sliderIndex[id] = sliderIndex[id] ? (sliderIndex[id] - 1) % length : length - 1;
	};

	// 신고 처리 요청
	let banDays: Record<number, number> = {};

	const toggleReport = async (id: number) => {
		if (reportDetails[id] === undefined) {
			const data = await getReportDetails(id);
			reportDetails[id] = data;
		}
		if (banDays[id] === undefined) {
			banDays[id] = 3;
		}
		openReportIds.update((ids) =>
			ids.includes(id) ? ids.filter((openId) => openId !== id) : [...ids, id]
		);
	};

	const acceptReport = async (id: number, banDays: number) => {
		const reqJson = {
			banDays
		};
		const data = await fetchWithAuth(url + 'report/' + id + '/accept', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(reqJson)
		});
		reports = await getReports();
		alert('신고가 수락되었습니다.');
	};

	const rejectReport = async (id: number) => {
		const data = await fetchWithAuth(url + 'report/' + id + '/reject', {
			method: 'POST'
		});

		reports = await getReports();
		alert('신고가 거절되었습니다.');
	};
</script>

<main>
	<h1 class="title">Reports</h1>

	{#if reports.length > 0}
		<div class="card-container">
			{#each reports as report}
				<div class="card">
					<!-- Report 제목 -->
					<div class="card-header">
						<h2>
							<span class={report.isPost ? 'badge post' : 'badge comment'}>
								{report.isPost ? 'Post' : 'Comment'}
							</span>
							Report #{report.id} - {report.reason}
						</h2>

						<div class="card-meta">
							<p>{new Date(report.createdAt).toLocaleString()}</p>

							<!-- 토글 버튼 -->
							<button
								class="toggle-button"
								on:click={async () => await toggleReport(report.id)}
								aria-label="Toggle details"
								class:open={$openReportIds.includes(report.id)}
							>
								<span class="triangle"></span>
							</button>
						</div>
					</div>

					<!-- 세부 내용: 클릭 시 열리고 닫힘 -->
					{#if $openReportIds.includes(report.id)}
						<div class="card-details">
							{#if reportDetails[report.id]?.reportedPost}
								<!-- Reported Post 세부 내용 -->
								<p><strong>Title:</strong> {reportDetails[report.id].reportedPost.title}</p>
								<p><strong>Content:</strong> {reportDetails[report.id].reportedPost.content}</p>
								<!-- 이미지 캐러셀 부분 -->
								{#if reportDetails[report.id]?.reportedPost.imgDirs.length > 0}
									<div class="carousel">
										<!-- 이전 버튼 -->
										{#if reportDetails[report.id].reportedPost.imgDirs.length > 1}
											<button
												class="carousel-button prev"
												on:click={() => prevSlide(report.id)}
												aria-label="Previous slide"
											>
												<i class="fa-solid fa-chevron-left"></i>
											</button>
										{/if}

										<!-- 이미지 표시 -->
										<div class="carousel-frame">
											<img
												src={reportDetails[report.id].reportedPost.imgDirs[
													sliderIndex[report.id] ?? 0
												]}
												alt="Reported Post"
												class="carousel-image"
											/>
										</div>

										<!-- 다음 버튼 -->
										{#if reportDetails[report.id].reportedPost.imgDirs.length > 1}
											<button
												class="carousel-button next"
												on:click={() => nextSlide(report.id)}
												aria-label="Next slide"
											>
												<i class="fa-solid fa-chevron-right"></i>
											</button>
										{/if}
									</div>
								{/if}
							{:else if reportDetails[report.id]?.reportedComment}
								<!-- Reported Comment 세부 내용 -->
								<p><strong>Content:</strong> {reportDetails[report.id].reportedComment.content}</p>
							{:else}
								<p>Loading...</p>
							{/if}
							<div class="extra-info-content">
								<div class="extra-details">
									<p><strong>Report Count:</strong> {reportDetails[report.id]?.reportCount}</p>
									<p>
										<strong>Reported User:</strong>
										{reportDetails[report.id]?.reportedUser.username}
									</p>
								</div>
								<div class="report-actions">
									<div class="report-buttons">
										<input
											class="ban-days-input"
											type="number"
											min="1"
											placeholder="Days"
											bind:value={banDays[report.id]}
										/>
										<Button
											type="secondary"
											onClick={() => acceptReport(report.id, banDays[report.id])}>Accept</Button
										>
										<Button type="negative" onClick={() => rejectReport(report.id)}>Deny</Button>
									</div>
								</div>
							</div>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{:else}
		<p class="description">No reports available.</p>
	{/if}
</main>

<style>
	/* 카드 컨테이너 */
	.card-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
	}

	/* 카드 스타일 */
	.card {
		background-color: white;
		padding: 1rem;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		width: 100%;
		max-width: 800px;
		margin: 0 1rem;
		box-sizing: border-box;
	}

	/* 카드 헤더 스타일 */
	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 0;
	}

	.card-header h2 {
		margin: 0;
		font-size: 18px;
		color: #333;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.card-meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.card-meta p {
		margin: 0;
		font-size: 14px;
		color: #666;
	}

	/* 카드 세부 내용 스타일 */
	.card-details {
		margin-top: 1rem;
		padding: 1rem;
		background-color: #f9f9f9;
		border-radius: 6px;
	}

	.card-details p {
		margin: 0.5rem 0;
	}

	/* 캐러셀 스타일 */
	.carousel {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 1rem;
	}

	.carousel-frame {
		width: 100%;
		max-width: 800px;
		height: 400px;
		background-color: black;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 8px;
		overflow: hidden;
	}

	.carousel-image {
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
		border-radius: 8px;
	}

	/* 버튼 스타일 */
	.carousel-button {
		position: absolute;
		background-color: rgba(0, 0, 0, 0.5);
		color: white;
		border: none;
		cursor: pointer;
		padding: 0.5rem;
		font-size: 24px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.carousel-button.prev {
		left: 10px;
	}

	.carousel-button.next {
		right: 10px;
	}

	.carousel-button:hover {
		background-color: rgba(0, 0, 0, 0.8);
	}

	/* 토글 버튼 스타일 */
	.toggle-button {
		background: none;
		border: none;
		cursor: pointer;
		padding: 0.3rem;
		position: relative;
		width: 20px;
		height: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* 삼각형 화살표 아이콘 */
	.triangle {
		width: 0;
		height: 0;
		border-left: 6px solid transparent;
		border-right: 6px solid transparent;
		border-top: 8px solid #666;
		transition: transform 0.3s ease;
	}

	/* 토글된 상태 (▼) */
	.toggle-button.open .triangle {
		transform: rotate(180deg);
		border-top-color: #333;
	}

	/* 뱃지 스타일 */
	.badge {
		padding: 0.2rem 0.5rem;
		border-radius: 12px;
		font-size: 12px;
		color: white;
		font-weight: bold;
	}

	.badge.post {
		background-color: #38a169;
	}

	.badge.comment {
		background-color: #3182ce;
	}

	/* 카드 세부 내용 스타일 */
	.card-details {
		margin-top: 1rem;
		padding: 1rem;
		background-color: #f9f9f9;
		border-radius: 6px;
	}

	.card-details p {
		margin: 0.5rem 0;
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

	.report-actions {
		align-self: flex-end;
		display: flex;
		gap: 0.5rem;
	}

	.report-buttons {
		display: flex;
		gap: 0.5rem;
	}

	@media (max-width: 768px) {
		.extra-info-content {
			flex-direction: column;
			align-items: flex-start;
			gap: 1rem;
		}

		.report-actions {
			align-self: flex-start;
			width: 100%;
		}
	}

	.ban-days-input {
		width: 80px;
		padding: 0.5rem;
		border: 1px solid #ccc;
		border-radius: 5px;
		font-size: 16px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		transition:
			border-color 0.3s,
			box-shadow 0.3s;
	}

	.ban-days-input:focus {
		border-color: #3182ce;
		box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.2);
		outline: none;
	}

	.ban-days-input::placeholder {
		color: #999;
	}
</style>
