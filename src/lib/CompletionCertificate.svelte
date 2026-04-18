<script lang="ts">
	export let worksheetTitle: string;
	export let totalItems: number;
	export let wrongRetries: number;
	export let startedAt: number;

	$: elapsedSeconds = Math.max(1, Math.floor((Date.now() - startedAt) / 1000));
	$: accuracy = totalItems + wrongRetries > 0
		? Math.round((totalItems / (totalItems + wrongRetries)) * 100)
		: 100;
	$: completionDate = new Date().toLocaleDateString();
</script>

<div class="certificate" role="status" aria-live="polite">
	<div class="seal">Certificate of Completion</div>
	<h3>{worksheetTitle}</h3>
	<p class="subtitle">All items are correct.</p>
	<div class="stats-grid">
		<div class="stat">
			<span class="label">Total Items</span>
			<span class="value">{totalItems}</span>
		</div>
		<div class="stat">
			<span class="label">Wrong Retries</span>
			<span class="value">{wrongRetries}</span>
		</div>
		<div class="stat">
			<span class="label">Accuracy</span>
			<span class="value">{accuracy}%</span>
		</div>
		<div class="stat">
			<span class="label">Time</span>
			<span class="value">{elapsedSeconds}s</span>
		</div>
	</div>
	<p class="issued">Issued on {completionDate}</p>
</div>

<style>
	.certificate {
		margin: 1rem 0 1.5rem;
		padding: 1.2rem;
		border: 3px solid #f59e0b;
		border-radius: 14px;
		background: linear-gradient(145deg, #fffbeb 0%, #fff7d6 100%);
		box-shadow: 0 8px 20px rgba(180, 83, 9, 0.14);
	}

	.seal {
		display: inline-block;
		padding: 0.3rem 0.7rem;
		border-radius: 999px;
		background: #b45309;
		color: white;
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.05em;
		text-transform: uppercase;
	}

	h3 {
		margin: 0.6rem 0 0;
		color: #7c2d12;
		font-size: 1.35rem;
	}

	.subtitle {
		margin: 0.2rem 0 0.9rem;
		color: #92400e;
		font-weight: 600;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 0.7rem;
	}

	.stat {
		background: rgba(255, 255, 255, 0.65);
		border: 1px solid #fcd34d;
		border-radius: 10px;
		padding: 0.6rem;
	}

	.label {
		display: block;
		font-size: 0.75rem;
		color: #92400e;
		margin-bottom: 0.2rem;
	}

	.value {
		font-size: 1.05rem;
		font-weight: 700;
		color: #7c2d12;
	}

	.issued {
		margin: 0.9rem 0 0;
		color: #a16207;
		font-size: 0.85rem;
	}

	@media (max-width: 780px) {
		.stats-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
</style>
