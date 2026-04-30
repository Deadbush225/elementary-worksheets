<script lang="ts">
	import { jsPDF } from "jspdf";
	import { onMount } from "svelte";
	import { dbService } from "./firebase";

	export let worksheetTitle: string;
	export let totalItems: number;
	export let wrongRetries: number;
	export let startedAt: number;
	export let tokensEarned: number = 0;
	export let tokenName: string = "Gold Study Token";

	$: elapsedSeconds = Math.max(1, Math.floor((Date.now() - startedAt) / 1000));
	$: accuracy = totalItems + wrongRetries > 0
		? Math.round((totalItems / (totalItems + wrongRetries)) * 100)
		: 100;
	$: completionDate = new Date().toLocaleDateString();
	$: prizeName = tokensEarned >= 5
		? "Legendary Treasure Chest"
		: tokensEarned >= 3
			? "Epic Reward Crate"
			: tokensEarned >= 1
				? "Shiny Badge Pack"
				: "No prize unlocked yet";

	onMount(() => {
		const playerId = localStorage.getItem("playerName") || "Learner";
		dbService.savePlayerRecord(playerId, tokensEarned, [prizeName]).then(result => {
			if (result.success) {
				console.log("Firebase updated successfully with certificate completion.");
			} else {
				console.error("Failed to update Firebase:", result.error);
			}
		});
	});

	function downloadCertificatePdf() {
		const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
		const fileSafeTitle = worksheetTitle.toLowerCase().replace(/\s+/g, "-");

		pdf.setFillColor(255, 251, 235);
		pdf.rect(10, 10, 277, 190, "F");
		pdf.setDrawColor(245, 158, 11);
		pdf.setLineWidth(1.2);
		pdf.rect(10, 10, 277, 190);

		pdf.setTextColor(124, 45, 18);
		pdf.setFont("helvetica", "bold");
		pdf.setFontSize(24);
		pdf.text("Certificate of Completion", 148.5, 35, { align: "center" });

		pdf.setFontSize(17);
		pdf.text(worksheetTitle, 148.5, 52, { align: "center" });

		pdf.setFont("helvetica", "normal");
		pdf.setFontSize(12);
		pdf.text("All worksheet items were answered correctly.", 148.5, 62, {
			align: "center",
		});

		pdf.setFont("helvetica", "bold");
		pdf.setFontSize(13);
		pdf.text(`Tokens Earned: ${tokensEarned} ${tokenName}${tokensEarned === 1 ? "" : "s"}`, 30, 84);
		pdf.text(`Prize: ${prizeName}`, 30, 94);

		pdf.setFont("helvetica", "normal");
		pdf.setFontSize(11);
		pdf.text(`Total Items: ${totalItems}`, 30, 112);
		pdf.text(`Wrong Retries: ${wrongRetries}`, 30, 120);
		pdf.text(`Accuracy: ${accuracy}%`, 30, 128);
		pdf.text(`Completion Time: ${elapsedSeconds}s`, 30, 136);
		pdf.text(`Issued on: ${completionDate}`, 30, 148);

		pdf.setFont("helvetica", "italic");
		pdf.setTextColor(146, 64, 14);
		pdf.text("Keep learning and collecting rewards.", 148.5, 175, { align: "center" });

		pdf.save(`${fileSafeTitle}-certificate.pdf`);
	}
</script>

<div class="certificate" role="status" aria-live="polite">
	<div class="seal">Certificate of Completion</div>
	<h3>{worksheetTitle}</h3>
	<p class="subtitle">All items are correct.</p>
	<div class="token-wrap">
		<div class="coin" aria-hidden="true">
			<span>G</span>
		</div>
		<div>
			<p class="token-text">
			{#if tokensEarned > 0}
				You gained {tokensEarned} {tokenName}{tokensEarned > 1 ? "s" : ""}.
			{:else}
				You completed this worksheet. Reach the token threshold next round to earn {tokenName}s.
			{/if}
			</p>
			<p class="prize-text">Prize: {prizeName}</p>
		</div>
	</div>
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
	<div class="actions">
		<button type="button" class="download-btn" on:click={downloadCertificatePdf}>
			Download Certificate PDF
		</button>
	</div>
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

	.token-wrap {
		display: flex;
		align-items: center;
		gap: 0.8rem;
		margin-bottom: 1rem;
	}

	.coin {
		width: 42px;
		height: 42px;
		border-radius: 50%;
		background: radial-gradient(circle at 30% 30%, #fde68a 0%, #f59e0b 70%, #b45309 100%);
		border: 2px solid #92400e;
		display: flex;
		justify-content: center;
		align-items: center;
		box-shadow: 0 5px 10px rgba(146, 64, 14, 0.35);
		animation: spin-coin 1.8s linear infinite;
	}

	.coin span {
		font-weight: 900;
		color: #7c2d12;
	}

	.token-text {
		margin: 0;
		color: #92400e;
		font-weight: 700;
	}

	.prize-text {
		margin: 0.25rem 0 0;
		color: #7c2d12;
		font-weight: 800;
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

	.actions {
		margin-top: 0.8rem;
	}

	.download-btn {
		border: none;
		border-radius: 8px;
		background: #92400e;
		color: white;
		font-weight: 700;
		padding: 0.5rem 0.85rem;
		cursor: pointer;
	}

	.download-btn:hover {
		background: #7c2d12;
	}

	@media (max-width: 780px) {
		.token-wrap {
			align-items: flex-start;
		}

		.stats-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@keyframes spin-coin {
		0% {
			transform: rotateY(0deg);
		}
		50% {
			transform: rotateY(90deg);
		}
		100% {
			transform: rotateY(360deg);
		}
	}
</style>
