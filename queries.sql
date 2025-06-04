
-- SETUP --

DROP TABLE IF EXISTS countries, visited_countries, family_members;

CREATE TABLE countries (
  id SERIAL PRIMARY KEY,
  country_code CHAR(2),
  country_name VARCHAR(100)
);


CREATE TABLE family_members(
id SERIAL PRIMARY KEY,
name VARCHAR(15) UNIQUE NOT NULL,
color VARCHAR(15)
);

CREATE TABLE visited_countries(
id SERIAL PRIMARY KEY,
country_code CHAR(2) NOT NULL,
user_id INTEGER REFERENCES family_members(id)
);

INSERT INTO family_members (name, color)
VALUES ('Atul', 'teal'), ('Jack', 'powderblue');

INSERT INTO visited_countries (country_code, user_id)
VALUES ('FR', 1), ('GB', 1), ('CA', 2), ('FR', 2 );

SELECT *
FROM visited_countries
JOIN family_members
ON family_members.id = user_id;