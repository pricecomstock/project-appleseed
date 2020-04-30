const playerCountOptions = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
const answersPerPromptOptions = [1, 2, 3, 4, 8, 16, "*"];
const promptsForEachPlayer = 1;

function minimumPromptsFor(playerCount, answersPerPrompt) {
  if (answersPerPrompt > playerCount) {
    return "-";
  } else if (answersPerPrompt === "*") {
    // everybody answers
    return playerCount * promptsForEachPlayer;
  }
  let calculatedPromptCount =
    (playerCount * promptsForEachPlayer) / answersPerPrompt;
  if (Number.isInteger(calculatedPromptCount)) {
    return calculatedPromptCount;
  } else {
    return calculatedPromptCount * answersPerPrompt;
  }
}

let minimumPromptsTable = Object.fromEntries(
  answersPerPromptOptions.map((answersPerPrompt) => {
    return [
      answersPerPrompt,
      Object.fromEntries(
        playerCountOptions.map((playerCount) => {
          return [
            playerCount,
            minimumPromptsFor(playerCount, answersPerPrompt),
          ];
        })
      ),
    ];
  })
);
// return playerCountOptions.map((playerCount) => {
//   return playerCount * answersPerPrompt;
// });

console.log(
  `Total prompts required for ${promptsForEachPlayer} prompts sent to each player:`
);
console.log("V AnswersPerPrompt", "PlayerCount->");
console.table(minimumPromptsTable);
