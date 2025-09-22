export interface MathProblem {
  num1: number;
  num2: number;
  operation: '+' | '-';
  answer: number;
}

export function generateMathProblem(): MathProblem {
  const operations: ('+' | '-')[] = ['+', '-'];
  const operation = operations[Math.floor(Math.random() * operations.length)];
  
  let num1: number;
  let num2: number;
  
  if (operation === '+') {
    // Generate numbers that sum up to 20 or less
    num1 = Math.floor(Math.random() * 15) + 1; // 1-15
    num2 = Math.floor(Math.random() * Math.min(20 - num1, 15)) + 1; // Ensure sum <= 20
  } else {
    // For subtraction, ensure positive results
    num1 = Math.floor(Math.random() * 15) + 6; // 6-20
    num2 = Math.floor(Math.random() * num1) + 1; // 1 to num1
  }
  
  const answer = operation === '+' ? num1 + num2 : num1 - num2;
  
  return { num1, num2, operation, answer };
}

export type MathLevel = {
  num1: number;
  num2: number;
  operation: '+' | '-';
  showApples: boolean;
}

export const mathProgression: MathLevel[] = [
  // Start with simple additions
  { num1: 1, num2: 1, operation: '+', showApples: false },
  { num1: 2, num2: 1, operation: '+', showApples: false },
  { num1: 2, num2: 2, operation: '+', showApples: false },
  { num1: 3, num2: 2, operation: '+', showApples: false },
  { num1: 4, num2: 3, operation: '+', showApples: false },
  
  // Gradually increase difficulty
  { num1: 5, num2: 3, operation: '+', showApples: false },
  { num1: 6, num2: 4, operation: '+', showApples: false },
  { num1: 7, num2: 5, operation: '+', showApples: false },
  { num1: 8, num2: 6, operation: '+', showApples: false },
  { num1: 9, num2: 7, operation: '+', showApples: false },
  
  // Approach 20
  { num1: 10, num2: 8, operation: '+', showApples: false },
  { num1: 11, num2: 9, operation: '+', showApples: false },
  { num1: 12, num2: 8, operation: '+', showApples: false },
  { num1: 13, num2: 7, operation: '+', showApples: false },
  { num1: 14, num2: 6, operation: '+', showApples: false },
  
  // Simple subtractions
  { num1: 5, num2: 2, operation: '-', showApples: false },
  { num1: 7, num2: 3, operation: '-', showApples: false },
  { num1: 9, num2: 4, operation: '-', showApples: false },
  { num1: 10, num2: 5, operation: '-', showApples: false },
  { num1: 12, num2: 6, operation: '-', showApples: false },
  
  // Harder subtractions
  { num1: 15, num2: 7, operation: '-', showApples: false },
  { num1: 18, num2: 9, operation: '-', showApples: false },
  { num1: 20, num2: 10, operation: '-', showApples: false },
  { num1: 19, num2: 8, operation: '-', showApples: false },
  { num1: 17, num2: 9, operation: '-', showApples: false },
  
  // Mixed harder problems
  { num1: 8, num2: 9, operation: '+', showApples: false },
  { num1: 7, num2: 8, operation: '+', showApples: false },
  { num1: 16, num2: 7, operation: '-', showApples: false },
  { num1: 9, num2: 9, operation: '+', showApples: false },
  { num1: 20, num2: 12, operation: '-', showApples: false },
]; 