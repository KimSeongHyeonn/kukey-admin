<script>
	export let type = 'primary'; // primary, secondary, negative
	export let onClick = () => {};
</script>

<button class={type} on:click={onClick}>
	<slot />
</button>

<style>
	button {
		padding: 0.5rem 1rem;
		border-radius: 5px;
		cursor: pointer;
		border: none;
		font-size: 16px;
		transition: background-color 0.2s ease;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.primary {
		background: #6fa0ff;
		color: white;
	}

	.primary:hover {
		background: #5e93ff;
	}

	.secondary {
		background-color: #9baab5;
		color: white;
	}

	.secondary:hover {
		background-color: #8c9ba6;
	}

	.negative {
		background: #ff7b72;
		color: white;
	}

	.negative:hover {
		background: #ff6a60;
	}
</style>
