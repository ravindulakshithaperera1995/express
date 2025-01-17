const uuidv4 = require("uuid").v4;
const pool = require("../db/mysql");

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

const countStudents = () => {
  let count = 0;
  pool
    .query("SELECT COUNT(*) FROM student ")
    .then((value) => {
      count = value.rows[0].count;
    })
    .catch((error) => {
      count = 0;
    });

  return count;
};

const createStudent = (req, res) => {
  const { firstName, lastName, age, departmentId } = req.body; // request body

  pool.query("SELECT COUNT(*) FROM student ").then((value) => {
    count = Number.parseInt(value.rows[0].count) + 1;
    pool.query(
      "INSERT INTO student (id, first_name, last_name, age, department_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [count, firstName, lastName, age, departmentId],
      (error, results) => {
        if (error) {
          res.status(500).send(`Request failed due to ${error}`);
        }
        res
          .status(201)
          .send(`Successfully created data of: ${results.rows[0].id}`);
      }
    );
  });
};

const createStudentList = (req, res) => {
  const { data } = req.body;

  if (!Array.isArray(data)) {
    return res.status(400).send("Data should be passed as a list");
  }

  pool.query("SELECT COUNT(*) FROM student ").then((value) => {
    const studentArray = [];
    data.forEach((student, index) => {
      count = Number.parseInt(value.rows[0].count) + index + 1;
      const studentObj = {
        id: count,
        firstName: student.firstName,
        lastName: student.lastName,
        age: student.age,
        departmentId: student.departmentId,
      };

      studentArray.push(studentObj);
    });

    const values = data
      .map(
        (row, index) =>
          `($${index * 5 + 1}, $${index * 5 + 2}, $${index * 5 + 3}, $${
            index * 5 + 4
          }, $${index * 5 + 5})` // In here 5 is the no of columns we tend to save data on
      )
      .join(", "); // output ($1, $2),($1,$2) an input bracket set for each data object

    const queryParams = studentArray.flatMap((row) => [
      row.id,
      row.firstName,
      row.lastName,
      row.age,
      row.departmentId,
    ]);
    const query = ` INSERT INTO student (id, first_name, last_name, age, department_id) VALUES ${values} RETURNING * `;

    pool.query(query, queryParams, (error, results) => {
      if (error) {
        res.status(500).send(`Request failed due to ${error}`);
      }
      res
        .status(201)
        .send(`Successfully created data of: ${results.rows[0].id}`);
    });
  });
};

const updateStudent = (req, res) => {
  const { firstName, lastName, age, departmentId, id } = req.body;

  pool.query(
    "UPDATE student SET first_name = $1, last_name = $2, age = $3, department_id = $4 WHERE id = $5",
    [firstName, lastName, age, departmentId, id],
    (error, results) => {
      if (error) {
        res.status(500).send(`Request failed due to ${error}`);
      }
      res.status(204).send(`Successfully Updated data of: ${id}`);
    }
  );
};

const findStudentById = (req, res) => {
  const { id } = req.params; // path variable
  pool.query("SELECT * FROM student WHERE id = $1", [id], (error, results) => {
    if (error) {
      res.status(500).send(`Request failed due to ${error}`);
    }
    res.status(200).send(results?.rows?.[0]);
  });
};

const deleteStudent = (req, res) => {
  const { id } = req.params;
  pool.query("DELETE FROM student WHERE id = $1", [id], (error, results) => {
    if (error) {
      res.status(500).send(`Request failed due to ${error}`);
    }
    res.status(204).send(`Record ${id} deleted successfully`);
  });
};

const studentFilter = (req, res) => {
  const { name, age, page = 1, size = 10 } = req.query; // Request/query params
  let query =
    "SELECT t1.id, t1.first_name, t1.last_name, t1.age, t2.department FROM student AS t1 INNER JOIN department AS t2 ON t1.department_id = t2.id";
  let queryParams = [];
  const offset = (page - 1) * size;

  if (name || age) {
    query += " WHERE ";
    const conditions = [];
    if (name) {
      queryParams.push(`%${name}%`);
      conditions.push(
        `t1.first_name ILIKE $${queryParams.length} OR t1.last_name ILIKE $${queryParams.length}`
      );
    }

    if (age) {
      queryParams.push(age);
      conditions.push(`t1.age = $${queryParams.length}`);
    }

    query += conditions.join(" AND ");
  }

  query += ` LIMIT $${queryParams.length + 1} OFFSET $${
    queryParams.length + 2
  }`;
  queryParams.push(size);
  queryParams.push(offset);

  pool.query(query, queryParams, (error, results) => {
    if (error) {
      res.status(500).send(`Request failed due to ${error}`);
    }

    res.status(200).json({
      page: parseInt(page),
      limit: parseInt(size),
      totalPages: results.rowCount,
      data: results.rows,
    });
  });
};

module.exports = {
  createFileData,
  getAllFileData,
  createStudent,
  updateStudent,
  studentFilter,
  findStudentById,
  deleteStudent,
  createStudentList,
};
