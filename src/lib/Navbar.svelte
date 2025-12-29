<script lang="ts">
	export let currentWorksheet: string = "fractions";

	const worksheets = [
		{ id: "fractions", name: "Fractions" },
		{ id: "decimals", name: "Decimals" },
		{ id: "integers", name: "Integers" },
		{ id: "algebra", name: "Algebra" },
	];

	function selectWorksheet(worksheetId: string) {
		currentWorksheet = worksheetId;
	}
</script>

<nav class="navbar">
	<div class="nav-brand">
		<h1>Math Worksheets</h1>
	</div>
	<ul class="nav-menu">
		{#each worksheets as worksheet}
			<li>
				<button
					class="nav-link"
					class:active={currentWorksheet === worksheet.id}
					on:click={() => selectWorksheet(worksheet.id)}
				>
					{worksheet.name}
				</button>
			</li>
		{/each}
	</ul>
</nav>

<style>
	.navbar {
		background-color: #2c3e50;
		padding: 1rem 2rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.nav-brand h1 {
		color: white;
		margin: 0;
		font-size: 1.5rem;
	}

	.nav-menu {
		display: flex;
		list-style: none;
		margin: 0;
		padding: 0;
		gap: 1rem;
	}

	.nav-link {
		background: none;
		border: none;
		color: #ecf0f1;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		cursor: pointer;
		transition: background-color 0.3s ease;
		font-size: 1rem;
	}

	.nav-link:hover {
		background-color: #34495e;
	}

	.nav-link.active {
		background-color: #3498db;
		color: white;
	}
</style>
