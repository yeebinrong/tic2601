DROP ROLE IF EXISTS readit_user;
DROP TABLE IF EXISTS users;

CREATE ROLE readit_user SUPERUSER LOGIN PASSWORD 'readit';

CREATE TABLE users (
	user_name VARCHAR(30) PRIMARY KEY CHECK(user_name ~* '^[A-Za-z0-9]+$'),
	password VARCHAR(256) NOT NULL,
	email VARCHAR(256) NOT NULL CHECK (email ~* '^[A-Za-z0-9._+%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$'),
	profile_picture VARCHAR(256),
	description VARCHAR(256),
	datetime_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	reset_token VARCHAR(256),
	reset_token_time TIMESTAMP
);
