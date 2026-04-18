<script lang="ts">
	import CompletionCertificate from "./CompletionCertificate.svelte";

	export let language: "english" | "filipino" = "english";

	type AnswerState = "correct" | "incorrect" | "unanswered";

	interface GrammarQuestion {
		id: number;
		question: string;
		options: string[];
		answerIndex: number;
		explanation: string;
	}

	let questions: GrammarQuestion[] = [];
	let selectedAnswers: Map<number, number> = new Map();
	let answerStates: Map<number, AnswerState> = new Map();
	let loading = false;
	let source: "groq" | "fallback" = "fallback";
	let generationMessage = "";
	let loadedLanguage: "english" | "filipino" | null = null;
	let wrongRetries = 0;
	let startedAt = Date.now();

	const fallbackEnglish: GrammarQuestion[] = [
		{
			id: 1,
			question: "Choose the correct sentence:",
			options: [
				"She don't like apples.",
				"She doesn't likes apples.",
				"She doesn't like apples.",
				"She not like apples.",
			],
			answerIndex: 2,
			explanation: "Use 'doesn't' + base verb form for third-person singular.",
		},
		{
			id: 2,
			question: "Which word correctly completes the sentence: 'I have ____ books than you.'",
			options: ["fewer", "less", "few", "many"],
			answerIndex: 0,
			explanation: "Use 'fewer' for countable nouns like books.",
		},
		{
			id: 3,
			question: "Identify the adjective in the sentence: 'The bright sun warmed the beach.'",
			options: ["warmed", "bright", "beach", "sun"],
			answerIndex: 1,
			explanation: "'Bright' describes the noun 'sun'.",
		},
		{
			id: 4,
			question: "Choose the correct punctuation:",
			options: [
				"My favorite colors are red blue and green.",
				"My favorite colors are red, blue and green.",
				"My favorite colors are red, blue, and green.",
				"My favorite colors are red blue, and green.",
			],
			answerIndex: 2,
			explanation: "Commas separate items in a series.",
		},
		{
			id: 5,
			question: "Which pronoun correctly completes the sentence: 'This gift is for ___." + "'",
			options: ["I", "me", "my", "mine"],
			answerIndex: 1,
			explanation: "After a preposition, use the object pronoun 'me'.",
		},
		{
			id: 6,
			question: "Pick the sentence in past tense:",
			options: [
				"They play soccer after school.",
				"They are playing soccer after school.",
				"They played soccer after school.",
				"They will play soccer after school.",
			],
			answerIndex: 2,
			explanation: "'Played' is the simple past form.",
		},
		{
			id: 7,
			question: "Choose the sentence with correct subject-verb agreement:",
			options: [
				"The team are winning the match.",
				"The team is winning the match.",
				"The team were winning the match.",
				"The team have winning the match.",
			],
			answerIndex: 1,
			explanation: "'Team' is singular here, so use 'is'.",
		},
		{
			id: 8,
			question: "Which word is an adverb in the sentence: 'He quickly solved the puzzle.'",
			options: ["He", "quickly", "solved", "puzzle"],
			answerIndex: 1,
			explanation: "'Quickly' describes how he solved the puzzle.",
		},
		{
			id: 9,
			question: "Choose the correct comparative form:",
			options: ["more fast", "fastly", "faster", "most fast"],
			answerIndex: 2,
			explanation: "The comparative form of 'fast' is 'faster'.",
		},
		{
			id: 10,
			question: "Choose the sentence that uses the apostrophe correctly:",
			options: [
				"Its raining outside.",
				"It's raining outside.",
				"Its' raining outside.",
				"It,s raining outside.",
			],
			answerIndex: 1,
			explanation: "'It's' means 'it is'.",
		},
	];

	const fallbackFilipino: GrammarQuestion[] = [
		{
			id: 1,
			question: "Piliin ang wastong pangungusap:",
			options: [
				"Kumain ako ng kanin kahapon.",
				"Kumain ako nang kanin kahapon.",
				"Kumain akong kanin kahapon.",
				"Kumain ako ng ang kanin kahapon.",
			],
			answerIndex: 0,
			explanation: "'Ng' ang gamit bago ang pangngalan bilang layon.",
		},
		{
			id: 2,
			question: "Alin ang wastong gamit ng 'nang'?",
			options: [
				"Umalis siya ng maaga.",
				"Umalis siya nang maaga.",
				"Umalis siyang maaga.",
				"Nang umalis siya maaga.",
			],
			answerIndex: 1,
			explanation: "'Nang' ang gamit kapag naglalarawan ng paraan, oras, o dalas.",
		},
		{
			id: 3,
			question: "Ano ang panghalip sa pangungusap na: 'Sila ay naglalaro sa labas.'",
			options: ["naglalaro", "labas", "sila", "ay"],
			answerIndex: 2,
			explanation: "Ang 'sila' ay panghalip panao.",
		},
		{
			id: 4,
			question: "Piliin ang tamang bantas:",
			options: [
				"Magdala ka ng lapis, papel at pambura.",
				"Magdala ka ng lapis papel at pambura.",
				"Magdala ka, ng lapis, papel at pambura.",
				"Magdala ka ng lapis, papel, at, pambura.",
			],
			answerIndex: 0,
			explanation: "Gumamit ng kuwit sa tamang paghihiwalay ng talaan.",
		},
		{
			id: 5,
			question: "Piliin ang wastong anyo ng pandiwa:",
			options: [
				"Kami ay nag-aral kagabi.",
				"Kami ay mag-aral kagabi.",
				"Kami ay nag-aaral bukas.",
				"Kami ay nag-aaral kahapon bukas.",
			],
			answerIndex: 0,
			explanation: "'Nag-aral' ang wastong anyo para sa kilos na naganap na.",
		},
		{
			id: 6,
			question: "Alin ang pang-uri sa pangungusap na: 'Maganda ang tanawin sa bundok.'",
			options: ["tanawin", "bundok", "maganda", "ang"],
			answerIndex: 2,
			explanation: "Ang 'maganda' ay naglalarawan sa tanawin.",
		},
		{
			id: 7,
			question: "Alin ang wastong gamit ng 'din/rin'?",
			options: [
				"Gusto ko rin ng tubig.",
				"Gusto ko din ng tubig.",
				"Gusto ko ring ng tubig.",
				"Gusto ko dinng tubig.",
			],
			answerIndex: 0,
			explanation: "Karaniwang ginagamit ang 'rin' kapag patinig ang naunang tunog.",
		},
		{
			id: 8,
			question: "Piliin ang wastong pang-ukol:",
			options: [
				"Nasa mesa ang libro.",
				"Nang mesa ang libro.",
				"Ng mesa ang libro.",
				"Sa ay mesa ang libro.",
			],
			answerIndex: 0,
			explanation: "Ang 'nasa' ay wastong pang-ukol para sa kinalalagyan.",
		},
		{
			id: 9,
			question: "Alin ang wastong pangatnig sa pangungusap: 'Nag-aral siya ___ pumasa sa pagsusulit.'",
			options: ["kaya", "upang", "ngunit", "dahil"],
			answerIndex: 1,
			explanation: "Ginagamit ang 'upang' upang ipakita ang layunin.",
		},
		{
			id: 10,
			question: "Piliin ang pangungusap na may tamang gamit ng 'may/mayroon':",
			options: [
				"Mayroon lapis ako.",
				"May lapis ako.",
				"Mayroon akong lapis ay.",
				"May na lapis ako.",
			],
			answerIndex: 1,
			explanation: "'May' ang karaniwang gamit bago ang pangngalan.",
		},
	];

	function sanitizeQuestions(raw: unknown): GrammarQuestion[] {
		if (!Array.isArray(raw)) {
			return [];
		}

		const normalized = raw
			.map((entry, index) => {
				if (
					typeof entry !== "object" ||
					entry === null ||
					!("question" in entry) ||
					!("options" in entry) ||
					!("answerIndex" in entry) ||
					!("explanation" in entry)
				) {
					return null;
				}

				const item = entry as {
					question: string;
					options: string[];
					answerIndex: number;
					explanation: string;
				};

				if (
					typeof item.question !== "string" ||
					!Array.isArray(item.options) ||
					item.options.length !== 4 ||
					typeof item.answerIndex !== "number" ||
					item.answerIndex < 0 ||
					item.answerIndex > 3 ||
					typeof item.explanation !== "string"
				) {
					return null;
				}

				return {
					id: index + 1,
					question: item.question.trim(),
					options: item.options.map((opt) => `${opt}`),
					answerIndex: item.answerIndex,
					explanation: item.explanation.trim(),
				};
			})
			.filter((item): item is GrammarQuestion => item !== null);

		return normalized;
	}

	async function fetchGroqQuestions(): Promise<GrammarQuestion[] | null> {
		const apiKey = import.meta.env.VITE_GROQ_API_KEY;
		if (!apiKey) {
			return null;
		}

		const languagePrompt = language === "english" ? "English" : "Filipino";
		const prompt = [
			`Create exactly 10 multiple-choice ${languagePrompt} grammar questions for elementary students in Grades 4 to 6.`,
			"Return only JSON.",
			"Each object must have: question, options, answerIndex, explanation.",
			"Rules:",
			"- options must always have exactly 4 answer choices.",
			"- answerIndex must be 0, 1, 2, or 3.",
			"- tone and vocabulary must be age-appropriate for Grades 4 to 6.",
			"- questions should focus on foundational grammar skills.",
			"- explanations must be concise and accurate.",
			"- produce 10 items exactly.",
		].join("\n");

		const response = await fetch(
			"https://api.groq.com/openai/v1/chat/completions",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${apiKey}`,
				},
				body: JSON.stringify({
					model: "llama-3.1-8b-instant",
					messages: [
						{
							role: "system",
							content:
								"You are a strict JSON generator for grammar worksheets. Return valid JSON only.",
						},
						{ role: "user", content: prompt },
					],
					response_format: { type: "json_object" },
					temperature: 0.5,
					max_tokens: 2000,
				}),
			}
		);

		if (!response.ok) {
			throw new Error(`Groq request failed: ${response.status}`);
		}

		const data = await response.json();
		const text = data?.choices?.[0]?.message?.content;
		if (typeof text !== "string") {
			return null;
		}

		let parsed: unknown;
		try {
			parsed = JSON.parse(text);
		} catch {
			return null;
		}

		if (
			typeof parsed === "object" &&
			parsed !== null &&
			"questions" in parsed &&
			Array.isArray((parsed as { questions: unknown }).questions)
		) {
			return sanitizeQuestions((parsed as { questions: unknown[] }).questions);
		}

		return sanitizeQuestions(parsed);
	}

	function fallbackQuestions(): GrammarQuestion[] {
		return (language === "english" ? fallbackEnglish : fallbackFilipino).slice(0, 10);
	}

	function initializeStates(nextQuestions: GrammarQuestion[]) {
		selectedAnswers = new Map();
		answerStates = new Map();
		wrongRetries = 0;
		startedAt = Date.now();
		nextQuestions.forEach((question) => {
			selectedAnswers.set(question.id, -1);
			answerStates.set(question.id, "unanswered");
		});
	}

	async function loadQuestions() {
		loading = true;
		generationMessage = "";

		try {
			const generated = await fetchGroqQuestions();
			if (generated && generated.length >= 10) {
				questions = generated.slice(0, 10).map((question, index) => ({
					...question,
					id: index + 1,
				}));
				source = "groq";
				generationMessage = "Questions generated with Groq API.";
			} else {
				questions = fallbackQuestions();
				source = "fallback";
				generationMessage = "Using built-in Grade 4-6 questions.";
			}
		} catch {
			questions = fallbackQuestions();
			source = "fallback";
			generationMessage = "Groq request failed, so built-in questions are shown instead.";
		} finally {
			initializeStates(questions);
			loading = false;
		}
	}

	function selectOption(question: GrammarQuestion, optionIndex: number) {
		const previous = selectedAnswers.get(question.id);
		if (optionIndex !== question.answerIndex && previous !== optionIndex) {
			wrongRetries += 1;
		}

		selectedAnswers.set(question.id, optionIndex);
		answerStates.set(
			question.id,
			optionIndex === question.answerIndex ? "correct" : "incorrect"
		);
		selectedAnswers = new Map(selectedAnswers);
		answerStates = new Map(answerStates);
	}

	$: if (language !== loadedLanguage) {
		loadedLanguage = language;
		loadQuestions();
	}

	$: correctCount = Array.from(answerStates.values()).filter((state) => state === "correct").length;
	$: answeredCount = Array.from(answerStates.values()).filter((state) => state !== "unanswered").length;
	$: isCompleted = questions.length > 0 && correctCount === questions.length;
	$: tokensEarned = Math.floor(questions.length / 5);
</script>

<div class="worksheet-container">
	<div class="worksheet-header">
		<div>
			<h2>{language === "english" ? "English Grammar" : "Filipino Grammar"} Worksheet</h2>
			<p>Choose the best answer for each question.</p>
			<p class="source-info" class:fallback={source === "fallback"}>{generationMessage}</p>
		</div>
		<div class="stats">
			<span>Correct: {correctCount}/{questions.length}</span>
			<span>Answered: {answeredCount}/{questions.length}</span>
			<span>Wrong Retries: {wrongRetries}</span>
			<span>Token Rate: 1 per 5 items</span>
			<button on:click={loadQuestions} disabled={loading}>
				{loading ? "Loading..." : "New Questions"}
			</button>
		</div>
	</div>

	{#if isCompleted}
		<CompletionCertificate
			worksheetTitle={language === "english" ? "English Grammar Worksheet" : "Filipino Grammar Worksheet"}
			totalItems={questions.length}
			wrongRetries={wrongRetries}
			startedAt={startedAt}
			tokensEarned={tokensEarned}
			tokenName="Language Token"
		/>
	{/if}

	{#if loading}
		<div class="loading">Generating questions...</div>
	{:else}
		<div class="questions-grid">
			{#each questions as question (question.id)}
				<div
					class="question-card"
					class:correct={answerStates.get(question.id) === "correct"}
					class:incorrect={answerStates.get(question.id) === "incorrect"}
				>
					<h3>#{question.id} {question.question}</h3>
					<div class="options">
						{#each question.options as option, optionIndex}
							<button
								type="button"
								class="option"
								class:selected={selectedAnswers.get(question.id) === optionIndex}
								on:click={() => selectOption(question, optionIndex)}
							>
								{option}
							</button>
						{/each}
					</div>
					{#if answerStates.get(question.id) !== "unanswered"}
						<p class="explanation">{question.explanation}</p>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
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

	.source-info {
		font-size: 0.9rem;
		color: #0284c7;
	}

	.source-info.fallback {
		color: #b45309;
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

	.stats button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.loading {
		padding: 2rem;
		text-align: center;
		font-size: 1.1rem;
		color: #334155;
	}

	.questions-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1rem;
	}

	.question-card {
		background: white;
		border: 2px solid #cbd5e1;
		border-radius: 12px;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.8rem;
	}

	.question-card h3 {
		margin: 0;
		font-size: 1rem;
		line-height: 1.4;
		color: #0f172a;
	}

	.options {
		display: grid;
		grid-template-columns: 1fr;
		gap: 0.5rem;
	}

	.option {
		text-align: left;
		border: 1px solid #94a3b8;
		border-radius: 8px;
		padding: 0.55rem 0.7rem;
		background: #f8fafc;
		cursor: pointer;
	}

	.option:hover {
		background: #e2e8f0;
	}

	.option.selected {
		border-color: #0284c7;
		background: #e0f2fe;
	}

	.question-card.correct {
		border-color: #22c55e;
		background: #f0fdf4;
	}

	.question-card.incorrect {
		border-color: #ef4444;
		background: #fef2f2;
	}

	.explanation {
		margin: 0;
		font-size: 0.9rem;
		color: #1e293b;
	}

	@media (max-width: 980px) {
		.questions-grid {
			grid-template-columns: 1fr;
		}

		.worksheet-header {
			flex-direction: column;
			align-items: flex-start;
		}
	}
</style>
