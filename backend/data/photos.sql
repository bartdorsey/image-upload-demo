DROP TABLE IF EXISTS photos;

CREATE TABLE photos (
    id SERIAL PRIMARY KEY,
    photo_name TEXT NOT NULL
);
