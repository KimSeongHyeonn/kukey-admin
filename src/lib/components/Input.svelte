<script lang="ts">
	type InputType = 'text' | 'textarea' | 'date' | 'category' | 'image';
	export let type: InputType = 'text';
	export let name = '';
	export let content = '';
	export let options: string[] = [];
	export let onChange = (event: Event) => {};
</script>

<div>
	<label for={name}>{name}</label>
	{#if type === 'text'}
		<input type="text" id={name} placeholder={name} bind:value={content} />
	{:else if type === 'textarea'}
		<textarea id={name} placeholder={name} bind:value={content}></textarea>
	{:else if type === 'date'}
		<input type="date" id={name} bind:value={content} />
	{:else if type === 'category'}
		<select id={name} bind:value={content}>
			{#each options as option}
				<option value={option}>{option}</option>
			{/each}
		</select>
	{:else if type === 'image'}
		<input type="file" id={name} accept="image/*" on:change={onChange} />
	{/if}
</div>

<style>
	div {
		margin-bottom: 1rem;
	}

	label {
		font-weight: 600;
		margin-bottom: 0.5rem;
		display: block;
	}

	input,
	textarea,
	select {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid #ccc;
		border-radius: 5px;
		box-sizing: border-box;
	}

	textarea {
		resize: none;
		height: 100px;
	}
</style>
