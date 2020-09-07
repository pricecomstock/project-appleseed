const axios = require("axios");
const {
  initializeDatabase,
  replaceDefaultPrompts,
} = require("../../promptdb/promptdb");
const fs = require("fs");

const sheetyUrl =
  "https://v2-api.sheety.co/c732e4da3ff5d7345f492f050ab149e9/appleseed/prompts";
// const fileName = "./server/game/prompts/sheety.json";

async function sync() {
  // await initializeDatabase();
  axios
    .get(sheetyUrl)
    .then((res) => {
      let promptObjects = res.data.prompts
        .map((promptJson) => {
          return {
            text: promptJson["yourPrompt:"],
            isFamilyFriendly:
              promptJson["flags"] &&
              promptJson["flags"].search(/NOT Family Friendly/g) != -1,
          };
        })
        // Filter empty prompts
        .filter((promptObject) => {
          return promptObject.text.trim() !== "";
        });
      replaceDefaultPrompts(promptObjects).then((result) =>
        console.log("Inserted prompts!")
      );
    })
    .catch((e) => {
      console.error("Error:", e);
      return;
    });
}

sync();

module.exports = sync;
