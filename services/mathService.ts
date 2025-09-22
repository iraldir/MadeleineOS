import { MathProblem } from '@/types/math';
import { progressService } from './progressService';

class MathService {
  private static instance: MathService;

  private constructor() {}

  public static getInstance(): MathService {
    if (!MathService.instance) {
      MathService.instance = new MathService();
    }
    return MathService.instance;
  }

  public generateProblem(difficulty?: 'easy' | 'medium' | 'hard'): MathProblem {
    const actualDifficulty = difficulty || progressService.getMathDifficulty();
    
    switch (actualDifficulty) {
      case 'easy':
        return this.generateEasyProblem();
      case 'medium':
        return this.generateMediumProblem();
      case 'hard':
        return this.generateHardProblem();
      default:
        return this.generateEasyProblem();
    }
  }

  private generateEasyProblem(): MathProblem {
    // Easy: numbers 1-5, addition only
    const num1 = Math.floor(Math.random() * 5) + 1;
    const num2 = Math.floor(Math.random() * 5) + 1;
    return {
      num1,
      num2,
      operation: '+',
      answer: num1 + num2
    };
  }

  private generateMediumProblem(): MathProblem {
    const operations: ('+' | '-')[] = ['+', '-'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    if (operation === '+') {
      // Medium addition: numbers 1-10, sum <= 15
      const num1 = Math.floor(Math.random() * 10) + 1;
      const num2 = Math.floor(Math.random() * Math.min(15 - num1, 10)) + 1;
      return {
        num1,
        num2,
        operation,
        answer: num1 + num2
      };
    } else {
      // Medium subtraction: result 1-10
      const num1 = Math.floor(Math.random() * 10) + 6; // 6-15
      const num2 = Math.floor(Math.random() * (num1 - 1)) + 1;
      return {
        num1,
        num2,
        operation,
        answer: num1 - num2
      };
    }
  }

  private generateHardProblem(): MathProblem {
    const operations: ('+' | '-')[] = ['+', '-'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    if (operation === '+') {
      // Hard addition: numbers 5-15, sum <= 20
      const num1 = Math.floor(Math.random() * 11) + 5;
      const num2 = Math.floor(Math.random() * Math.min(20 - num1, 11)) + 5;
      return {
        num1,
        num2,
        operation,
        answer: num1 + num2
      };
    } else {
      // Hard subtraction: larger numbers
      const num1 = Math.floor(Math.random() * 10) + 11; // 11-20
      const num2 = Math.floor(Math.random() * 10) + 1; // 1-10
      return {
        num1,
        num2,
        operation,
        answer: num1 - num2
      };
    }
  }

  public generateProgressiveProblem(attemptNumber: number): MathProblem {
    // Start easy and gradually increase difficulty
    if (attemptNumber <= 3) {
      return this.generateEasyProblem();
    } else if (attemptNumber <= 7) {
      return this.generateMediumProblem();
    } else {
      return this.generateHardProblem();
    }
  }

  public validateAnswer(problem: MathProblem, userAnswer: number): boolean {
    return userAnswer === problem.answer;
  }
}

export const mathService = MathService.getInstance();