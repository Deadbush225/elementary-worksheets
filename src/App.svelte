<script lang="ts">
	import Navbar from "./lib/Navbar.svelte";
	import FractionWorksheet from "./lib/FractionWorksheet.svelte";
	import DecimalsWorksheet from "./lib/DecimalsWorksheet.svelte";
	import AreaPerimeterWorksheet from "./lib/AreaPerimeterWorksheet.svelte";
	import SurfaceVolumeWorksheet from "./lib/SurfaceVolumeWorksheet.svelte";
	import GrammarWorksheet from "./lib/GrammarWorksheet.svelte";
	import ScienceWorksheet from "./lib/ScienceWorksheet.svelte";

	let currentWorksheet = "fractions";
</script>

<div class="app">
	<Navbar bind:currentWorksheet />

	<main class="main-content">
		{#if currentWorksheet === "fractions"}
			<FractionWorksheet />
		{:else if currentWorksheet === "decimals"}
			<DecimalsWorksheet />
		{:else if currentWorksheet === "area-perimeter"}
			<AreaPerimeterWorksheet />
		{:else if currentWorksheet === "surface-volume"}
			<SurfaceVolumeWorksheet />
		{:else if currentWorksheet === "english-grammar"}
			<GrammarWorksheet language="english" />
		{:else if currentWorksheet === "filipino-grammar"}
			<GrammarWorksheet language="filipino" />
		{:else if currentWorksheet === "science"}
			<ScienceWorksheet />
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
