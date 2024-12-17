const Pool = require("pg").Pool;
const uuidv4 = require("uuid").v4;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "express",
  password: "admin",
  port: 5432,
});

const createFileData = (req, res) => {
  res.set("Content-Type", "Application/json");

  const id = uuidv4();
  const name = req.file.filename;
  const size = req.file.size;
  const mime = req.file.mimetype;
  const originalName = req.file.originalname;
  const fieldName = req.file.fieldname;

  pool.query(
    "INSERT INTO filedata (id, name, size, mime, originalname, fieldname) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    [id, name, size, mime, originalName, fieldName],
    (error, results) => {
      if (error) {
        res.status(500).send(`Request failed due to ${error}`);
      }
      res.status(201).send(`FileData added with ID: ${results.rows[0].id}`);
    }
  );
};

const getAllFileData = (req, res) => {
  res.set("Content-Type", "Application/json");

  pool.query("SELECT * FROM filedata ORDER BY id ASC", (error, results) => {
    if (error) {
      throw error;
    }
    res.status(200).json(results.rows);
  });
};

module.exports = {
  createFileData,
  getAllFileData,
};
