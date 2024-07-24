// This statement will import the JSON samples.
// To enable compiling JSON files, add `"resolveJsonModule": true` inside
// `compilerOptions` in tsconfig.json
import data from "./samples/sudoku-samples.json";

/**
 * Reads pre-defined sudoku puzzles from `sudoku-samples.json` and randomly pick one
 * puzzle depending upon specified difficulty level.
 * 
 * If the difficulty level doesn't match, or if the samples file doesn't hold any
 * puzzle for the provided difficulty, it'll randomly choose any one.
 *  
 * @param difficulty - The difficulty level for the sudoku puzzle. Should be within
 * 'easy', 'medium', 'difficult', and 'expert'.
 * @returns an object containing `solution` and `puzzle`.
 */
export const getRandomSudoku = (difficulty: string) => {
  // Filter out entries that match the difficulty level.
  let filteredData = data.filter((item) => item.difficulty == difficulty);

  // If the difficulty level doesn't match make everything available
  // the code for randomly pick.
  if (filteredData.length === 0) {
    filteredData = data;
  }

  const count = filteredData.length;
  const randomIndex = Math.floor(Math.random() * count);

  return {
    solution: filteredData[randomIndex].solution,
    puzzle: filteredData[randomIndex].puzzle,
  };
};

export const format2DArray = (input: number[][]) => {
  let str = "[\n";
  for (let i = 0; i < input.length; i++) {
    str += "  [";
    for (let j = 0; j < input[i].length; j++) {
      str += input[i][j] + (j != input[i].length - 1 ? "," : "]");
    }
    str += i != input.length - 1 ? ",\n" : "\n]\n";
  }
  return str;
};
