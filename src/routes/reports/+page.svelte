<script lang="ts">
	import { writable } from 'svelte/store';
	import { get } from 'svelte/store';
	import { apiUrl } from '../../store/url';
	import { fetchWithAuth } from '$lib/utils';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	const url = get(apiUrl);

	const getReports = async () => {
		const data = await fetchWithAuth(url + 'report', {
			method: 'GET'
		});
		if (!data) {
			goto('/');
			alert('로그인이 필요합니다.');
		}
		return data;
	};

	// Report 리스트
	let reports: {
		id: number;
		createdAt: Date;
		reason: string;
		isPost: boolean;
	}[] = [];

	// 초기화 시 데이터 가져오기
	onMount(async () => {
		const data = await getReports();
		reports = data;
	});

	// 열려 있는 report ID를 관리하는 store
	const openReportIds = writable<number[]>([]);

	const getReportDetails = async (id: number) => {
		const data = await fetchWithAuth(url + 'report/' + id, {
			method: 'POST'
		});
		if (!data) {
			goto('/');
			alert('로그인이 필요합니다.');
		}
		return data;
	};

	// Report 세부 내용
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

	// Report를 토글하는 함수
	const toggleReport = async (id: number) => {
		if (reportDetails[id] === undefined) {
			const data = await getReportDetails(id);
			reportDetails[id] = data;
		}
		openReportIds.update((ids) =>
			ids.includes(id) ? ids.filter((openId) => openId !== id) : [...ids, id]
		);
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
</script>

<main>
	<h1>Reports</h1>

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
								<!-- 이미지 캐러셀 부분 수정 -->
								{#if reportDetails[report.id]?.reportedPost.imgDirs.length > 0}
									<div class="carousel">
										<!-- 이전 버튼 -->
										{#if reportDetails[report.id].reportedPost.imgDirs.length > 1}
											<button class="carousel-button prev" on:click={() => prevSlide(report.id)}
												>‹</button
											>
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
											<button class="carousel-button next" on:click={() => nextSlide(report.id)}
												>›</button
											>
										{/if}
									</div>
								{/if}
							{:else if reportDetails[report.id]?.reportedComment}
								<!-- Reported Comment 세부 내용 -->
								<p><strong>Content:</strong> {reportDetails[report.id].reportedComment.content}</p>
							{:else}
								<p>Loading...</p>
							{/if}

							<p><strong>Report Count:</strong> {reportDetails[report.id]?.reportCount}</p>
							<p>
								<strong>Reported User:</strong>
								{reportDetails[report.id]?.reportedUser.username}
							</p>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{:else}
		<p class="no-reports-message">No reports available.</p>
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

	.no-reports-message {
		text-align: center;
		font-size: 18px;
		color: #666;
		margin-top: 2rem;
	}

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
</style>
