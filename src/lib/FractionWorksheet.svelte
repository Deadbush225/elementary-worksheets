<script lang="ts">
	import { onMount } from "svelte";
	import type { FractionProblem, UserAnswer } from "./fractionUtils";
	import { generateFractionWorksheet, checkAnswer } from "./fractionUtils";

	let problems: FractionProblem[] = [];
	let userAnswers: Map<number, UserAnswer> = new Map();
	let answerStates: Map<number, "correct" | "incorrect" | "unanswered"> =
		new Map();

	onMount(() => {
		problems = generateFractionWorksheet();
		// Initialize answer states
		problems.forEach((problem) => {
			answerStates.set(problem.id, "unanswered");
			userAnswers.set(problem.id, { numerator: "", denominator: "" });
		});
	});

	function handleAnswerChange(
		problemId: number,
		field: "numerator" | "denominator",
		value: string
	) {
		const currentAnswer = userAnswers.get(problemId) || {
			numerator: "",
			denominator: "",
		};
		const updatedAnswer = { ...currentAnswer, [field]: value };
		userAnswers.set(problemId, updatedAnswer);

		// Check if both fields are filled
		if (updatedAnswer.numerator !== "" && updatedAnswer.denominator !== "") {
			const problem = problems.find((p) => p.id === problemId)!;
			const isCorrect = checkAnswer(problem, updatedAnswer);
			answerStates.set(problemId, isCorrect ? "correct" : "incorrect");
		} else {
			answerStates.set(problemId, "unanswered");
		}

		// Trigger reactivity
		userAnswers = new Map(userAnswers);
		answerStates = new Map(answerStates);
	}

	function resetWorksheet() {
		problems = generateFractionWorksheet();
		userAnswers.clear();
		answerStates.clear();
		problems.forEach((problem) => {
			answerStates.set(problem.id, "unanswered");
			userAnswers.set(problem.id, { numerator: "", denominator: "" });
		});
		userAnswers = new Map(userAnswers);
		answerStates = new Map(answerStates);
	}

	$: correctCount = Array.from(answerStates.values()).filter(
		(state) => state === "correct"
	).length;
	$: totalAnswered = Array.from(answerStates.values()).filter(
		(state) => state !== "unanswered"
	).length;
</script>

<div class="worksheet-container">
	<div class="worksheet-header">
		<h2>Fraction Operations Worksheet</h2>
		<div class="stats">
			<span>Correct: {correctCount}/{problems.length}</span>
			<span>Answered: {totalAnswered}/{problems.length}</span>
			<button class="reset-btn" on:click={resetWorksheet}>New Worksheet</button>
		</div>
	</div>

	<div class="problems-grid">
		{#each problems as problem (problem.id)}
			<div class="problem-card">
				<div class="problem-number">{problem.id}</div>
				<div class="problem-content">
					<div class="fraction-display">
						<div class="fraction">
							<span class="numerator">{problem.fraction1.numerator}</span>
							<span class="fraction-bar"></span>
							<span class="denominator">{problem.fraction1.denominator}</span>
						</div>
						<span class="operation">{problem.operation}</span>
						<div class="fraction">
							<span class="numerator">{problem.fraction2.numerator}</span>
							<span class="fraction-bar"></span>
							<span class="denominator">{problem.fraction2.denominator}</span>
						</div>
						<span class="equals">=</span>
					</div>
					<div
						class="answer-section"
						class:correct={answerStates.get(problem.id) === "correct"}
						class:incorrect={answerStates.get(problem.id) === "incorrect"}
					>
						<div class="answer-fraction">
							<input
								type="number"
								class="answer-input numerator-input"
								placeholder="?"
								value={userAnswers.get(problem.id)?.numerator || ""}
								on:input={(e) =>
									handleAnswerChange(
										problem.id,
										"numerator",
										(e.target as HTMLInputElement).value
									)}
							/>
							<div class="answer-fraction-bar"></div>
							<input
								type="number"
								class="answer-input denominator-input"
								placeholder="?"
								min="1"
								value={userAnswers.get(problem.id)?.denominator || ""}
								on:input={(e) =>
									handleAnswerChange(
										problem.id,
										"denominator",
										(e.target as HTMLInputElement).value
									)}
							/>
						</div>
					</div>
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
		align-items: center;
		margin-bottom: 2rem;
		padding-bottom: 1rem;
		border-bottom: 2px solid #ecf0f1;
	}

	.worksheet-header h2 {
		color: #2c3e50;
		margin: 0;
	}

	.stats {
		display: flex;
		gap: 1rem;
		align-items: center;
	}

	.stats span {
		background-color: #3498db;
		color: white;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		font-weight: bold;
	}

	.reset-btn {
		background-color: #e74c3c;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		cursor: pointer;
		font-weight: bold;
	}

	.reset-btn:hover {
		background-color: #c0392b;
	}

	.problems-grid {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 1rem;
		margin-top: 1rem;
	}

	.problem-card {
		border: 2px solid #bdc3c7;
		border-radius: 8px;
		padding: 1rem;
		background-color: white;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.problem-number {
		font-weight: bold;
		color: #7f8c8d;
		margin-bottom: 0.5rem;
		text-align: center;
	}

	.problem-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}

	.fraction-display {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}

	.fraction {
		display: flex;
		flex-direction: column;
		align-items: center;
		font-size: 1.1rem;
	}

	.numerator,
	.denominator {
		padding: 0.2rem 0.4rem;
		font-weight: bold;
	}

	.fraction-bar {
		width: 100%;
		height: 2px;
		background-color: #2c3e50;
		margin: 0.1rem 0;
	}

	.operation,
	.equals {
		font-size: 1.2rem;
		font-weight: bold;
		color: #2c3e50;
	}

	.answer-section {
		border-radius: 6px;
		padding: 0.5rem;
		transition: background-color 0.3s ease;
	}

	.answer-section.correct {
		background-color: #d5f4e6;
		border: 2px solid #27ae60;
	}

	.answer-section.incorrect {
		background-color: #f8d7da;
		border: 2px solid #e74c3c;
	}

	.answer-fraction {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.answer-input {
		width: 60px;
		text-align: center;
		border: 1px solid #bdc3c7;
		border-radius: 4px;
		padding: 0.3rem;
		font-size: 1rem;
		font-weight: bold;
	}

	.answer-input:focus {
		outline: none;
		border-color: #3498db;
		box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
	}

	.answer-fraction-bar {
		width: 70px;
		height: 2px;
		background-color: #2c3e50;
		margin: 0.3rem 0;
	}

	@media (max-width: 768px) {
		.problems-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.worksheet-header {
			flex-direction: column;
			gap: 1rem;
		}
	}

	@media (max-width: 480px) {
		.problems-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
