const express = require("express");
const multer = require("multer");
const cron = require("node-cron");
const queries = require("../queries/queries");

const router = express.Router();

const upload = multer({ dest: "/upload-file" });

router.post("/upload-file", upload.single("file"), queries.createFileData);

router.post("/set-data", (req, res) => {
  const { name } = req.body;
  res.set("Content-Type", "Application/json");
  res.status(200).send(`${name}`);
});

router.get("/get-all-data", (req, res) => {
  queries.getAllFileData(req, res);
});

router.get("/sample", (req, res) => {
  res.set("Content-Type", "text/html");
  res.status(200).send("<h1>Express.js!</h1>");
});

router.get("/students", (req, res) => {
  queries.studentFilter(req, res);
});

router.post("/students", (req, res) => {
  queries.createStudent(req, res);
});

router.post("/students/bulk", (req, res) => {
  queries.createStudentList(req, res);
});

router.put("/students", (req, res) => {
  queries.updateStudent(req, res);
});

router.delete("/students/:id", (req, res) => {
  queries.deleteStudent(req, res);
});

router.get("/students/student/:id", (req, res) => {
  queries.findStudentById(req, res);
});

cron.schedule("* * * * *", () => {
  console.log("Running a task every minute"); // Add your task code here
});

module.exports = router;
