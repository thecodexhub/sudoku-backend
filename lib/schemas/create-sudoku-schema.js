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
exports.CreateSudokuSchema = void 0;
const core_1 = require("@genkit-ai/core");
const z = __importStar(require("zod"));
// ------ FOR SOLUTION SCHEMA ------------
const sNumberInRange = z.number().gte(1).lte(9).nonnegative();
const sRowWithNumberInRange = sNumberInRange.array().length(9);
const sValidRow = sRowWithNumberInRange.refine((items) => new Set(items).size === items.length, { message: "Must be an array of unique numbers" });
const solutionSudokuSchema = z.array(sValidRow).length(9);
// ------ FOR PUZZLE SCHEMA ------------
const pNumberInRange = z.union([sNumberInRange, z.literal(-1)]);
const pRowWithNumberInRange = pNumberInRange.array().length(9);
const pValidRow = pRowWithNumberInRange.refine((items) => {
    const positiveNumberArray = items.filter((item) => item > 0);
    return new Set(positiveNumberArray).size === positiveNumberArray.length;
}, { message: "Must be an array of unique positive numbers" });
const puzzleSudokuSchema = z.array(pValidRow).length(9);
exports.CreateSudokuSchema = (0, core_1.defineSchema)("CreateSudokuSchema", z.object({
    puzzle: puzzleSudokuSchema,
    solution: solutionSudokuSchema,
}));
//# sourceMappingURL=create-sudoku-schema.js.map