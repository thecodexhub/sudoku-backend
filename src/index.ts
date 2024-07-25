import * as z from "zod";
import "dotenv/config";

import { configureGenkit } from "@genkit-ai/core";
import { defineFlow, startFlowsServer } from "@genkit-ai/flow";
import { googleAI } from "@genkit-ai/googleai";
import { defineHelper, dotprompt, prompt } from "@genkit-ai/dotprompt";

import { CreateSudokuSchema } from "./schemas/create-sudoku-schema";
import { HintOutputSchema } from "./schemas/hint-output-schema";
import { format2DArray, getRandomSudoku } from "./random-sudoku";
import { NextFunction, Request, Response } from "express";

// Configure genkit with Google AI and Dot Prompt.
configureGenkit({
  plugins: [googleAI({ apiVersion: ["v1beta"] }), dotprompt()],
  logLevel: "debug",
  enableTracingAndMetrics: true,
});

// Error when setting `req.auth` in middleware: Property 'auth' does
// not exist on type 'Request<ParamsDictionary>'.
// https://stackoverflow.com/questions/44383387/typescript-error-property-user-does-not-exist-on-type-request
declare module "express" {
  export interface Request {
    auth?: string;
  }
}

/**
 * Handlebars helper that picks a sudoku randomly based on difficulty
 * and formats the 2-D array. Used in hint generation dot prompt.
 */
defineHelper("sample", (difficulty: string) => {
  const { solution, puzzle } = getRandomSudoku(difficulty);
  return `## Solution
  ${format2DArray(solution)}
  
  ## Puzzle
  ${format2DArray(puzzle)}`;
});

/**
 * Difficulty schema, used as the input schema definition for the `createSudokuFlow`.
 */
const difficultySchema = z.object({
  difficulty: z.string(),
});

/**
 * Hint schema, used as the input schema definition for the `generateHintFlow`.
 */
const hintSchema = z.object({
  solution: z.array(z.array(z.number())),
  puzzle: z.array(z.array(z.number())),
});

/**
 * Determines whether the provided sudoku is valid or not.
 *
 * The validation is checked in 3 stages:
 * - Every row must have 1 to 9 numbers without duplicates
 * - Every column must have 1 to 9 numbers without duplicates
 * - And every subgrid must have 1 to 9 numbers without duplicates
 * @param solution - Solution object from the generated puzzle
 * @returns {boolean} true if the puzzle is valid, otherwise false.
 */
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

/**
 * Flow definition for creating sudoku.
 */
const createSudokuFlow = defineFlow(
  {
    name: "createSudokuFlow",
    inputSchema: difficultySchema,
    outputSchema: CreateSudokuSchema,
    middleware: [
      (req: Request, res: Response, next: NextFunction) => {
        const apiToken = req.headers["x-api-key"] as string | undefined;
        req.auth = apiToken;
        next();
      },
    ],
    authPolicy: (auth) => {
      if (auth !== process.env.API_KEY) {
        throw new Error("Authorization required!");
      }
    },
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

    console.log(
      "Gemini couldn't generate valid puzzle. Responding with Pre-defined Sudoku."
    );
    return getRandomSudoku(input.difficulty);
  }
);

/**
 * Flow definition for generating hints.
 */
const generateHintFlow = defineFlow(
  {
    name: "generateHintFlow",
    inputSchema: hintSchema,
    outputSchema: HintOutputSchema,
    middleware: [
      (req: Request, res: Response, next: NextFunction) => {
        const apiToken = req.headers["x-api-key"] as string | undefined;
        req.auth = apiToken;
        next();
      },
    ],
    authPolicy: (auth) => {
      if (auth !== process.env.API_KEY) {
        throw new Error("Authorization required!");
      }
    },
  },
  async (input) => {
    const dPrompt = await prompt<z.infer<typeof hintSchema>>("generate-hint");
    const result = await dPrompt.generate({ input });
    const response: z.infer<typeof HintOutputSchema> = result.output();

    return response;
  }
);

// Starting the flow server.
startFlowsServer({
  port: parseInt(process.env.PORT || "3400"),
  flows: [createSudokuFlow, generateHintFlow],
});
