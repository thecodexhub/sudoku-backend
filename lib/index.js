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
const core_1 = require("@genkit-ai/core");
const flow_1 = require("@genkit-ai/flow");
const googleai_1 = require("@genkit-ai/googleai");
const create_sudoku_schema_1 = require("./schemas/create-sudoku-schema");
const dotprompt_1 = require("@genkit-ai/dotprompt");
(0, core_1.configureGenkit)({
    plugins: [(0, googleai_1.googleAI)(), (0, dotprompt_1.dotprompt)()],
    logLevel: "debug",
    enableTracingAndMetrics: true,
});
const difficultySchema = z.object({
    difficulty: z.string(),
});
const createSudokuFlow = (0, flow_1.defineFlow)({
    name: "createSudokuFlow",
    inputSchema: difficultySchema,
    outputSchema: create_sudoku_schema_1.CreateSudokuSchema,
}, async (input) => {
    const dPrompt = await (0, dotprompt_1.prompt)("create-sudoku");
    const result = await dPrompt.generate({ input });
    const response = result.output();
    const c = response.puzzle.flat().filter((e) => e === -1).length;
    console.log(`********** Empty cells count: ${c}`);
    return response;
});
(0, flow_1.startFlowsServer)({
    port: parseInt(process.env.PORT || "3400"),
    flows: [createSudokuFlow],
});
//# sourceMappingURL=index.js.map