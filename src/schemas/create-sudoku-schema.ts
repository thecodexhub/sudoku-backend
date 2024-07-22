import { defineSchema } from "@genkit-ai/core";
import * as z from "zod";

// ------ FOR SOLUTION SCHEMA ------------
const sNumberInRange = z.number().gte(1).lte(9).nonnegative();
const sRowWithNumberInRange = sNumberInRange.array().length(9);

const sValidRow = sRowWithNumberInRange.refine(
  (items) => new Set(items).size === items.length,
  { message: "Must be an array of unique numbers" }
);

const solutionSudokuSchema = z.array(sValidRow).length(9);

// ------ FOR PUZZLE SCHEMA ------------
const pNumberInRange = z.union([sNumberInRange, z.literal(-1)]);
const pRowWithNumberInRange = pNumberInRange.array().length(9);

const pValidRow = pRowWithNumberInRange.refine(
  (items) => {
    const positiveNumberArray = items.filter((item) => item > 0);
    return new Set(positiveNumberArray).size === positiveNumberArray.length;
  },
  { message: "Must be an array of unique positive numbers" }
);

const puzzleSudokuSchema = z.array(pValidRow).length(9);

export const CreateSudokuSchema = defineSchema(
  "CreateSudokuSchema",
  z.object({
    solution: solutionSudokuSchema,
    puzzle: puzzleSudokuSchema,
  })
);
