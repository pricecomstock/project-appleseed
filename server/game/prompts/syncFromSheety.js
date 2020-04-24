const axios = require("axios");
const fs = require("fs");

const sheetyUrl =
  "https://v2-api.sheety.co/c732e4da3ff5d7345f492f050ab149e9/appleseed/prompts";
const fileName = "./server/game/prompts/sheety.json";

function sync() {
  axios
    .get(sheetyUrl)
    .then((res) => {
      let prompts = res.data.prompts.map((prompt) => {
        return prompt["yourPrompt:"];
      });
      fs.writeFileSync(fileName, JSON.stringify({ prompts }));
    })
    .catch((e) => {
      console.error("Error:", e);
      return;
    });
}

sync();
