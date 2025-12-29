export interface Fraction {
  numerator: number;
  denominator: number;
}

export interface FractionProblem {
  id: number;
  fraction1: Fraction;
  fraction2: Fraction;
  operation: '+' | '-' | '×' | '÷';
  answer: Fraction;
}

export interface UserAnswer {
  numerator: string;
  denominator: string;
}

// Generate random fraction
export function generateRandomFraction(maxNumerator: number = 12, maxDenominator: number = 12): Fraction {
  const numerator = Math.floor(Math.random() * maxNumerator) + 1;
  const denominator = Math.floor(Math.random() * maxDenominator) + 1;
  return { numerator, denominator };
}

// Greatest Common Divisor
function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

// Simplify fraction
export function simplifyFraction(fraction: Fraction): Fraction {
  const divisor = gcd(Math.abs(fraction.numerator), Math.abs(fraction.denominator));
  return {
    numerator: fraction.numerator / divisor,
    denominator: fraction.denominator / divisor
  };
}

// Add fractions
export function addFractions(f1: Fraction, f2: Fraction): Fraction {
  const numerator = f1.numerator * f2.denominator + f2.numerator * f1.denominator;
  const denominator = f1.denominator * f2.denominator;
  return simplifyFraction({ numerator, denominator });
}

// Subtract fractions
export function subtractFractions(f1: Fraction, f2: Fraction): Fraction {
  const numerator = f1.numerator * f2.denominator - f2.numerator * f1.denominator;
  const denominator = f1.denominator * f2.denominator;
  return simplifyFraction({ numerator, denominator });
}

// Multiply fractions
export function multiplyFractions(f1: Fraction, f2: Fraction): Fraction {
  const numerator = f1.numerator * f2.numerator;
  const denominator = f1.denominator * f2.denominator;
  return simplifyFraction({ numerator, denominator });
}

// Divide fractions
export function divideFractions(f1: Fraction, f2: Fraction): Fraction {
  const numerator = f1.numerator * f2.denominator;
  const denominator = f1.denominator * f2.numerator;
  return simplifyFraction({ numerator, denominator });
}

// Generate a fraction problem
export function generateFractionProblem(id: number): FractionProblem {
  const operations: ('+' | '-' | '×' | '÷')[] = ['+', '-', '×', '÷'];
  const operation = operations[Math.floor(Math.random() * operations.length)];
  
  let fraction1 = generateRandomFraction();
  let fraction2 = generateRandomFraction();
  
  // Ensure subtraction doesn't result in negative answers
  if (operation === '-') {
    const temp1 = fraction1.numerator * fraction2.denominator;
    const temp2 = fraction2.numerator * fraction1.denominator;
    if (temp1 < temp2) {
      [fraction1, fraction2] = [fraction2, fraction1];
    }
  }
  
  let answer: Fraction;
  switch (operation) {
    case '+':
      answer = addFractions(fraction1, fraction2);
      break;
    case '-':
      answer = subtractFractions(fraction1, fraction2);
      break;
    case '×':
      answer = multiplyFractions(fraction1, fraction2);
      break;
    case '÷':
      answer = divideFractions(fraction1, fraction2);
      break;
  }
  
  return { id, fraction1, fraction2, operation, answer };
}

// Check if user answer is correct
export function checkAnswer(problem: FractionProblem, userAnswer: UserAnswer): boolean {
  const userNum = parseInt(userAnswer.numerator);
  const userDen = parseInt(userAnswer.denominator);
  
  if (isNaN(userNum) || isNaN(userDen) || userDen === 0) {
    return false;
  }
  
  const userFraction = simplifyFraction({ numerator: userNum, denominator: userDen });
  const correctAnswer = problem.answer;
  
  return userFraction.numerator === correctAnswer.numerator && 
         userFraction.denominator === correctAnswer.denominator;
}

// Generate 100 fraction problems (25 of each operation)
export function generateFractionWorksheet(): FractionProblem[] {
  const problems: FractionProblem[] = [];
  const operations: ('+' | '-' | '×' | '÷')[] = ['+', '-', '×', '÷'];
  
  let id = 1;
  for (const operation of operations) {
    for (let i = 0; i < 25; i++) {
      let fraction1 = generateRandomFraction();
      let fraction2 = generateRandomFraction();
      
      // Ensure subtraction doesn't result in negative answers
      if (operation === '-') {
        const temp1 = fraction1.numerator * fraction2.denominator;
        const temp2 = fraction2.numerator * fraction1.denominator;
        if (temp1 < temp2) {
          [fraction1, fraction2] = [fraction2, fraction1];
        }
      }
      
      let answer: Fraction;
      switch (operation) {
        case '+':
          answer = addFractions(fraction1, fraction2);
          break;
        case '-':
          answer = subtractFractions(fraction1, fraction2);
          break;
        case '×':
          answer = multiplyFractions(fraction1, fraction2);
          break;
        case '÷':
          answer = divideFractions(fraction1, fraction2);
          break;
      }
      
      problems.push({ id: id++, fraction1, fraction2, operation, answer });
    }
  }
  
  // Shuffle the problems
  for (let i = problems.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [problems[i], problems[j]] = [problems[j], problems[i]];
  }
  
  return problems;
}