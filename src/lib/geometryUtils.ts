export type FlatShape = "square" | "rectangle" | "circle" | "triangle" | "parallelogram";
export type FlatMetric = "area" | "perimeter";

export interface FlatDimensions {
	side?: number;
	width?: number;
	height?: number;
	radius?: number;
	base?: number;
	a?: number;
	b?: number;
	c?: number;
	slantHeight?: number;
	length?: number;
}

export interface FlatGeometryProblem {
	id: number;
	shape: FlatShape;
	metric: FlatMetric;
	dimensions: FlatDimensions;
	answer: number;
	answerText: string;
}

export type SolidShape =
	| "cube"
	| "triangular pyramid"
	| "rectangular prism"
	| "cone"
	| "cylinder"
	| "sphere";

export type SolidMetric = "surface area" | "volume";

export interface SolidGeometryProblem {
	id: number;
	shape: SolidShape;
	metric: SolidMetric;
	dimensions: FlatDimensions;
	answer: number;
	answerText: string;
}

function randomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function roundTo(value: number, places: number = 2): number {
	const multiplier = 10 ** places;
	return Math.round(value * multiplier) / multiplier;
}

function asText(value: number): string {
	return Number.isInteger(value) ? `${value}` : value.toFixed(2);
}

function triangleSides(): { a: number; b: number; c: number } {
	let a = randomInt(4, 18);
	let b = randomInt(4, 18);
	let c = randomInt(4, 18);

	while (a + b <= c || a + c <= b || b + c <= a) {
		a = randomInt(4, 18);
		b = randomInt(4, 18);
		c = randomInt(4, 18);
	}

	return { a, b, c };
}

function generateFlatProblem(id: number): FlatGeometryProblem {
	const shapes: FlatShape[] = [
		"square",
		"rectangle",
		"circle",
		"triangle",
		"parallelogram",
	];
	const shape = shapes[Math.floor(Math.random() * shapes.length)];
	const metric: FlatMetric = Math.random() > 0.5 ? "area" : "perimeter";

	switch (shape) {
		case "square": {
			const side = randomInt(3, 20);
			const answer = metric === "area" ? side * side : 4 * side;
			return {
				id,
				shape,
				metric,
				dimensions: { side },
				answer,
				answerText: asText(answer),
			};
		}
		case "rectangle": {
			const width = randomInt(4, 20);
			const height = randomInt(3, 16);
			const answer = metric === "area" ? width * height : 2 * (width + height);
			return {
				id,
				shape,
				metric,
				dimensions: { width, height },
				answer,
				answerText: asText(answer),
			};
		}
		case "circle": {
			const radius = randomInt(2, 12);
			const answer =
				metric === "area"
					? roundTo(Math.PI * radius * radius)
					: roundTo(2 * Math.PI * radius);
			return {
				id,
				shape,
				metric,
				dimensions: { radius },
				answer,
				answerText: asText(answer),
			};
		}
		case "triangle": {
			if (metric === "area") {
				const base = randomInt(4, 20);
				const height = randomInt(3, 14);
				const answer = roundTo(0.5 * base * height);
				return {
					id,
					shape,
					metric,
					dimensions: { base, height },
					answer,
					answerText: asText(answer),
				};
			}

			const { a, b, c } = triangleSides();
			const answer = a + b + c;
			return {
				id,
				shape,
				metric,
				dimensions: { a, b, c },
				answer,
				answerText: asText(answer),
			};
		}
		case "parallelogram": {
			const base = randomInt(5, 20);
			const side = randomInt(4, 14);
			const height = randomInt(3, 12);
			const answer = metric === "area" ? base * height : 2 * (base + side);
			return {
				id,
				shape,
				metric,
				dimensions: { base, side, height },
				answer,
				answerText: asText(answer),
			};
		}
	}
}

function generateSolidProblem(id: number): SolidGeometryProblem {
	const shapes: SolidShape[] = [
		"cube",
		"triangular pyramid",
		"rectangular prism",
		"cone",
		"cylinder",
		"sphere",
	];
	const shape = shapes[Math.floor(Math.random() * shapes.length)];
	const metric: SolidMetric = Math.random() > 0.5 ? "surface area" : "volume";

	switch (shape) {
		case "cube": {
			const side = randomInt(2, 12);
			const answer = metric === "surface area" ? 6 * side * side : side ** 3;
			return {
				id,
				shape,
				metric,
				dimensions: { side },
				answer,
				answerText: asText(answer),
			};
		}
		case "triangular pyramid": {
			const side = randomInt(4, 12);
			const slantHeight = randomInt(5, 14);
			const height = randomInt(4, 12);
			const baseArea = (Math.sqrt(3) / 4) * side * side;
			const answer =
				metric === "surface area"
					? roundTo(baseArea + (3 * side * slantHeight) / 2)
					: roundTo((baseArea * height) / 3);
			return {
				id,
				shape,
				metric,
				dimensions: { side, slantHeight, height },
				answer,
				answerText: asText(answer),
			};
		}
		case "rectangular prism": {
			const length = randomInt(4, 16);
			const width = randomInt(3, 14);
			const height = randomInt(2, 12);
			const answer =
				metric === "surface area"
					? 2 * (length * width + length * height + width * height)
					: length * width * height;
			return {
				id,
				shape,
				metric,
				dimensions: { length, width, height },
				answer,
				answerText: asText(answer),
			};
		}
		case "cone": {
			const radius = randomInt(3, 10);
			const height = randomInt(4, 14);
			const slantHeight = roundTo(Math.sqrt(radius * radius + height * height));
			const answer =
				metric === "surface area"
					? roundTo(Math.PI * radius * (radius + slantHeight))
					: roundTo((Math.PI * radius * radius * height) / 3);
			return {
				id,
				shape,
				metric,
				dimensions: { radius, height, slantHeight },
				answer,
				answerText: asText(answer),
			};
		}
		case "cylinder": {
			const radius = randomInt(2, 9);
			const height = randomInt(4, 16);
			const answer =
				metric === "surface area"
					? roundTo(2 * Math.PI * radius * (radius + height))
					: roundTo(Math.PI * radius * radius * height);
			return {
				id,
				shape,
				metric,
				dimensions: { radius, height },
				answer,
				answerText: asText(answer),
			};
		}
		case "sphere": {
			const radius = randomInt(3, 10);
			const answer =
				metric === "surface area"
					? roundTo(4 * Math.PI * radius * radius)
					: roundTo((4 / 3) * Math.PI * radius ** 3);
			return {
				id,
				shape,
				metric,
				dimensions: { radius },
				answer,
				answerText: asText(answer),
			};
		}
	}
}

export function generateAreaPerimeterWorksheet(total: number = 12): FlatGeometryProblem[] {
	const problems: FlatGeometryProblem[] = [];
	for (let i = 1; i <= total; i += 1) {
		problems.push(generateFlatProblem(i));
	}
	return problems;
}

export function generateSurfaceVolumeWorksheet(total: number = 12): SolidGeometryProblem[] {
	const problems: SolidGeometryProblem[] = [];
	for (let i = 1; i <= total; i += 1) {
		problems.push(generateSolidProblem(i));
	}
	return problems;
}

export function isNumericAnswerCorrect(expected: number, actual: string): boolean {
	const parsed = Number.parseFloat(actual);
	if (Number.isNaN(parsed)) {
		return false;
	}

	return Math.abs(parsed - expected) <= 0.05;
}
