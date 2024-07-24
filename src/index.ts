import * as z from "zod";

import { configureGenkit } from "@genkit-ai/core";
import { defineFlow, startFlowsServer } from "@genkit-ai/flow";
import { googleAI } from "@genkit-ai/googleai";
import { defineHelper, dotprompt, prompt } from "@genkit-ai/dotprompt";

import { CreateSudokuSchema } from "./schemas/create-sudoku-schema";
import { HintOutputSchema } from "./schemas/hint-output-schema";
import { format2DArray, getRandomSudoku } from "./random-sudoku";

configureGenkit({
  plugins: [googleAI({ apiVersion: ["v1beta"] }), dotprompt()],
  logLevel: "debug",
  enableTracingAndMetrics: true,
});

defineHelper("sample", (difficulty: string) => {
  const { solution, puzzle } = getRandomSudoku(difficulty);
  return `## Solution
  ${format2DArray(solution)}
  
  ## Puzzle
  ${format2DArray(puzzle)}`;
});

const difficultySchema = z.object({
  difficulty: z.string(),
});

const hintSchema = z.object({
  solution: z.array(z.array(z.number())),
  puzzle: z.array(z.array(z.number())),
});

const validateSudoku = (solution: number[][]): boolean => {
  const columns = [];
  for (const index in solution) {
    columns.push(solution.map((row) => row[index]));
  }

  const subGrids = [];
  for (let i = 0; i < 9; i++) {
    subGrids.push([] as number[]);
  }

  for (let x = 0; x < 9; x++) {
    for (let y = 0; y < 9; y++) {
      const subGridX = Math.floor(x / 3);
      const subGridY = Math.floor(y / 3);

      const subGridIndex = subGridX * 3 + subGridY;

      subGrids[subGridIndex].push(solution[x][y]);
    }
  }

  return (
    solution.every((n) => new Set(n).size === 9) &&
    columns.every((n) => new Set(n).size === 9) &&
    subGrids.every((n) => new Set(n).size === 9)
  );
};

const createSudokuFlow = defineFlow(
  {
    name: "createSudokuFlow",
    inputSchema: difficultySchema,
    outputSchema: CreateSudokuSchema,
  },
  async (input) => {
    const dPrompt = await prompt<z.infer<typeof difficultySchema>>(
      "create-sudoku"
    );

    const result = await dPrompt.generate({ input });
    const response: z.infer<typeof CreateSudokuSchema> = result.output();

    if (validateSudoku(response.solution)) {
      console.log("Generated Sudoku with GEMINI");
      return response;
    }

    console.log("Gemini couldn't generate valid puzzle. Responding with Pre-defined Sudoku.");
    return getRandomSudoku(input.difficulty);
  }
);

const generateHintFlow = defineFlow(
  {
    name: "generateHintFlow",
    inputSchema: hintSchema,
    outputSchema: HintOutputSchema,
  },
  async (input) => {
    const dPrompt = await prompt<z.infer<typeof hintSchema>>("generate-hint");
    const result = await dPrompt.generate({ input });
    const response: z.infer<typeof HintOutputSchema> = result.output();

    return response;
  }
);

startFlowsServer({
  port: parseInt(process.env.PORT || "3400"),
  flows: [createSudokuFlow, generateHintFlow],
});
