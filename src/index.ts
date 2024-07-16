import * as z from "zod";

import { configureGenkit } from "@genkit-ai/core";
import { defineFlow, startFlowsServer } from "@genkit-ai/flow";

import { googleAI } from "@genkit-ai/googleai";
import { CreateSudokuSchema } from "./schemas/create-sudoku-schema";
import { dotprompt, prompt } from "@genkit-ai/dotprompt";

configureGenkit({
  plugins: [googleAI(), dotprompt()],
  logLevel: "debug",
  enableTracingAndMetrics: true,
});

const difficultySchema = z.object({
  difficulty: z.string(),
});

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

    const c = response.puzzle.flat().filter((e) => e === -1).length;
    console.log(`********** Empty cells count: ${c}`);

    return response;
  }
);

startFlowsServer({
  port: parseInt(process.env.PORT || "3400"),
  flows: [createSudokuFlow],
});
