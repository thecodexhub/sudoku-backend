import { defineSchema } from "@genkit-ai/core";
import * as z from "zod";

export const HintOutputSchema = defineSchema(
  "HintOutputSchema",
  z.object({
    cell: z.array(z.number().min(0).max(8)).length(2),
    entry: z.number().min(1).max(9),
    observation: z.string(),
    explanation: z.string(),
    solution: z.string(),
  })
);
