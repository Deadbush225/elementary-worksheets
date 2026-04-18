<script lang="ts">
	import { onMount } from "svelte";
	import {
		generateSurfaceVolumeWorksheet,
		isNumericAnswerCorrect,
		type SolidGeometryProblem,
	} from "./geometryUtils";

	type AnswerState = "correct" | "incorrect" | "unanswered";

	let problems: SolidGeometryProblem[] = [];
	let userAnswers: Map<number, string> = new Map();
	let answerStates: Map<number, AnswerState> = new Map();

	function setupMaps(nextProblems: SolidGeometryProblem[]) {
		userAnswers = new Map();
		answerStates = new Map();
		nextProblems.forEach((problem) => {
			userAnswers.set(problem.id, "");
			answerStates.set(problem.id, "unanswered");
		});
	}

	function resetWorksheet() {
		problems = generateSurfaceVolumeWorksheet(10);
		setupMaps(problems);
	}

	function onAnswer(problem: SolidGeometryProblem, value: string) {
		userAnswers.set(problem.id, value);
		if (value.trim() === "") {
			answerStates.set(problem.id, "unanswered");
		} else {
			answerStates.set(
				problem.id,
				isNumericAnswerCorrect(problem.answer, value) ? "correct" : "incorrect"
			);
		}
		userAnswers = new Map(userAnswers);
		answerStates = new Map(answerStates);
	}

	function titleCase(text: string): string {
		return text
			.split(" ")
			.map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
			.join(" ");
	}

	onMount(() => {
		resetWorksheet();
	});

	$: correctCount = Array.from(answerStates.values()).filter((state) => state === "correct").length;
	$: totalAnswered = Array.from(answerStates.values()).filter((state) => state !== "unanswered").length;
</script>

