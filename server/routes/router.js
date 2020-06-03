var express = require("express");
var RoomManager = require("../game/roomManager.js");
const dbInput = require("../promptdb/dbInput");
const { getCustomSet } = require("../promptdb/promptdb");

function createRouter(io) {
  // Set up router
  var router = express.Router();
  router.use(express.json());

  // Set up room management
  var roomManager = new RoomManager(io);

  // Base route
  router.get("/", function (req, res) {
    res.json({ message: "You are able to ping the API!" });
  });

  //-----//
  // GET //
  //-----//

  router.get("/loadcustomsetforediting/:id", function (req, res) {
    getCustomSet(req.params.id)
      .then((set) => {
        res.json(set);
      })
      .catch((err) => {
        console.error(err);
        res.json({ error: "something went wrong" });
      });
  });

  //------//
  // POST //
  //------//

  router.post("/createroom", function (req, res) {
    roomManager.createNewRoom().then((newRoomInfo) => {
      console.log("Created", newRoomInfo.roomCode);
      res.json({
        success: true,
        code: newRoomInfo.roomCode,
        adminKey: newRoomInfo.adminKey,
      });
    });
  });

  router.post("/checkroom", function (req, res) {
    let code = req.body.code.toUpperCase();
    console.debug("Checking existence/joinability of:", code);
    let exists = roomManager.checkRoomExists(code);
    let joinable = roomManager.checkRoomJoinability(code);
    res.json({
      exists: exists,
      code: code,
      joinable: joinable,
    });
  });

  router.post("/uploadprompts", (req, res) => {
    dbInput
      .createCustomPromptSetFromText(
        req.body.name,
        req.body.description,
        req.body.promptEntry
      )
      .then((id) => {
        res.send({ success: true, id: id });
      })
      .catch((err) => {
        console.log(err);
        res.send("Something went wrong!");
      });
  });

  return router;
}

// Export
module.exports = createRouter;
