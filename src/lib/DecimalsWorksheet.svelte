<script lang="ts">
	import { onMount } from "svelte";
	import CompletionCertificate from "./CompletionCertificate.svelte";

	interface DecimalProblem {
		id: number;
		a: number;
		b: number;
		operation: "+" | "-" | "x" | "/";
		answer: number;
	}

	type AnswerState = "correct" | "incorrect" | "unanswered";

	let problems: DecimalProblem[] = [];
	let userAnswers: Map<number, string> = new Map();
	let answerStates: Map<number, AnswerState> = new Map();
	let wrongRetries = 0;
	let startedAt = Date.now();
	let lastBlurAttempt: Map<number, string> = new Map();

	function randomDecimal(min: number, max: number): number {
		const value = Math.random() * (max - min) + min;
		return Math.round(value * 100) / 100;
	}

	function roundTo(value: number, places: number = 2): number {
		const multiplier = 10 ** places;
		return Math.round(value * multiplier) / multiplier;
	}

	function buildDecimalWorksheet(): DecimalProblem[] {
		const operations: DecimalProblem["operation"][] = ["+", "-", "x", "/"];
		const worksheet: DecimalProblem[] = [];
		let id = 1;

		for (const operation of operations) {
			for (let index = 0; index < 6; index += 1) {
				let a = randomDecimal(1, 30);
				let b = randomDecimal(1, 20);

				if (operation === "-") {
					if (a < b) {
						[a, b] = [b, a];
					}
				}

				if (operation === "/") {
					const quotient = randomDecimal(1.2, 9.8);
					b = randomDecimal(1, 9);
					a = roundTo(quotient * b);
				}

				let answer = 0;
				switch (operation) {
					case "+":
						answer = roundTo(a + b);
						break;
					case "-":
						answer = roundTo(a - b);
						break;
					case "x":
						answer = roundTo(a * b);
						break;
					case "/":
						answer = roundTo(a / b);
						break;
				}

				worksheet.push({ id, a, b, operation, answer });
				id += 1;
			}
		}

		for (let i = worksheet.length - 1; i > 0; i -= 1) {
			const j = Math.floor(Math.random() * (i + 1));
			[worksheet[i], worksheet[j]] = [worksheet[j], worksheet[i]];
		}

		return worksheet;
	}

	function initializeAnswers(nextProblems: DecimalProblem[]) {
		userAnswers = new Map();
		answerStates = new Map();
		nextProblems.forEach((problem) => {
			userAnswers.set(problem.id, "");
			answerStates.set(problem.id, "unanswered");
		});
	}

	function isCorrect(problem: DecimalProblem, userInput: string): boolean {
		const parsed = Number.parseFloat(userInput);
		if (Number.isNaN(parsed)) {
			return false;
		}
		return Math.abs(parsed - problem.answer) <= 0.05;
	}

	function handleAnswerChange(problemId: number, value: string) {
		userAnswers.set(problemId, value);
		if (value.trim() === "") {
			answerStates.set(problemId, "unanswered");
		} else {
			const problem = problems.find((item) => item.id === problemId);
			if (!problem) {
				return;
			}
			answerStates.set(problemId, isCorrect(problem, value) ? "correct" : "incorrect");
		}

		userAnswers = new Map(userAnswers);
		answerStates = new Map(answerStates);
	}

	function handleAnswerBlur(problem: DecimalProblem) {
		const answer = (userAnswers.get(problem.id) || "").trim();
		if (answer === "") {
			return;
		}

		const correct = isCorrect(problem, answer);
		if (!correct && lastBlurAttempt.get(problem.id) !== answer) {
			wrongRetries += 1;
			lastBlurAttempt.set(problem.id, answer);
		}
	}

	function resetWorksheet() {
		problems = buildDecimalWorksheet();
		initializeAnswers(problems);
		lastBlurAttempt.clear();
		wrongRetries = 0;
		startedAt = Date.now();
	}

	onMount(() => {
		resetWorksheet();
	});

	$: correctCount = Array.from(answerStates.values()).filter((state) => state === "correct").length;
	$: totalAnswered = Array.from(answerStates.values()).filter((state) => state !== "unanswered").length;
	$: isCompleted = problems.length > 0 && correctCount === problems.length;

