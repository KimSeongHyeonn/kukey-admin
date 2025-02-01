<script lang="ts">
	export let title = '';
</script>

<div class="container">
	<h2>{title}</h2>
	<slot />
</div>

<style>
	.container {
		background: white;
		padding: 2rem;
		border-radius: 10px;
		width: 500px;
		max-width: 90%;
		max-height: 90vh;
		overflow: hidden;
	}

	h2 {
		margin-top: 0;
		margin-bottom: 0.5rem;
	}
</style>
