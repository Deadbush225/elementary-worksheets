<script lang="ts">
	import Navbar from "./lib/Navbar.svelte";
	import FractionWorksheet from "./lib/FractionWorksheet.svelte";

	let currentWorksheet = "fractions";

	function handleWorksheetChange(worksheetType: string) {
		currentWorksheet = worksheetType;
	}
</script>

<div class="app">
	<Navbar bind:currentWorksheet />

	<main class="main-content">
		{#if currentWorksheet === "fractions"}
			<FractionWorksheet />
		{:else}
			<div class="placeholder">
				<h2>
					{currentWorksheet.charAt(0).toUpperCase() + currentWorksheet.slice(1)}
					Worksheet
				</h2>
				<p>This worksheet type is coming soon!</p>
			</div>
		{/if}
	</main>
</div>

<style>
	.app {
		min-height: 100vh;
		background-color: #f8f9fa;
	}

	.main-content {
		min-height: calc(100vh - 80px);
	}

	.placeholder {
		padding: 4rem 2rem;
		text-align: center;
		color: #7f8c8d;
	}

	.placeholder h2 {
		margin-bottom: 1rem;
	}
</style>