<div class="worksheet-container">
	<div class="worksheet-header">
		<div>
			<h2>Surface Area and Volume Worksheet</h2>
			<p>Use the dimensions in each diagram and round when necessary.</p>
		</div>
		<div class="stats">
			<span>Correct: {correctCount}/{problems.length}</span>
			<span>Answered: {totalAnswered}/{problems.length}</span>
			<button on:click={resetWorksheet}>New Worksheet</button>
		</div>
	</div>

	<div class="card-grid">
		{#each problems as problem (problem.id)}
			<div class="problem-card">
				<div class="card-head">
					<span class="num">#{problem.id}</span>
					<h3>{titleCase(problem.shape)}: Find {problem.metric}</h3>
				</div>

				<div class="diagram-wrap">
					<svg viewBox="0 0 220 160" aria-label="{problem.shape} diagram">
						{#if problem.shape === "cube"}
							<polygon points="90,30 150,30 150,90 90,90" fill="#bfdbfe" stroke="#1d4ed8" stroke-width="2" />
							<line x1="60" y1="50" x2="90" y2="30" stroke="#1d4ed8" stroke-width="2" />
							<line x1="120" y1="50" x2="150" y2="30" stroke="#1d4ed8" stroke-width="2" />
							<line x1="120" y1="110" x2="150" y2="90" stroke="#1d4ed8" stroke-width="2" />
							<line x1="60" y1="110" x2="90" y2="90" stroke="#1d4ed8" stroke-width="2" />
							<polygon points="60,50 120,50 120,110 60,110" fill="#dbeafe" stroke="#1d4ed8" stroke-width="2" />
							<text x="105" y="128" class="label">side = {problem.dimensions.side}</text>
						{:else if problem.shape === "rectangular prism"}
							<polygon points="80,35 170,35 170,95 80,95" fill="#bbf7d0" stroke="#15803d" stroke-width="2" />
							<line x1="40" y1="60" x2="80" y2="35" stroke="#15803d" stroke-width="2" />
							<line x1="130" y1="60" x2="170" y2="35" stroke="#15803d" stroke-width="2" />
							<line x1="130" y1="120" x2="170" y2="95" stroke="#15803d" stroke-width="2" />
							<line x1="40" y1="120" x2="80" y2="95" stroke="#15803d" stroke-width="2" />
							<polygon points="40,60 130,60 130,120 40,120" fill="#dcfce7" stroke="#15803d" stroke-width="2" />
							<text x="84" y="136" class="label">l = {problem.dimensions.length}</text>
							<text x="179" y="70" class="label">w = {problem.dimensions.width}</text>
							<text x="18" y="96" class="label">h = {problem.dimensions.height}</text>
						{:else if problem.shape === "triangular pyramid"}
							<polygon points="55,120 165,120 110,55" fill="#fef3c7" stroke="#b45309" stroke-width="2" />
							<line x1="55" y1="120" x2="110" y2="25" class="edge" />
							<line x1="165" y1="120" x2="110" y2="25" class="edge" />
							<line x1="110" y1="55" x2="110" y2="25" class="measure dashed" />
							<text x="105" y="138" class="label">side = {problem.dimensions.side}</text>
							<text x="118" y="45" class="label">h = {problem.dimensions.height}</text>
							<text x="138" y="83" class="label">s = {problem.dimensions.slantHeight}</text>
						{:else if problem.shape === "cone"}
							<ellipse cx="110" cy="120" rx="45" ry="12" fill="#fecaca" stroke="#be123c" stroke-width="2" />
							<path d="M65 120 L110 35 L155 120" fill="#fee2e2" stroke="#be123c" stroke-width="2" />
							<line x1="110" y1="120" x2="155" y2="120" class="measure" />
							<line x1="110" y1="35" x2="110" y2="120" class="measure dashed" />
							<text x="130" y="112" class="label">r = {problem.dimensions.radius}</text>
							<text x="116" y="80" class="label">h = {problem.dimensions.height}</text>
							<text x="138" y="74" class="label">l = {problem.dimensions.slantHeight}</text>
						{:else if problem.shape === "cylinder"}
							<ellipse cx="110" cy="35" rx="38" ry="10" fill="#e0f2fe" stroke="#0369a1" stroke-width="2" />
							<rect x="72" y="35" width="76" height="80" fill="#bae6fd" stroke="#0369a1" stroke-width="2" />
							<ellipse cx="110" cy="115" rx="38" ry="10" fill="#7dd3fc" stroke="#0369a1" stroke-width="2" />
							<line x1="110" y1="35" x2="110" y2="115" class="measure dashed" />
							<line x1="110" y1="35" x2="148" y2="35" class="measure" />
							<text x="130" y="28" class="label">r = {problem.dimensions.radius}</text>
							<text x="116" y="79" class="label">h = {problem.dimensions.height}</text>
						{:else if problem.shape === "sphere"}
							<circle cx="110" cy="78" r="45" fill="#ede9fe" stroke="#6d28d9" stroke-width="2" />
							<ellipse cx="110" cy="78" rx="45" ry="15" fill="none" stroke="#6d28d9" stroke-width="1.8" stroke-dasharray="4 4" />
							<line x1="110" y1="78" x2="155" y2="78" class="measure" />
							<text x="132" y="70" class="label">r = {problem.dimensions.radius}</text>
						{/if}
					</svg>
				</div>

				<div
					class="answer-box"
					class:correct={answerStates.get(problem.id) === "correct"}
					class:incorrect={answerStates.get(problem.id) === "incorrect"}
				>
					<label for={`solid-answer-${problem.id}`}>Answer</label>
					<input
						id={`solid-answer-${problem.id}`}
						type="text"
						inputmode="decimal"
						placeholder="value"
						value={userAnswers.get(problem.id) || ""}
						on:input={(event) => onAnswer(problem, (event.target as HTMLInputElement).value)}
					/>
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.worksheet-container {
		padding: 2rem;
		max-width: 1240px;
		margin: 0 auto;
	}

	.worksheet-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		padding-bottom: 1rem;
		border-bottom: 2px solid #e2e8f0;
		margin-bottom: 1.5rem;
	}

	.worksheet-header h2 {
		margin: 0;
		color: #0f172a;
	}

	.worksheet-header p {
		margin: 0.3rem 0 0;
		color: #475569;
	}

	.stats {
		display: flex;
		gap: 0.7rem;
		align-items: center;
		flex-wrap: wrap;
	}

	.stats span {
		background: #0ea5e9;
		color: white;
		padding: 0.45rem 0.7rem;
		border-radius: 6px;
		font-weight: 600;
	}

	.stats button {
		border: none;
		background: #f97316;
		color: white;
		padding: 0.5rem 0.8rem;
		border-radius: 6px;
		font-weight: 700;
		cursor: pointer;
	}

	.stats button:hover {
		background: #ea580c;
	}

	.card-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1rem;
	}

	.problem-card {
		background: white;
		border-radius: 12px;
		border: 2px solid #cbd5e1;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.8rem;
	}

	.card-head {
		display: flex;
		align-items: center;
		gap: 0.6rem;
	}

	.num {
		background: #1e293b;
		color: white;
		border-radius: 999px;
		padding: 0.2rem 0.6rem;
		font-size: 0.8rem;
		font-weight: 700;
	}

	.card-head h3 {
		margin: 0;
		font-size: 1rem;
		color: #0f172a;
	}

	.diagram-wrap {
		background: #f8fafc;
		border-radius: 8px;
		padding: 0.4rem;
	}

	svg {
		width: 100%;
		height: 180px;
	}

	.label {
		font-size: 12px;
		fill: #0f172a;
		font-weight: 600;
	}

	.measure {
		stroke: #334155;
		stroke-width: 1.8;
	}

	.measure.dashed {
		stroke-dasharray: 5 4;
	}

	.edge {
		stroke: #b45309;
		stroke-width: 2;
	}

	.answer-box {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.6rem;
		border-radius: 8px;
		border: 2px solid transparent;
	}

	.answer-box label {
		font-weight: 700;
		color: #334155;
	}

	.answer-box input {
		flex: 1;
		padding: 0.5rem;
		border-radius: 6px;
		border: 1px solid #94a3b8;
		font-size: 1rem;
	}

	.answer-box input:focus {
		outline: none;
		border-color: #0ea5e9;
		box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.2);
	}

	.answer-box.correct {
		background: #dcfce7;
		border-color: #22c55e;
	}

	.answer-box.incorrect {
		background: #fee2e2;
		border-color: #ef4444;
	}

	@media (max-width: 980px) {
		.card-grid {
			grid-template-columns: 1fr;
		}

		.worksheet-header {
			flex-direction: column;
			align-items: flex-start;
		}
	}
</style>
