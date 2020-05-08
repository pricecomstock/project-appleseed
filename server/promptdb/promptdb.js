const Sequelize = require("sequelize");
const Model = Sequelize.Model;

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: __dirname + "/../../db/promptdb.sqlite",
});

sequelize
  .authenticate()
  .then(() => {
    console.log("DB connection established");
  })
  .catch((err) => {
    console.error("Unable to connect to DB", err);
  });

// Models
class CustomSet extends Model {}
CustomSet.init(
  {
    name: {
      type: Sequelize.STRING(30),
      allowNull: true,
      defaultValue: "custom set",
    },
    description: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    id: {
      primaryKey: true,
      type: Sequelize.STRING(16),
      unique: true,
      validate: {
        isAlphanumeric: true,
      },
    },
  },
  {
    sequelize,
    modelName: "customSet",
  }
);

class Prompt extends Model {}
Prompt.init(
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    text: {
      type: Sequelize.STRING(255),
      allowNull: false,
    },

    familyFriendly: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    usesPlayerName: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    defaultSet: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: "prompt",
  }
);

// belongsTo puts the relationship info on source (player), unlike hasOne
Prompt.belongsTo(CustomSet);

// FIXME probably not for long term production, buddy
async function initializeDatabase() {
  await CustomSet.sync({ force: true });
  await Prompt.sync({ force: true });
}

async function generateUniqueCustomSetId() {
  const codeLength = 16;
  const validCharacters = "ABCDEFHJLMNOPQRSTVWXYZ";

  let exists = true;
  let code = "";
  while (exists) {
    code = "";
    for (let i = 0; i < codeLength; i++) {
      code +=
        validCharacters[Math.floor(Math.random() * validCharacters.length)];
    }
    // retry if it exists
    exists =
      (await CustomSet.findOne({
        where: { id: code },
      })) !== null;
  }

  return code;
}

async function getAllPromptsFromCustomSet(id) {
  let normalizedId = id
    .replace(/[^A-Z]/g, "")
    .substring(0, 16)
    .toUpperCase();
  let dbResults = await Prompt.findAll({
    where: {
      customSetId: normalizedId,
    },
  });
  if (dbResults.length === 0) {
    throw Error("Custom set does not exist");
  }
  return dbResults.map((prompt) => prompt.text);
}

async function getCustomSetData(id) {
  return await CustomSet.findOne({
    where: {
      id: id,
    },
  });
}

async function getCustomSet(id) {
  let normalizedId = id
    .replace(/[^A-Z]/g, "")
    .substring(0, 16)
    .toUpperCase();

  let [prompts, metadata] = await Promise.all([
    getAllPromptsFromCustomSet(normalizedId),
    getCustomSetData(normalizedId),
  ]);
  if (!metadata) {
    throw Error("Custom set does not exist");
  }
  return { prompts, metadata };
}

async function getAllDefaultPrompts() {
  let dbResults = await Prompt.findAll({
    where: {
      defaultSet: true,
    },
  });
  return dbResults.map((prompt) => prompt.text);
}

async function createCustomSet(name, description, prompts) {
  let id = await generateUniqueCustomSetId();
  CustomSet.create({
    name: name,
    description: description,
    id: id,
  });
  return await replaceCustomSet(id, prompts);
}

async function replaceCustomSet(id, prompts) {
  await Prompt.destroy({
    where: {
      customSetId: id,
    },
  });
  let promptsToInsert = prompts.map((prompt) => {
    return {
      text: prompt,
      familyFriendly: false,
      usesPlayerName: prompt.search(/%p/g) != -1,
      defaultSet: false,
      customSetId: id,
    };
  });
  await Prompt.bulkCreate(promptsToInsert);
  return id;
}

async function replaceDefaultPrompts(promptObjects) {
  await Prompt.destroy({
    where: {
      defaultSet: true,
    },
  });
  return await insertDefaultPrompts(promptObjects);
}

async function insertDefaultPrompts(promptObjects) {
  let promptsToInsert = promptObjects.map((promptObject) => {
    return {
      text: promptObject.text,
      familyFriendly: promptObject.isFamilyFriendly,
      usesPlayerName: promptObject.text.search(/%p/g) != -1,
      defaultSet: true,
      customSetId: null,
    };
  });
  await Prompt.bulkCreate(promptsToInsert);
}

module.exports = {
  createCustomSet,
  replaceCustomSet,
  getAllPromptsFromCustomSet,
  getCustomSetData,
  getCustomSet,
  replaceDefaultPrompts,
  insertDefaultPrompts,
  getAllDefaultPrompts,
  initializeDatabase,
};
