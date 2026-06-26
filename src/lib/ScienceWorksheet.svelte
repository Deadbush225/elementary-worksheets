<script lang="ts">
	import CompletionCertificate from "./CompletionCertificate.svelte";

	export let category: "life" | "physical" = "life";

	type AnswerState = "correct" | "incorrect" | "unanswered";

	interface ScienceQuestion {
		id: number;
		question: string;
		options: string[];
		answerIndex: number;
		explanation: string;
	}

	let questions: ScienceQuestion[] = [];
	let selectedAnswers: Map<number, number> = new Map();
	let answerStates: Map<number, AnswerState> = new Map();
	let loading = false;
	let source: "groq" | "fallback" = "fallback";
	let generationMessage = "";
	let loadedCategory: "life" | "physical" | null = null;
	let wrongRetries = 0;
	let startedAt = Date.now();

	const fallbackLifeScience: ScienceQuestion[] = [
		{
			id: 1,
			question:
				"What is the primary function of the mitochondria in an animal cell?",
			options: [
				"To store DNA and genetic material.",
				"To produce energy for the cell.",
				"To control what enters and leaves the cell.",
				"To make food using sunlight.",
			],
			answerIndex: 1,
			explanation:
				"Mitochondria are often called the 'powerhouses' of the cell because they generate most of the cell's supply of energy (ATP).",
		},
		{
			id: 2,
			question:
				"Which two substances do plants need to take in to perform photosynthesis?",
			options: [
				"Oxygen and glucose",
				"Carbon dioxide and water",
				"Nitrogen and soil",
				"Carbon dioxide and oxygen",
			],
			answerIndex: 1,
			explanation:
				"Plants use carbon dioxide from the air and water from the soil, along with sunlight, to produce food (glucose).",
		},
		{
			id: 3,
			question:
				"In a forest ecosystem, which of the following is considered a primary consumer?",
			options: ["A hawk", "A wolf", "A rabbit", "A pine tree"],
			answerIndex: 2,
			explanation:
				"Primary consumers are herbivores that eat producers (plants). A rabbit eats grass and plants.",
		},
		{
			id: 4,
			question: "What is the main role of red blood cells in the human body?",
			options: [
				"To fight off infections and diseases.",
				"To digest food and absorb nutrients.",
				"To carry oxygen to all parts of the body.",
				"To send electrical signals to the brain.",
			],
			answerIndex: 2,
			explanation:
				"Red blood cells contain hemoglobin, a protein that binds to oxygen in the lungs and carries it throughout the body.",
		},
		{
			id: 5,
			question:
				"Which of the following structures is found in plant cells but NOT in animal cells?",
			options: ["Cell membrane", "Nucleus", "Cytoplasm", "Cell wall"],
			answerIndex: 3,
			explanation:
				"Plant cells have a rigid cell wall outside the cell membrane that provides structure and support, which animal cells lack.",
		},
		{
			id: 6,
			question:
				"Where in the human digestive system does most of the absorption of nutrients take place?",
			options: ["Stomach", "Small intestine", "Large intestine", "Esophagus"],
			answerIndex: 1,
			explanation:
				"The small intestine has tiny finger-like projections called villi that absorb nutrients from digested food into the bloodstream.",
		},
		{
			id: 7,
			question: "Which of the following is an example of an inherited trait?",
			options: [
				"Knowing how to ride a bicycle.",
				"Having naturally brown eyes.",
				"Speaking two different languages.",
				"Having a scar from a scraped knee.",
			],
			answerIndex: 1,
			explanation:
				"Inherited traits are characteristics passed down from parents through DNA, such as eye color or blood type.",
		},
		{
			id: 8,
			question: "Which part of a flower produces pollen?",
			options: ["Petal", "Pistil", "Stamen", "Sepal"],
			answerIndex: 2,
			explanation:
				"The stamen is the male reproductive part of the flower, and its anther produces pollen grains.",
		},
		{
			id: 9,
			question: "What kind of skeleton do insects, crabs, and spiders have?",
			options: [
				"Endoskeleton",
				"Exoskeleton",
				"Hydrostatic skeleton",
				"Cartilaginous skeleton",
			],
			answerIndex: 1,
			explanation:
				"Invertebrates like insects and crustaceans have an exoskeleton, which is a hard outer shell that protects their bodies.",
		},
		{
			id: 10,
			question: "What is the main function of the human respiratory system?",
			options: [
				"To pump blood around the body.",
				"To break down food into energy.",
				"To filter waste from the blood.",
				"To exchange oxygen and carbon dioxide.",
			],
			answerIndex: 3,
			explanation:
				"The respiratory system takes in oxygen when we inhale and removes carbon dioxide when we exhale.",
		},
	];

	const fallbackPhysicalScience: ScienceQuestion[] = [
		{
			id: 1,
			question:
				"Which state of matter has a definite volume but no definite shape?",
			options: ["Solid", "Liquid", "Gas", "Plasma"],
			answerIndex: 1,
			explanation:
				"Liquids take the shape of their container but maintain a constant volume.",
		},
		{
			id: 2,
			question:
				"According to Newton's First Law of Motion, an object at rest will stay at rest unless acted upon by:",
			options: [
				"An unbalanced force",
				"A balanced force",
				"Friction",
				"Gravity",
			],
			answerIndex: 0,
			explanation:
				"This is the law of inertia. A change in motion requires a net (unbalanced) force to be applied.",
		},
		{
			id: 3,
			question: "Which of the following is an example of potential energy?",
			options: [
				"A rolling bowling ball",
				"A stretched rubber band",
				"A blowing wind",
				"A spinning turbine",
			],
			answerIndex: 1,
			explanation:
				"Potential energy is stored energy. A stretched rubber band holds elastic potential energy.",
		},
		{
			id: 4,
			question: "What type of simple machine is a seesaw on a playground?",
			options: ["Inclined plane", "Pulley", "Lever", "Wedge"],
			answerIndex: 2,
			explanation:
				"A seesaw is a Class 1 lever, consisting of a rigid bar that pivots on a fixed point called a fulcrum.",
		},
		{
			id: 5,
			question:
				"How is heat transferred from a hot stove to a metal frying pan?",
			options: ["Conduction", "Convection", "Radiation", "Insulation"],
			answerIndex: 0,
			explanation:
				"Conduction is the transfer of thermal energy through direct contact between materials.",
		},
		{
			id: 6,
			question: "What happens when light passes from air into a glass prism?",
			options: [
				"It is completely absorbed.",
				"It speeds up and changes color.",
				"It bends, a process called refraction.",
				"It bounces back, a process called reflection.",
			],
			answerIndex: 2,
			explanation:
				"Refraction occurs when light changes speed as it enters a new medium, causing the light rays to bend.",
		},
		{
			id: 7,
			question: "An object will float in water if its density is:",
			options: [
				"Greater than the density of water.",
				"Less than the density of water.",
				"Exactly equal to its mass.",
				"Constantly changing.",
			],
			answerIndex: 1,
			explanation:
				"Objects with a density lower than the fluid they are in will float due to buoyant force.",
		},
		{
			id: 8,
			question: "Which material is a good electrical insulator?",
			options: ["Copper wire", "Saltwater", "Aluminum foil", "Rubber"],
			answerIndex: 3,
			explanation:
				"Insulators do not allow electrical current to flow easily. Rubber is widely used to coat electrical wires for safety.",
		},
		{
			id: 9,
			question:
				"If you bring the north pole of one magnet close to the south pole of another magnet, they will:",
			options: [
				"Repel each other",
				"Attract each other",
				"Lose their magnetism",
				"Spin in circles",
			],
			answerIndex: 1,
			explanation:
				"In magnetism, opposite poles (North and South) attract each other, while like poles repel.",
		},
		{
			id: 10,
			question: "Unlike light waves, sound waves CANNOT travel through:",
			options: [
				"Solid wood",
				"Liquid water",
				"A vacuum (empty space)",
				"Dense gases",
			],
			answerIndex: 2,
			explanation:
				"Sound is a mechanical wave that requires a medium (solid, liquid, or gas) to vibrate. It cannot travel through a vacuum.",
		},
	];

	function sanitizeQuestions(raw: unknown): ScienceQuestion[] {
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
			.filter((item): item is ScienceQuestion => item !== null);

		return normalized;
	}

	async function fetchOpenRouterQuestions(): Promise<ScienceQuestion[] | null> {
		const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
		if (!apiKey) {
			console.error("Missing OpenRouter API key");
			return null;
		}

		const categoryPrompt =
			category === "life" ? "Life Science" : "Physical Science";
		const prompt = [
			`Create exactly 20 diverse multiple-choice ${categoryPrompt} questions tailored for upper elementary students (focusing heavily on Grades 5 and 6 competencies).`,
			"Return exactly 20 items in a JSON format.",
			"Each object must have the following keys: question, options, answerIndex, explanation.",
			"Rules:",
			"- options must always have exactly 4 answer choices.",
			"- answerIndex must be 0, 1, 2, or 3.",
			"- tone and vocabulary must be age-appropriate for Grades 5 and 6.",
			"- explanations must be concise, accurate, and explain the 'why' behind the correct answer.",
			"- CONTEXTUAL QUESTIONS: Briefly introduce a scenario or definition first. Example: 'A simple machine makes work easier by changing the direction or amount of force. Which of the following is an example of a wedge?'",
			"",
			"CURRICULUM SCOPE (Select a broad, randomized mix from these advanced Grade 5-6 concepts):",
			category === "life"
				? [
						"- Plant Biology (Photosynthesis, cellular respiration, transpiration, parts of a flower)",
						"- Animal Biology (Vertebrates vs. invertebrates, warm-blooded vs. cold-blooded)",
						"- Human Body Systems (Digestive, circulatory, respiratory, nervous, skeletal, muscular)",
						"- Cells and Heredity (Plant vs. animal cells, organelles, inherited traits vs. acquired traits)",
						"- Ecosystems and Biomes (Food chains/webs, producers/consumers/decomposers, energy pyramids)",
						"- Adaptations (Structural and behavioral adaptations for survival)",
						"- Environmental Science (Renewable vs. non-renewable resources, human impact on ecosystems)",
					].join("\n")
				: [
						"- States and Properties of Matter (Solids, liquids, gases, physical vs. chemical changes, mixtures/solutions)",
						"- Force and Motion (Newton's Laws, gravity, friction, inertia, speed and velocity basics)",
						"- Energy Forms and Transformation (Potential vs. kinetic, thermal, light, sound, electrical)",
						"- Heat Transfer (Conduction, convection, radiation)",
						"- Electricity and Magnetism (Circuits, conductors/insulators, magnetic fields, electromagnets)",
						"- Light and Sound (Reflection, refraction, absorption, pitch, volume, mediums)",
						"- Simple and Compound Machines (Levers, pulleys, inclined planes, wedges, screws, wheel & axle)",
					].join("\n"),
		].join("\n");

		try {
			const response = await fetch(
				"https://openrouter.ai/api/v1/chat/completions",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${apiKey}`,
						"HTTP-Referer": window.location.origin,
						"X-Title": "Science Quiz App",
					},
					body: JSON.stringify({
						model: "openai/gpt-4o-mini",
						messages: [
							{
								role: "system",
								content:
									"You are a strict JSON generator for advanced upper elementary science worksheets. Mix up the question types and curriculum concepts evenly across all 20 items so the worksheet represents a comprehensive Grade 6 level test. Return valid JSON containing a 'questions' array. Return nothing else.",
							},
							{ role: "user", content: prompt },
						],
						response_format: { type: "json_object" },
						temperature: 0.7,
						max_tokens: 4000,
					}),
				},
			);

			if (!response.ok) {
				throw new Error(`OpenRouter request failed: ${response.status}`);
			}

			const data = await response.json();
			const text = data?.choices?.[0]?.message?.content;
			if (typeof text !== "string") {
				return null;
			}

			let parsed: unknown;
			try {
				parsed = JSON.parse(text);
			} catch (e) {
				console.error("Failed to parse JSON:", text);
				return null;
			}

			if (
				typeof parsed === "object" &&
				parsed !== null &&
				"questions" in parsed &&
				Array.isArray((parsed as { questions: unknown }).questions)
			) {
				return sanitizeQuestions(
					(parsed as { questions: unknown[] }).questions,
				);
			}

			return sanitizeQuestions(parsed);
		} catch (error) {
			console.error("Error fetching questions:", error);
			return fallbackQuestions();
		}
	}

	function initializeStates(nextQuestions: ScienceQuestion[]) {
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
			const generated = await fetchOpenRouterQuestions();
			if (generated && generated.length >= 10) {
				questions = generated.slice(0, 10).map((question, index) => ({
					...question,
					id: index + 1,
				}));
				source = "groq";
				generationMessage = "Questions generated with AI API.";
			} else {
				questions =
					category === "life" ? fallbackLifeScience : fallbackPhysicalScience;
				source = "fallback";
				generationMessage = "Using built-in Grade 4-6 questions.";
			}
		} catch {
			questions =
				category === "life" ? fallbackLifeScience : fallbackPhysicalScience;
			source = "fallback";
			generationMessage =
				"AI request failed, so built-in questions are shown instead.";
		} finally {
			initializeStates(questions);
			loading = false;
		}
	}

	function selectOption(question: ScienceQuestion, optionIndex: number) {
		const previous = selectedAnswers.get(question.id);
		if (optionIndex !== question.answerIndex && previous !== optionIndex) {
			wrongRetries += 1;
		}

		selectedAnswers.set(question.id, optionIndex);
		answerStates.set(
			question.id,
			optionIndex === question.answerIndex ? "correct" : "incorrect",
		);
		selectedAnswers = new Map(selectedAnswers);
		answerStates = new Map(answerStates);
	}

	$: if (category !== loadedCategory) {
		loadedCategory = category;
		loadQuestions();
	}

	$: correctCount = Array.from(answerStates.values()).filter(
		(state) => state === "correct",
	).length;
	$: answeredCount = Array.from(answerStates.values()).filter(
		(state) => state !== "unanswered",
	).length;
	$: isCompleted = questions.length > 0 && correctCount === questions.length;
	$: tokensEarned = Math.floor(questions.length / 5);

	function fallbackQuestions() {
		return category === "life" ? fallbackLifeScience : fallbackPhysicalScience;
	}
</script>

<div class="worksheet-container">
	<div class="worksheet-header">
		<div>
			<h2>
				{category === "life" ? "Life Science" : "Physical Science"} Worksheet
			</h2>
			<p>
				Choose the best answer to demonstrate your scientific understanding.
			</p>
			<p class="source-info" class:fallback={source === "fallback"}>
				{generationMessage}
			</p>
		</div>
		<div class="stats">
			<span class="pill correct-pill"
				>Correct: {correctCount}/{questions.length}</span
			>
			<span class="pill answered-pill"
				>Answered: {answeredCount}/{questions.length}</span
			>
			<span class="pill wrong-pill">Wrong Retries: {wrongRetries}</span>
			<span class="pill token-pill">Token Rate: 1 per 5 items</span>
			<button on:click={loadQuestions} disabled={loading}>
				{loading ? "Loading..." : "New Questions"}
			</button>
		</div>
	</div>

	{#if isCompleted}
		<CompletionCertificate
			worksheetTitle={category === "life"
				? "Life Science Worksheet"
				: "Physical Science Worksheet"}
			totalItems={questions.length}
			{wrongRetries}
			{startedAt}
			{tokensEarned}
			tokenName="Science Token"
		/>
	{/if}

	{#if loading}
		<div class="loading">Generating scientific questions...</div>
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
								class:selected={selectedAnswers.get(question.id) ===
									optionIndex}
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
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
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
		color: #059669; /* Changed to green for science theme */
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

	.pill {
		color: white;
		padding: 0.45rem 0.7rem;
		border-radius: 6px;
		font-weight: 600;
	}

	.correct-pill {
		background: #10b981;
	} /* Emerald */
	.answered-pill {
		background: #3b82f6;
	} /* Blue */
	.wrong-pill {
		background: #f43f5e;
	} /* Rose */
	.token-pill {
		background: #8b5cf6;
	} /* Violet */

	.stats button {
		border: none;
		background: #f59e0b;
		color: white;
		padding: 0.5rem 0.8rem;
		border-radius: 6px;
		font-weight: 700;
		cursor: pointer;
		transition: background 0.2s;
	}

	.stats button:hover:not(:disabled) {
		background: #d97706;
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
		padding: 1.2rem;
		display: flex;
		flex-direction: column;
		gap: 0.8rem;
		transition:
			border-color 0.2s,
			background-color 0.2s;
	}

	.question-card h3 {
		margin: 0;
		font-size: 1.05rem;
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
		padding: 0.6rem 0.8rem;
		background: #f8fafc;
		cursor: pointer;
		font-size: 0.95rem;
		transition: background-color 0.2s;
	}

	.option:hover {
		background: #e2e8f0;
	}

	.option.selected {
		border-color: #059669; /* Science green */
		background: #d1fae5;
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
		padding-top: 0.5rem;
		border-top: 1px solid #cbd5e1;
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
