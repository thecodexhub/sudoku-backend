"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const z = __importStar(require("zod"));
require("dotenv/config");
const core_1 = require("@genkit-ai/core");
const flow_1 = require("@genkit-ai/flow");
const googleai_1 = require("@genkit-ai/googleai");
const dotprompt_1 = require("@genkit-ai/dotprompt");
const create_sudoku_schema_1 = require("./schemas/create-sudoku-schema");
const hint_output_schema_1 = require("./schemas/hint-output-schema");
const random_sudoku_1 = require("./random-sudoku");
// Configure genkit with Google AI and Dot Prompt.
(0, core_1.configureGenkit)({
    plugins: [(0, googleai_1.googleAI)({ apiVersion: ["v1beta"] }), (0, dotprompt_1.dotprompt)()],
    logLevel: "debug",
    enableTracingAndMetrics: true,
});
/**
 * Handlebars helper that picks a sudoku randomly based on difficulty
 * and formats the 2-D array. Used in hint generation dot prompt.
 */
(0, dotprompt_1.defineHelper)("sample", (difficulty) => {
    const { solution, puzzle } = (0, random_sudoku_1.getRandomSudoku)(difficulty);
    return `## Solution
  ${(0, random_sudoku_1.format2DArray)(solution)}
  
  ## Puzzle
  ${(0, random_sudoku_1.format2DArray)(puzzle)}`;
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
const validateSudoku = (solution) => {
    const columns = [];
    for (const index in solution) {
        columns.push(solution.map((row) => row[index]));
    }
    const subGrids = [];
    for (let i = 0; i < 9; i++) {
        subGrids.push([]);
    }
    for (let x = 0; x < 9; x++) {
        for (let y = 0; y < 9; y++) {
            const subGridX = Math.floor(x / 3);
            const subGridY = Math.floor(y / 3);
            const subGridIndex = subGridX * 3 + subGridY;
            subGrids[subGridIndex].push(solution[x][y]);
        }
    }
    return (solution.every((n) => new Set(n).size === 9) &&
        columns.every((n) => new Set(n).size === 9) &&
        subGrids.every((n) => new Set(n).size === 9));
};
/**
 * Flow definition for creating sudoku.
 */
const createSudokuFlow = (0, flow_1.defineFlow)({
    name: "createSudokuFlow",
    inputSchema: difficultySchema,
    outputSchema: create_sudoku_schema_1.CreateSudokuSchema,
    middleware: [
        (req, res, next) => {
            const apiToken = req.headers["x-api-key"];
            req.auth = apiToken;
            next();
        },
    ],
    authPolicy: (auth) => {
        if (auth !== process.env.API_KEY) {
            throw new Error("Authorization required!");
        }
    },
}, async (input) => {
    const dPrompt = await (0, dotprompt_1.prompt)("create-sudoku");
    const result = await dPrompt.generate({ input });
    const response = result.output();
    if (validateSudoku(response.solution)) {
        console.log("Generated Sudoku with GEMINI");
        return response;
    }
    console.log("Gemini couldn't generate valid puzzle. Responding with Pre-defined Sudoku.");
    return (0, random_sudoku_1.getRandomSudoku)(input.difficulty);
});
/**
 * Flow definition for generating hints.
 */
const generateHintFlow = (0, flow_1.defineFlow)({
    name: "generateHintFlow",
    inputSchema: hintSchema,
    outputSchema: hint_output_schema_1.HintOutputSchema,
    middleware: [
        (req, res, next) => {
            const apiToken = req.headers["x-api-key"];
            req.auth = apiToken;
            next();
        },
    ],
    authPolicy: (auth) => {
        if (auth !== process.env.API_KEY) {
            throw new Error("Authorization required!");
        }
    },
}, async (input) => {
    const dPrompt = await (0, dotprompt_1.prompt)("generate-hint");
    const result = await dPrompt.generate({ input });
    const response = result.output();
    return response;
});
// Starting the flow server.
(0, flow_1.startFlowsServer)({
    port: parseInt(process.env.PORT || "3400"),
    flows: [createSudokuFlow, generateHintFlow],
});
//# sourceMappingURL=index.js.map