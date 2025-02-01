<script lang="ts">
	export let isOpen = false;
	export let zIndex = 2000;
</script>

<div class={isOpen ? 'open' : ''} style={`z-index: ${zIndex}`}>
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
	}

	div.open {
		display: flex;
	}
</style>
