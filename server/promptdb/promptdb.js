const Sequelize = require("sequelize");
const Model = Sequelize.Model;

// Init DB
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "../../db/promptdb.sqlite",
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
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    description: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    id: {
      // TODO can we generate this on insert?
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

// belongsTo puts the relationship info on target (customSet), unlike hasOne
// Prompt.belongsTo(CustomSet);
// Doing it this way because sets are optional for prompts
CustomSet.hasMany(Prompt);

// FIXME probably not for long term production, buddy
CustomSet.sync({ force: true }).then(() => {
  return CustomSet.create({
    name: "custom!",
    description: "A test custom set.",
    id: "asdfqwerzxcvuiop",
  });
});

Prompt.sync({ force: true }).then(() => {
  return Prompt.create({
    text: "What's a good prompt for this game?",
    customSet: "asdfqwerzxcvuiop",
  });
});

async function getAllPromptsFromCustomSet(id) {
  let dbResults = await Prompt.findAll({
    where: {
      customSet: id,
    },
  });
  return dbResults.map((prompt) => prompt.text);
}

async function createOrReplaceCustomSet(id, prompts) {
  await Prompt.destroy({
    where: {
      customSet: id,
    },
  });
  Prompt.bulkCreate(
    prompts.map((prompt) => {
      return {
        text: prompt,
        familyFriendly: false,
        usesPlayerName: prompt.search(/%p/g) != -1,
        defaultSet: false,
      };
    })
  );
}
