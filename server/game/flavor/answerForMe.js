const { randomItemFromArray } = require("../util.js");
const faker = require("faker");
const templates = [
  "{{commerce.productAdjective}} {{commerce.productName}}",
  "{{commerce.color}} {{date.weekday}}",
  "{{finance.accountName}} {{finance.transactionType}}",
  "{{hacker.adjective}} {{hacker.noun}}",
  "{{internet.domainName}}",
  "{{internet.password}}",
  "{{name.firstName}} {{name.lastName}}",
  "{{system.fileName}}",
  "{{name.jobTitle}}",
  "{{company.catchPhrase}}",
  "{{company.bsNoun}} {{commerce.productMaterial}}",
  "{{company.bsNoun}} {{commerce.product}}",
  "{{company.bsAdjective}} {{commerce.product}}",
  "{{address.state}}",
  "{{address.streetName}} {{commerce.department}}",
  "{{company.companyName}}",
  "{{random.word}} {{random.word}}",
  "{{random.word}} {{random.word}}",
  "{{random.word}} {{random.word}}",
  "{{random.word}} {{random.word}}",
  "{{random.word}} {{random.word}}",
  "{{random.word}} {{random.word}}",
];

function generateRandomAnswer() {
  const template = randomItemFromArray(templates);
  return faker.fake(template).toLowerCase();
}

function genAndPrint(template, count) {
  const generated = [];
  for (let i = 0; i < count; i++) {
    generated.push(faker.fake(template).toLowerCase());
  }
  console.log(generated.join("\n"));
}

genAndPrint("{{random.word}} {{random.word}}", 5);

module.exports = { generateRandomAnswer };
