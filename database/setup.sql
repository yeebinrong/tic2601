-- [Add uuid extension if not exists]
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- [Create enums]
-- TrueOrFalse enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'trueorfalse') THEN
        CREATE TYPE TrueOrFalse AS ENUM ('Y', 'N');
    END IF;
END$$;

-- [Create role for backend queries]
DROP ROLE IF EXISTS readit_user;
CREATE ROLE readit_user SUPERUSER LOGIN PASSWORD 'readit';

-- [Create users table]
DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
	user_id SERIAL PRIMARY KEY,
	user_name VARCHAR(30) UNIQUE NOT NULL CHECK(user_name ~* '^[A-Za-z0-9]+$'),
	password VARCHAR(256) NOT NULL,
	email VARCHAR(256) UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._+%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$'),
	profile_picture VARCHAR(256),
	user_description VARCHAR(256),
	datetime_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	reset_token VARCHAR(256),
	reset_token_time TIMESTAMP
);

-- [Create community table]
DROP TABLE IF EXISTS community CASCADE;
CREATE TABLE community (
	community_id SERIAL PRIMARY KEY,
	community_name VARCHAR(21)
		UNIQUE,
		CHECK(length(community_name) > 3 AND length(community_name) < 21
		AND community_name ~* '^[A-Za-z0-9_\-]+$' AND community_name !~* '\_%'),
	pinned_post INTEGER DEFAULT NULL, -- foreign key is added after post table is created
	datetime_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	description VARCHAR(256) NOT NULL DEFAULT 'Describe the community.',
	profile_picture VARCHAR(256),
	backdrop_picture VARCHAR(256),
	colour CHAR(7) NOT NULL DEFAULT '#00b2d2' CHECK(colour ~* '^#[A-Fa-f0-9]{6}$') -- Colour theme of the community
);

-- [Create posts table]
DROP TABLE IF EXISTS posts CASCADE;
CREATE TABLE posts (
	post_id SERIAL PRIMARY KEY,
	user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
	community_id INTEGER NOT NULL REFERENCES community(community_id) ON DELETE CASCADE ON UPDATE CASCADE,
	url VARCHAR(2048),
	title VARCHAR(300) NOT NULL,
	date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	date_deleted TIMESTAMP DEFAULT NULL,
	is_archived TrueOrFalse DEFAULT 'N'
);

-- Alter community table to have pinned_post have foreign key
ALTER TABLE community ADD FOREIGN KEY (pinned_post) REFERENCES posts(post_id) ON DELETE CASCADE ON UPDATE CASCADE;

-- [Create post contents table]
DROP TABLE IF EXISTS post_contents CASCADE;
CREATE TABLE post_contents (
	post_id INTEGER PRIMARY KEY REFERENCES posts(post_id) ON DELETE CASCADE ON UPDATE CASCADE,
	content VARCHAR(1000) NOT NULL,
	is_edited TrueOrFalse NOT NULL DEFAULT 'N',
	view_count INT NOT NULL DEFAULT 1
);

-- [Create comments table]
DROP TABLE IF EXISTS comments CASCADE;
CREATE TABLE comments(
	unique_id VARCHAR(292) UNIQUE, -- unique_id is built using post_id and comment_id used as a foreign key for other tables
	post_id INTEGER NOT NULL REFERENCES posts(post_id) ON DELETE CASCADE ON UPDATE CASCADE,
	comment_id SERIAL,
	replying_to INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
	commenter INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
	datetime_created DATE NOT NULL DEFAULT CURRENT_DATE,
	is_deleted TrueOrFalse NOT NULL DEFAULT 'N',
	is_edited TrueOrFalse NOT NULL DEFAULT 'N',
	content VARCHAR(1000) NOT NULL,
	PRIMARY KEY (post_id, comment_id)
);

-- [Create function to concentate unique_id for community_flairs to be used as foreign key ]
CREATE OR REPLACE FUNCTION comments_insert() RETURNS trigger AS '
     BEGIN
         NEW.unique_id := NEW.post_id||''#''||NEW.comment_id;
         RETURN NEW;
     END;
 ' LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER comments_insert
	BEFORE INSERT OR UPDATE ON comments
	FOR EACH ROW EXECUTE PROCEDURE comments_insert();

-- [Create community_flairs table]
-- Flair name is not unique as it is possible to have duplicate flair names from different communities
DROP TABLE IF EXISTS community_flairs CASCADE;
CREATE TABLE community_flairs (
	unique_id VARCHAR(292) UNIQUE, -- unique_id is built using community_id and flair_id used as a foreign key for other tables
	community_id INTEGER NOT NULL REFERENCES community(community_id) ON DELETE CASCADE ON UPDATE CASCADE,
	flair_id UUID DEFAULT uuid_generate_v4(),
	flair_name VARCHAR(30) NOT NULL,
	colour CHAR(7) NOT NULL DEFAULT '#00b2d2' CHECK(colour ~* '^#[A-Fa-f0-9]{6}$'), -- Colour of the community flair
	PRIMARY KEY (community_id, flair_id)
);

-- [Create function to concentate unique_id for community_flairs to be used as foreign key ]
CREATE OR REPLACE FUNCTION community_flairs_insert() RETURNS trigger AS '
     BEGIN
         NEW.unique_id := NEW.community_id||''#''||NEW.flair_id;
         RETURN NEW;
     END;
 ' LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER community_flairs_insert
	BEFORE INSERT OR UPDATE ON community_flairs
	FOR EACH ROW EXECUTE PROCEDURE community_flairs_insert();

