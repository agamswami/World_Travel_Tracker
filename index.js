import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "travel",
  password: "12345678",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

async function checkVisited(user_id) {
  const result = await db.query(
    `SELECT vc.country_code 
     FROM visited_countries vc 
     JOIN family_members fm ON fm.id = vc.user_id 
     WHERE user_id = $1`, [user_id]
  );
  return result.rows.map(row => row.country_code);
}

async function checkUsers() {
  const result = await db.query("SELECT * FROM family_members;");
  return result.rows.map(user => ({
    id: user.id,
    name: user.name,
    color: user.color
  }));
}

app.get("/", async (req, res) => {
  const user_id = 1;
  const countries = await checkVisited(user_id);
  const users = await checkUsers();
  const color = users.find(u => u.id == user_id)?.color || "gray";
  res.render("index.ejs", {
    countries,
    total: countries.length,
    users,
    color,
    user_id
  });
});

app.post("/add", async (req, res) => {
  const countryInput = req.body["country"];
  const user_id = parseInt(req.body.user_id);

  try {
    const result = await db.query(
      "SELECT country_code FROM countries WHERE LOWER(country_name) = $1;",
      [countryInput.toLowerCase()]
    );

    if (result.rows.length === 0) throw new Error("Country not found");

    const country_code = result.rows[0].country_code;

    try {
      await db.query(
        "INSERT INTO visited_countries (country_code, user_id) VALUES ($1, $2);",
        [country_code, user_id]
      );
    } catch (err) {
      return renderIndexWithError(res, user_id, "Country already added");
    }

    return renderIndex(res, user_id);

  } catch (err) {
    return renderIndexWithError(res, user_id, "Country not found");
  }
});

app.post("/user", async (req, res) => {
  if (req.body.add) {
    return res.render("new.ejs");
  } else {
    const user_id = parseInt(req.body.user);
    return renderIndex(res, user_id);
  }
});

app.post("/new", async (req, res) => {
  const newUserName = req.body.name;
  const userColor = req.body.color;

  const result = await db.query(
    "INSERT INTO family_members (name, color) VALUES ($1, $2) RETURNING *;",
    [newUserName, userColor]
  );
  const user_id = result.rows[0].id;

  return renderIndex(res, user_id);
});

// Utility: Render index page
async function renderIndex(res, user_id) {
  const countries = await checkVisited(user_id);
  const users = await checkUsers();
  const color = users.find(u => u.id == user_id)?.color || "gray";
  res.render("index.ejs", {
    countries,
    total: countries.length,
    users,
    color,
    user_id
  });
}

// Utility: Render with error
async function renderIndexWithError(res, user_id, error) {
  const countries = await checkVisited(user_id);
  const users = await checkUsers();
  const color = users.find(u => u.id == user_id)?.color || "gray";
  res.render("index.ejs", {
    countries,
    total: countries.length,
    users,
    color,
    user_id,
    error
  });
}

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
