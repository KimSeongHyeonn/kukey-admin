<script lang="ts">
	export let isOpen = false;
</script>

<div class={isOpen ? 'open' : ''}>
	<slot />
</div>

<style>
	div {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.8);
		display: none;
		justify-content: center;
		align-items: center;
		z-index: 2000;
	}

	div.open {
		display: flex;
	}
</style>
