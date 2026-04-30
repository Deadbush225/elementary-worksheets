<script lang="ts">
	import StatsPopup from "./StatsPopup.svelte";

	export let currentWorksheet: string = "fractions";
	let isMenuOpen = false;
	let isStatsOpen = false;

	const worksheets = [
		{ id: "fractions", name: "Fractions" },
		{ id: "decimals", name: "Decimals" },
		{ id: "area-perimeter", name: "Area & Perimeter" },
		{ id: "surface-volume", name: "Surface Area & Volume" },
		{ id: "english-grammar", name: "English Grammar" },
		{ id: "filipino-grammar", name: "Filipino Grammar" },
	];

	function selectWorksheet(worksheetId: string) {
		currentWorksheet = worksheetId;
		isMenuOpen = false;
	}

	function toggleMenu() {
		isMenuOpen = !isMenuOpen;
	}

	function toggleStats() {
		isStatsOpen = !isStatsOpen;
	}
</script>

{#if isStatsOpen}
	<StatsPopup onClose={toggleStats} />
{/if}

<nav class="navbar">
	<div class="nav-brand">
		<h1>Math Worksheets</h1>
	</div>
	
	<div class="nav-actions">
		<button class="stats-btn" on:click={toggleStats} aria-label="View Stats">
			🌟 Rewards
		</button>
		<button class="menu-toggle" aria-label="Toggle navigation menu" on:click={toggleMenu}>
			<span></span>
			<span></span>
			<span></span>
		</button>
	</div>
	<ul class="nav-menu" class:open={isMenuOpen}>
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
		position: relative;
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
		flex-wrap: wrap;
	}

	.menu-toggle {
		display: none;
		flex-direction: column;
		gap: 4px;
		background: transparent;
		border: none;
		padding: 0.35rem;
		cursor: pointer;
	}

	.nav-actions {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.stats-btn {
		background: #f1c40f;
		color: #2c3e50;
		border: none;
		padding: 0.4rem 0.8rem;
		border-radius: 6px;
		font-weight: bold;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.4rem;
		transition: transform 0.2s, background 0.2s;
	}

	.stats-btn:hover {
		background: #f39c12;
		transform: scale(1.05);
	}

	.menu-toggle span {
		display: block;
		width: 22px;
		height: 2px;
		background: #ecf0f1;
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

	@media (max-width: 880px) {
		.navbar {
			padding: 1rem;
			flex-wrap: wrap;
		}

		.menu-toggle {
			display: flex;
		}

		.nav-menu {
			display: none;
			position: absolute;
			top: calc(100% + 0.4rem);
			left: 1rem;
			right: 1rem;
			background: #233445;
			border-radius: 10px;
			padding: 0.6rem;
			flex-direction: column;
			gap: 0.45rem;
			z-index: 10;
		}

		.nav-menu.open {
			display: flex;
		}

		.nav-link {
			width: 100%;
			text-align: left;
		}
	}
</style>