-- [Create selected_flairs table]
DROP TABLE IF EXISTS selected_flairs CASCADE;
CREATE TABLE selected_flairs (
	unique_id VARCHAR(292) NOT NULL REFERENCES community_flairs(unique_id) ON DELETE CASCADE ON UPDATE CASCADE,
	post_id INTEGER NOT NULL REFERENCES posts(post_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- [Create followed_communities]
DROP TABLE IF EXISTS followed_communities CASCADE;
CREATE TABLE followed_communities(
	community_id INTEGER NOT NULL REFERENCES community(community_id) ON DELETE CASCADE ON UPDATE CASCADE,
	user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
	followed_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [Create rules table]
DROP TABLE IF EXISTS rules CASCADE;
CREATE TABLE rules (
	unique_id VARCHAR(292) UNIQUE, -- unique_id is built using community_id and rules_id used as a foreign key for other tables
	community_id INTEGER NOT NULL REFERENCES community(community_id) ON DELETE CASCADE ON UPDATE CASCADE,
	rules_id UUID DEFAULT uuid_generate_v4(),
	title VARCHAR(300) NOT NULL,
	description VARCHAR(1000) NOT NULL,
	PRIMARY KEY (community_id, rules_id)
-- TODO allow sorting order of rules
);

-- [Create function to concentate unique_id for community_flairs to be used as foreign key ]
CREATE OR REPLACE FUNCTION rules_insert() RETURNS trigger AS '
     BEGIN
         NEW.unique_id := NEW.community_id||''#''||NEW.rules_id;
         RETURN NEW;
     END;
 ' LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER rules_insert
	BEFORE INSERT OR UPDATE ON rules
	FOR EACH ROW EXECUTE PROCEDURE rules_insert();

-- [Create favours table]
-- post_id or comment_id is default null
DROP TABLE IF EXISTS favours CASCADE;
CREATE TABLE favours (
	post_id INTEGER DEFAULT NULL REFERENCES posts(post_id) ON DELETE CASCADE ON UPDATE CASCADE,
	unique_comment_id VARCHAR(292) DEFAULT NULL REFERENCES comments(unique_id) ON DELETE CASCADE ON UPDATE CASCADE,
	favour_point INTEGER NOT NULL CHECK(favour_point=1 OR favour_point=-1),
	giver INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
	receiver INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE
	-- TODO check for both post_id and comment_id cannot be null at same time, one of them must be null
);

-- [Create hide_or_fav_posts table]
DROP TABLE IF EXISTS hide_or_fav_posts CASCADE;
CREATE TABLE hide_or_fav_posts (
	post_id INTEGER DEFAULT NULL REFERENCES posts(post_id) ON DELETE CASCADE ON UPDATE CASCADE,
	user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
	hide_or_favourite TrueOrFalse NOT NULL,
	PRIMARY KEY (post_id, user_id)
);

-- [Create notifications table]
DROP TABLE IF EXISTS notifications CASCADE;
CREATE TABLE notifications (
	notification_id SERIAL PRIMARY KEY,
	user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
	post_id INTEGER NOT NULL REFERENCES posts(post_id) ON DELETE CASCADE ON UPDATE CASCADE,
	unique_comment_id VARCHAR(292) NOT NULL REFERENCES comments(unique_id) ON DELETE CASCADE ON UPDATE CASCADE,
	date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	title VARCHAR(300) NOT NULL,
	content VARCHAR(1000) NOT NULL,
	is_read TrueOrFalse NOT NULL
);

-- [Create moderators table]
DROP TABLE IF EXISTS moderators CASCADE;
CREATE TABLE moderators(
	community_id INTEGER NOT NULL REFERENCES community(community_id) ON DELETE CASCADE ON UPDATE CASCADE,
	user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
	is_admin TrueOrFalse NOT NULL DEFAULT 'N'
);

-- [Create banlist table]
DROP TABLE IF EXISTS banlist CASCADE;
CREATE TABLE banlist(
	unique_rule_id VARCHAR(292) NOT NULL REFERENCES rules(unique_id) ON DELETE CASCADE ON UPDATE CASCADE,
	community_id INTEGER NOT NULL REFERENCES community(community_id) ON DELETE CASCADE ON UPDATE CASCADE,
	user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
	is_approved TrueOrFalse NOT NULL DEFAULT 'N',
	PRIMARY KEY (community_id, user_id)
);

-- Insert default user testaccount
INSERT into users(user_name, password, email) VALUES ('testaccount', 'a49425421365d534c88d93fd6d04b94df756988254b31aec08850bd37a265832', 'test@gmail.com');
-- Insert default community
INSERT INTO community (community_name) VALUES ('test_community');
-- Insert default post
INSERT INTO posts (community_id, title, user_id) VALUES (1, 'Hello World One!', 1);
INSERT INTO posts (community_id, title, user_id) VALUES (1, 'Hello World Two!', 1);
INSERT INTO post_contents (post_id, content) VALUES (1, 'This is post content for hello world one.')
INSERT INTO post_contents (post_id, content) VALUES (1, 'This is post content for hello world two.')