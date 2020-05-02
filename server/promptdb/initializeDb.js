const { initializeDatabase } = require("./promptdb");

initializeDatabase()
  .then(() => {
    console.log("Database initialized!");
  })
  .catch((err) => {
    console.error("DATABASE INITIALIZATION FAILED");
  });
