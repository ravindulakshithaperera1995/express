const express = require("express");
const multer = require("multer");
const queries = require("./queries.js");

const app = express();
const upload = multer({ dest: "/upload-file" });

const PORT = 4000;

app.use(express.json());

app.post("/upload-file", upload.single("file"), queries.createFileData);

app.post("/set-data", (req, res) => {
  const { name } = req.body;
  res.set("Content-Type", "Application/json");
  res.status(200).send(`${name}`);
});

app.get("/get-all-data", (req, res) => {
  queries.getAllFileData(req, res);
});

app.get("/sample", (req, res) => {
  res.set("Content-Type", "text/html");
  res.status(200).send("<h1>Express.js!</h1>");
});

app.listen(PORT, (error) => {
  if (!error) {
    console.log(
      "Server is Successfully Running, and App is listening on port " + PORT
    );
  } else {
    console.log("Error occurred, server can't start", error);
  }
});