</script>

<div class="worksheet-container">
	<div class="worksheet-header">
		<div>
			<h2>Decimal Operations Worksheet</h2>
			<p>Round answers to the nearest hundredth when needed.</p>
		</div>
		<div class="stats">
			<span>Correct: {correctCount}/{problems.length}</span>
			<span>Answered: {totalAnswered}/{problems.length}</span>
			<span>Wrong Retries: {wrongRetries}</span>
			<button class="reset-btn" on:click={resetWorksheet}>New Worksheet</button>
		</div>
	</div>

	{#if isCompleted}
		<CompletionCertificate
			worksheetTitle="Decimal Operations Worksheet"
			totalItems={problems.length}
			wrongRetries={wrongRetries}
			startedAt={startedAt}
		/>
	{/if}

	<div class="problems-grid">
		{#each problems as problem (problem.id)}
			<div class="problem-card">
				<div class="problem-number">#{problem.id}</div>
				<div class="problem-equation">
					<span>{problem.a.toFixed(2)}</span>
					<span>{problem.operation}</span>
					<span>{problem.b.toFixed(2)}</span>
					<span>=</span>
				</div>
				<div
					class="answer-box"
					class:correct={answerStates.get(problem.id) === "correct"}
					class:incorrect={answerStates.get(problem.id) === "incorrect"}
				>
					<input
						type="text"
						inputmode="decimal"
						placeholder="answer"
						value={userAnswers.get(problem.id) || ""}
						on:input={(event) =>
							handleAnswerChange(problem.id, (event.target as HTMLInputElement).value)}
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
		max-width: 1200px;
		margin: 0 auto;
	}

	.worksheet-header {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		align-items: center;
		margin-bottom: 1.5rem;
		padding-bottom: 1rem;
		border-bottom: 2px solid #e2e8f0;
	}

	.worksheet-header h2 {
		margin: 0;
		color: #1f2937;
	}

	.worksheet-header p {
		margin: 0.3rem 0 0;
		color: #64748b;
	}

	.stats {
		display: flex;
		align-items: center;
		gap: 0.8rem;
		flex-wrap: wrap;
	}

	.stats span {
		background: #0ea5e9;
		color: white;
		padding: 0.45rem 0.7rem;
		border-radius: 6px;
		font-weight: 600;
	}

	.reset-btn {
		background: #ef4444;
		border: none;
		color: white;
		padding: 0.45rem 0.8rem;
		border-radius: 6px;
		font-weight: 700;
		cursor: pointer;
	}

	.reset-btn:hover {
		background: #dc2626;
	}

	.problems-grid {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 1rem;
	}

	.problem-card {
		background: white;
		border: 2px solid #cbd5e1;
		border-radius: 12px;
		padding: 0.9rem;
		display: flex;
		flex-direction: column;
		gap: 0.8rem;
	}

	.problem-number {
		color: #64748b;
		font-weight: 700;
	}

	.problem-equation {
		display: flex;
		justify-content: center;
		gap: 0.5rem;
		font-size: 1.1rem;
		font-weight: 700;
		color: #0f172a;
	}

	.answer-box {
		padding: 0.45rem;
		border-radius: 8px;
		border: 2px solid transparent;
	}

	.answer-box.correct {
		background: #dcfce7;
		border-color: #22c55e;
	}

	.answer-box.incorrect {
		background: #fee2e2;
		border-color: #ef4444;
	}

	.answer-box input {
		width: 100%;
		padding: 0.55rem;
		border: 1px solid #94a3b8;
		border-radius: 8px;
		font-size: 1rem;
		text-align: center;
	}

	.answer-box input:focus {
		outline: none;
		border-color: #0ea5e9;
		box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.2);
	}

	@media (max-width: 900px) {
		.problems-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.worksheet-header {
			flex-direction: column;
			align-items: flex-start;
		}
	}

	@media (max-width: 540px) {
		.problems-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
