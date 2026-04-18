<script lang="ts">
	import { onMount } from "svelte";
	import {
		generateAreaPerimeterWorksheet,
		isNumericAnswerCorrect,
		type FlatGeometryProblem,
	} from "./geometryUtils";
	import CompletionCertificate from "./CompletionCertificate.svelte";

	type AnswerState = "correct" | "incorrect" | "unanswered";

	let problems: FlatGeometryProblem[] = [];
	let userAnswers: Map<number, string> = new Map();
	let answerStates: Map<number, AnswerState> = new Map();
	let wrongRetries = 0;
	let startedAt = Date.now();
	let lastBlurAttempt: Map<number, string> = new Map();
	let itemCount = 10;

	function initializeAnswerMaps(nextProblems: FlatGeometryProblem[]) {
		userAnswers = new Map();
		answerStates = new Map();
		nextProblems.forEach((problem) => {
			userAnswers.set(problem.id, "");
			answerStates.set(problem.id, "unanswered");
		});
	}

	function resetWorksheet() {
		const safeCount = Number.isFinite(itemCount)
			? Math.min(40, Math.max(1, Math.floor(itemCount)))
			: 10;
		itemCount = safeCount;
		problems = generateAreaPerimeterWorksheet(safeCount);
		initializeAnswerMaps(problems);
		lastBlurAttempt.clear();
		wrongRetries = 0;
		startedAt = Date.now();
	}

	function handleAnswer(problem: FlatGeometryProblem, value: string) {
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

	function handleAnswerBlur(problem: FlatGeometryProblem) {
		const answer = (userAnswers.get(problem.id) || "").trim();
		if (answer === "") {
			return;
		}

		const isCorrect = isNumericAnswerCorrect(problem.answer, answer);
		if (!isCorrect && lastBlurAttempt.get(problem.id) !== answer) {
			wrongRetries += 1;
			lastBlurAttempt.set(problem.id, answer);
		}
	}

	function titleCase(text: string): string {
		return text
			.split(" ")
			.map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
			.join(" ");
	}

	function formulaText(problem: FlatGeometryProblem): string {
		if (problem.shape === "square") {
			return problem.metric === "area" ? "A = s x s" : "P = 4s";
		}
		if (problem.shape === "rectangle") {
			return problem.metric === "area" ? "A = w x h" : "P = 2(w + h)";
		}
		if (problem.shape === "circle") {
			return problem.metric === "area" ? "A = pi r^2" : "C = 2pi r";
		}
		if (problem.shape === "triangle") {
			return problem.metric === "area" ? "A = 1/2 x b x h" : "P = a + b + c";
		}
		return problem.metric === "area" ? "A = b x h" : "P = 2(b + side)";
	}

	onMount(() => {
		resetWorksheet();
	});

	$: correctCount = Array.from(answerStates.values()).filter((state) => state === "correct").length;
	$: totalAnswered = Array.from(answerStates.values()).filter((state) => state !== "unanswered").length;
	$: isCompleted = problems.length > 0 && correctCount === problems.length;
	$: tokensEarned = Math.floor(problems.length / 3);
</script>

<div class="worksheet-container">
	<div class="worksheet-header">
		<div>
			<h2>Area and Perimeter Worksheet</h2>
			<p>Use the dimensions shown in each diagram. Units are generic units.</p>
			<div class="count-controls">
				<label for="flat-geometry-count">Items</label>
				<input id="flat-geometry-count" type="number" min="1" max="40" bind:value={itemCount} />
				<button class="count-btn" on:click={resetWorksheet}>Apply</button>
			</div>
		</div>
		<div class="stats">
			<span>Correct: {correctCount}/{problems.length}</span>
			<span>Answered: {totalAnswered}/{problems.length}</span>
			<span>Wrong Retries: {wrongRetries}</span>
			<button on:click={resetWorksheet}>New Worksheet</button>
		</div>
	</div>

	{#if isCompleted}
		<CompletionCertificate
			worksheetTitle="Area and Perimeter Worksheet"
			totalItems={problems.length}
			wrongRetries={wrongRetries}
			startedAt={startedAt}
			tokensEarned={tokensEarned}
			tokenName="Geometry Token"
		/>
	{/if}

	{#if isCompleted}
		<CompletionCertificate
			worksheetTitle="Area and Perimeter Worksheet"
			totalItems={problems.length}
			wrongRetries={wrongRetries}
			startedAt={startedAt}
		/>
	{/if}

	<div class="card-grid">
		{#each problems as problem (problem.id)}
			<div class="problem-card">
				<div class="card-head">
					<span class="num">#{problem.id}</span>
					<h3>{titleCase(problem.shape)}: Find {problem.metric}</h3>
				</div>
				<p class="formula">Formula: {formulaText(problem)}</p>

				<div class="diagram-wrap">
					<svg viewBox="0 0 220 150" aria-label="{problem.shape} diagram">
						{#if problem.shape === "square"}
							<rect x="55" y="25" width="80" height="80" fill="#dbeafe" stroke="#1d4ed8" stroke-width="2" />
							<text x="95" y="118" text-anchor="middle" class="label">s = {problem.dimensions.side}</text>
							<line x1="55" y1="110" x2="135" y2="110" class="measure" />
						{:else if problem.shape === "rectangle"}
							<rect x="40" y="35" width="130" height="70" fill="#dcfce7" stroke="#15803d" stroke-width="2" />
							<text x="105" y="120" text-anchor="middle" class="label">w = {problem.dimensions.width}</text>
							<text x="20" y="75" class="label">h = {problem.dimensions.height}</text>
							<line x1="40" y1="112" x2="170" y2="112" class="measure" />
							<line x1="32" y1="35" x2="32" y2="105" class="measure" />
						{:else if problem.shape === "circle"}
							<circle cx="105" cy="72" r="42" fill="#fee2e2" stroke="#be123c" stroke-width="2" />
							<line x1="105" y1="72" x2="147" y2="72" class="measure" />
							<text x="126" y="64" class="label">r = {problem.dimensions.radius}</text>
						{:else if problem.shape === "triangle"}
							{#if problem.metric === "area"}
								<polygon points="35,105 175,105 115,35" fill="#ede9fe" stroke="#5b21b6" stroke-width="2" />
								<line x1="115" y1="35" x2="115" y2="105" class="measure dashed" />
								<line x1="35" y1="114" x2="175" y2="114" class="measure" />
								<text x="108" y="127" class="label">base = {problem.dimensions.base}</text>
								<text x="121" y="78" class="label">h = {problem.dimensions.height}</text>
							{:else}
								<polygon points="40,108 180,108 120,32" fill="#ede9fe" stroke="#5b21b6" stroke-width="2" />
								<text x="105" y="124" class="label">a = {problem.dimensions.a}</text>
								<text x="70" y="68" class="label">b = {problem.dimensions.b}</text>
								<text x="145" y="68" class="label">c = {problem.dimensions.c}</text>
							{/if}
						{:else if problem.shape === "parallelogram"}
							<polygon points="50,100 165,100 140,40 25,40" fill="#fde68a" stroke="#a16207" stroke-width="2" />
							<line x1="50" y1="110" x2="165" y2="110" class="measure" />
							<line x1="140" y1="40" x2="140" y2="100" class="measure dashed" />
							<text x="102" y="124" class="label">base = {problem.dimensions.base}</text>
							<text x="145" y="74" class="label">h = {problem.dimensions.height}</text>
							<text x="40" y="72" class="label">side = {problem.dimensions.side}</text>
						{/if}
					</svg>
				</div>

				<div
					class="answer-box"
					class:correct={answerStates.get(problem.id) === "correct"}
					class:incorrect={answerStates.get(problem.id) === "incorrect"}
				>
					<label for={`flat-answer-${problem.id}`}>Answer</label>
					<input
						id={`flat-answer-${problem.id}`}
						type="text"
						inputmode="decimal"
						placeholder="value"
						value={userAnswers.get(problem.id) || ""}
						on:input={(event) => handleAnswer(problem, (event.target as HTMLInputElement).value)}
						on:blur={() => handleAnswerBlur(problem)}
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

	.count-controls {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 0.6rem;
	}

	.count-controls label {
		font-size: 0.9rem;
		font-weight: 700;
		color: #475569;
	}

	.count-controls input {
		width: 80px;
		padding: 0.35rem;
		border-radius: 6px;
		border: 1px solid #94a3b8;
	}

	.count-btn {
		background: #0f766e;
		color: white;
		border: none;
		border-radius: 6px;
		padding: 0.35rem 0.6rem;
		font-weight: 700;
		cursor: pointer;
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

	.formula {
		margin: 0;
		font-size: 0.9rem;
		font-weight: 700;
		color: #1d4ed8;
	}

	.diagram-wrap {
		background: #f8fafc;
		border-radius: 8px;
		padding: 0.4rem;
	}

	svg {
		width: 100%;
		height: 170px;
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
