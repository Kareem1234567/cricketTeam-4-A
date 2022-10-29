const express = require("express");
const app = express();
app.use(express.json());

const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const path = require("path");
const db_path = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDbAndServer = async () => {
  db = await open({ filename: db_path, driver: sqlite3.Database });
  app.listen(3000, () => {
    try {
      console.log("server running at http://localhost:3000");
    } catch (error) {
      console.log(`DB ERROR ${error.message}`);
      process.exit(1);
    }
  });
};
initializeDbAndServer();

const convertDbResponseObjectToCamelCaseObject = (object) => {
  return {
    playerId: object.player_id,
    playerName: object.player_name,
    jerseyNumber: object.jersey_number,
    role: object.role,
  };
};

//API 1 GET
app.get("/players/", async (request, response) => {
  try {
    const Query = `
        SELECT 
            *
        FROM 
            cricket_team
        ORDER BY 
            player_id;`;
    const dbResponse = await db.all(Query);
    let results = [];
    for (let i = 0; i < dbResponse.length; i++) {
      let resObject = convertDbResponseObjectToCamelCaseObject(dbResponse[i]);
      results.push(resObject);
    }
    response.send(results);
  } catch (error) {
    console.log(`ERROR API ${error.message}`);
  }
});

//API 2 POST
app.post("/players/", async (request, response) => {
  try {
    const playerDetails = request.body;
    const { playerName, jerseyNumber, role } = playerDetails;
    const Query = `
        INSERT INTO
            cricket_team (player_name,jersey_number,role)
            VALUES 
            (   
                "${playerName}",
                ${jerseyNumber},
                "${role}"
            );`;
    const dbResponse = await db.run(Query);
    response.send("Player Added to Team");
  } catch (error) {
    console.log(`ERROR API ${error.message}`);
  }
});

//API 3 GET
app.get("/players/:playerId/", async (request, response) => {
  try {
    const { playerId } = request.params;
    const Query = `
        SELECT 
            *
        FROM 
            cricket_team
        WHERE 
            player_id=${playerId};`;
    const dbResponse = await db.all(Query);
    let results = [];
    for (let i = 0; i < dbResponse.length; i++) {
      let resObject = convertDbResponseObjectToCamelCaseObject(dbResponse[i]);
      results.push(resObject);
    }
    response.send(results[0]);
  } catch (error) {
    console.log(`ERROR API ${error.message}`);
  }
});

//API 4 PUT
app.put("/players/:playerId/", async (request, response) => {
  try {
    const { playerId } = request.params;
    const playerDetails = request.body;
    const { playerName, jerseyNumber, role } = playerDetails;
    const Query = `
        UPDATE
            cricket_team
        SET
           player_name="${playerName}",
           jersey_number=${jerseyNumber},
           role="${role}"
        WHERE
            player_id=${playerId};`;
    await db.run(Query);
    response.send("Player Details Updated");
  } catch (error) {
    console.log(`ERROR API ${error.message}`);
  }
});

//API 5 DELETE
app.delete("/players/:playerId/", async (request, response) => {
  try {
    const { playerId } = request.params;
    const Query = `
        DELETE FROM
            cricket_team
        WHERE
            player_id=${playerId};`;
    await db.run(Query);
    response.send("Player Removed");
  } catch (error) {
    console.log(`ERROR API ${error.message}`);
  }
});

module.exports = app;
