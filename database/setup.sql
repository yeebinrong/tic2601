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
	user_name VARCHAR(30) PRIMARY KEY CHECK(user_name ~* '^[A-Za-z0-9]+$'),
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
	community_name VARCHAR(21)
		PRIMARY KEY,
		CHECK(length(community_name) > 3 AND length(community_name) < 21
		AND community_name ~* '^[A-Za-z0-9_\-]+$' AND community_name !~* '\_%'),
	pinned_post INTEGER DEFAULT NULL, -- foreign key is added after post table is created
	datetime_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	description VARCHAR(256) NOT NULL DEFAULT 'Describe the community.',
	profile_picture VARCHAR(256),
	backdrop_picture VARCHAR(256),
	colour CHAR(7) NOT NULL DEFAULT '#00b2d2' CHECK(colour ~* '^#[A-Fa-f0-9]{6}$') -- Colour theme of the community
);

-- [Create community_flairs table]
-- Flair name is not unique as it is possible to have duplicate flair names from different communities
DROP TABLE IF EXISTS community_flairs CASCADE;
CREATE TABLE community_flairs (
	unique_id VARCHAR(292) UNIQUE, -- unique_id is built using community_name and flair_id used as a foreign key for other tables
	community_name VARCHAR(21) NOT NULL REFERENCES community(community_name) ON DELETE CASCADE ON UPDATE CASCADE,
	flair_id UUID DEFAULT uuid_generate_v4(),
	flair_name VARCHAR(30) NOT NULL,
	colour CHAR(7) NOT NULL DEFAULT '#00b2d2' CHECK(colour ~* '^#[A-Fa-f0-9]{6}$'), -- Colour of the community flair
	PRIMARY KEY (community_name, flair_id)
);

-- [Create function to concentate unique_id for community_flairs to be used as foreign key ]
CREATE OR REPLACE FUNCTION community_flairs_insert() RETURNS trigger AS '
     BEGIN
         NEW.unique_id := NEW.community_name||''#''||NEW.flair_id;
         RETURN NEW;
     END;
 ' LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER community_flairs_insert
	BEFORE INSERT OR UPDATE ON community_flairs
	FOR EACH ROW EXECUTE PROCEDURE community_flairs_insert();

-- [Create posts table]
DROP TABLE IF EXISTS posts CASCADE;
CREATE TABLE posts (
	post_id SERIAL PRIMARY KEY,
	user_name VARCHAR(30) NOT NULL REFERENCES users(user_name) ON DELETE CASCADE ON UPDATE CASCADE,
	selected_flair_id VARCHAR(292) NOT NULL REFERENCES community_flairs(unique_id) ON DELETE CASCADE ON UPDATE CASCADE,
	community_name VARCHAR(21) NOT NULL REFERENCES community(community_name) ON DELETE CASCADE ON UPDATE CASCADE,
	url VARCHAR(2048),
	title VARCHAR(300) NOT NULL,
	date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	date_deleted TIMESTAMP DEFAULT NULL,
	view_count INT NOT NULL DEFAULT 0
);

-- Alter community table to have pinned_post have foreign key
ALTER TABLE community ADD FOREIGN KEY (pinned_post) REFERENCES posts(post_id) ON DELETE CASCADE ON UPDATE CASCADE;

-- [Create post contents table]
DROP TABLE IF EXISTS post_contents CASCADE;
CREATE TABLE post_contents (
	post_id INTEGER PRIMARY KEY REFERENCES posts(post_id) ON DELETE CASCADE ON UPDATE CASCADE,
	content VARCHAR(1000) NOT NULL,
	is_edited TrueOrFalse NOT NULL DEFAULT 'N',
	date_edited TIMESTAMP DEFAULT NULL,
	is_archived TrueOrFalse DEFAULT 'N',
	date_archived TIMESTAMP DEFAULT NULL
);

-- [Create comments table]
DROP TABLE IF EXISTS comments CASCADE;
CREATE TABLE comments(
	unique_id VARCHAR(292) UNIQUE, -- unique_id is built using post_id and comment_id used as a foreign key for other tables
	post_id INTEGER NOT NULL REFERENCES posts(post_id) ON DELETE CASCADE ON UPDATE CASCADE,
	comment_id SERIAL,
	replying_to VARCHAR(30) NULL REFERENCES comments(unique_id) ON DELETE CASCADE ON UPDATE CASCADE,
	commenter VARCHAR(30) NOT NULL REFERENCES users(user_name) ON DELETE CASCADE ON UPDATE CASCADE,
	datetime_created DATE NOT NULL DEFAULT CURRENT_DATE,
	is_deleted TrueOrFalse NOT NULL DEFAULT 'N',
	is_edited TrueOrFalse NOT NULL DEFAULT 'N',
	content VARCHAR(1000) NOT NULL,
	PRIMARY KEY (post_id, comment_id)
);

-- [Create function to concentate unique_id for comments to be used as foreign key]
CREATE OR REPLACE FUNCTION comments_insert() RETURNS trigger AS '
     BEGIN
         NEW.unique_id := NEW.post_id||''#''||NEW.comment_id;
         RETURN NEW;
     END;
 ' LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER comments_insert
	BEFORE INSERT OR UPDATE ON comments
	FOR EACH ROW EXECUTE PROCEDURE comments_insert();

-- [Create followed_communities]
DROP TABLE IF EXISTS followed_communities CASCADE;
CREATE TABLE followed_communities(
	community_name VARCHAR(21) NOT NULL REFERENCES community(community_name) ON DELETE CASCADE ON UPDATE CASCADE,
	user_name VARCHAR(30) NOT NULL REFERENCES users(user_name) ON DELETE CASCADE ON UPDATE CASCADE,
	followed_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [Create rules table]
DROP TABLE IF EXISTS rules CASCADE;
CREATE TABLE rules (
	unique_id VARCHAR(292) UNIQUE, -- unique_id is built using community_name and rules_id used as a foreign key for other tables
	community_name VARCHAR(21) NOT NULL REFERENCES community(community_name) ON DELETE CASCADE ON UPDATE CASCADE,
	rules_id SERIAL,
	title VARCHAR(300) NOT NULL,
	description VARCHAR(1000) NOT NULL,
	PRIMARY KEY (community_name, rules_id)
-- TODO allow sorting order of rules
);

-- [Create function to concentate unique_id for rules to be used as foreign key ]
CREATE OR REPLACE FUNCTION rules_insert() RETURNS trigger AS '
     BEGIN
         NEW.unique_id := NEW.community_name||''#''||NEW.rules_id;
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
	giver VARCHAR(30) NOT NULL REFERENCES users(user_name) ON DELETE CASCADE ON UPDATE CASCADE,
	receiver VARCHAR(30) NOT NULL REFERENCES users(user_name) ON DELETE CASCADE ON UPDATE CASCADE
	-- TODO check for both post_id and comment_id cannot be null at same time, one of them must be null
);

-- [Create hide_or_fav_posts table]
DROP TABLE IF EXISTS hide_or_fav_posts CASCADE;
CREATE TABLE hide_or_fav_posts (
	post_id INTEGER DEFAULT NULL REFERENCES posts(post_id) ON DELETE CASCADE ON UPDATE CASCADE,
	user_name VARCHAR(30) NOT NULL REFERENCES users(user_name) ON DELETE CASCADE ON UPDATE CASCADE,
	hide_or_favourite TrueOrFalse NOT NULL,
	PRIMARY KEY (post_id, user_name)
);

-- -- [Create notifications table]
-- DROP TABLE IF EXISTS notifications CASCADE;
-- CREATE TABLE notifications (
-- 	notification_id SERIAL PRIMARY KEY,
-- 	user_name VARCHAR(30) NOT NULL REFERENCES users(user_name) ON DELETE CASCADE ON UPDATE CASCADE,
-- 	post_id INTEGER NOT NULL REFERENCES posts(post_id) ON DELETE CASCADE ON UPDATE CASCADE,
-- 	unique_comment_id VARCHAR(292) NOT NULL REFERENCES comments(unique_id) ON DELETE CASCADE ON UPDATE CASCADE,
-- 	date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
-- 	title VARCHAR(300) NOT NULL,
-- 	content VARCHAR(1000) NOT NULL,
-- 	is_read TrueOrFalse NOT NULL
-- );

-- [Create moderators table]
DROP TABLE IF EXISTS moderators CASCADE;
CREATE TABLE moderators(
	community_name VARCHAR(21) NOT NULL REFERENCES community(community_name) ON DELETE CASCADE ON UPDATE CASCADE,
	user_name VARCHAR(30) NOT NULL REFERENCES users(user_name) ON DELETE CASCADE ON UPDATE CASCADE,
	is_admin TrueOrFalse NOT NULL DEFAULT 'N'
);

-- [Create banlist table]
DROP TABLE IF EXISTS banlist CASCADE;
CREATE TABLE banlist(
	unique_rule_id VARCHAR(292) NOT NULL REFERENCES rules(unique_id) ON DELETE CASCADE ON UPDATE CASCADE,
	community_name VARCHAR(21) NOT NULL REFERENCES community(community_name) ON DELETE CASCADE ON UPDATE CASCADE,
	user_name VARCHAR(30) NOT NULL REFERENCES users(user_name) ON DELETE CASCADE ON UPDATE CASCADE,
	is_approved TrueOrFalse NOT NULL DEFAULT 'N',
	PRIMARY KEY (community_name, user_name)
);

-- Insert default user testaccount
INSERT into users (user_name, password, email, user_description)
	VALUES ('testaccount', 'a49425421365d534c88d93fd6d04b94df756988254b31aec08850bd37a265832', 'test@gmail.com', 'Hello! Welcome to testaccount profile page');
INSERT into users (user_name, password, email, user_description)
	VALUES ('anotheraccount', 'a49425421365d534c88d93fd6d04b94df756988254b31aec08850bd37a265832', 'anothertest@gmail.com', 'hi im anothertest');
INSERT into users (user_name, password, email, user_description)
	VALUES ('test1', 'a49425421365d534c88d93fd6d04b94df756988254b31aec08850bd37a265832', 'test1@gmail.com', 'test1 description');
INSERT into users (user_name, password, email)
	VALUES ('test2', 'a49425421365d534c88d93fd6d04b94df756988254b31aec08850bd37a265832', 'test2@gmail.com');
INSERT into users (user_name, password, email)
	VALUES ('test3', 'a49425421365d534c88d93fd6d04b94df756988254b31aec08850bd37a265832', 'test3@gmail.com');
-- Insert default community
INSERT INTO community (community_name, colour, description) VALUES ('test_community', '#E30D00', 'This is the very first community created ever!');
INSERT INTO community (community_name, colour) VALUES ('another_community', '#0D976F');
INSERT INTO community (community_name, description) VALUES ('community_w_no_posts', 'This is an empty community that should not have any posts');
INSERT INTO community (community_name, description) VALUES ('banned_community', 'testaccount should be banned from this community and not be able to view it');
-- Insert rules
INSERT INTO rules (community_name, title, description) VALUES ('test_community', 'This is the first rule', 'This is the first rule for test_community.');
INSERT INTO rules (community_name, title, description) VALUES ('test_community', 'This is the second rule', 'This is the second rule for test_community.');
INSERT INTO rules (community_name, title, description) VALUES ('community_w_no_posts', 'This a lonely rule here.', 'There is only one rule here in community_w_no_posts.');
INSERT INTO rules (community_name, title, description) VALUES ('banned_community', 'Rules 1 for banned_community', 'Testaccount ought to be banned from here.');
-- Insert banlist
INSERT INTO banlist (unique_rule_id, community_name, user_name, is_approved)
	VALUES ('banned_community#4', 'banned_community', 'testaccount', 'Y');
INSERT INTO banlist (unique_rule_id, community_name, user_name, is_approved)
	VALUES ('test_community#2', 'test_community', 'test3', 'N');
-- Insert followed community
INSERT INTO followed_communities (community_name, user_name) VALUES ('test_community', 'testaccount');
INSERT INTO followed_communities (community_name, user_name) VALUES ('another_community', 'testaccount');
-- Insert moderators
INSERT INTO moderators (community_name, user_name, is_admin)
	VALUES ('test_community', 'testaccount', 'Y');
INSERT INTO moderators (community_name, user_name, is_admin)
	VALUES ('test_community', 'test1', 'N');
INSERT INTO moderators (community_name, user_name, is_admin)
	VALUES ('test_community', 'test3', 'N');
INSERT INTO moderators (community_name, user_name, is_admin)
	VALUES ('banned_community', 'test1', 'Y');
INSERT INTO moderators (community_name, user_name, is_admin)
	VALUES ('another_community', 'test1', 'Y');
INSERT INTO moderators (community_name, user_name, is_admin)
	VALUES ('another_community', 'test2', 'Y');
INSERT INTO moderators (community_name, user_name, is_admin)
	VALUES ('another_community', 'test3', 'Y');
-- Insert flairs
INSERT INTO community_flairs (community_name, flair_name, flair_id)
	VALUES ('community_w_no_posts', 'Text', '4b36afc8-5205-49c1-af16-4dc6f96db982');
INSERT INTO community_flairs (community_name, flair_name, flair_id)
	VALUES ('banned_community', 'Text', '4b36afc8-5205-49c1-af16-4dc6f96db982');
INSERT INTO community_flairs (community_name, flair_name, flair_id)
	VALUES ('another_community', 'Text', '4b36afc8-5205-49c1-af16-4dc6f96db982');
INSERT INTO community_flairs (community_name, flair_name, flair_id)
	VALUES ('test_community', 'Text', '4b36afc8-5205-49c1-af16-4dc6f96db982');
INSERT INTO community_flairs (community_name, flair_name, flair_id, colour)
	VALUES ('test_community', 'Red flair', '5b36afc8-5205-49c1-af16-4dc6f96db982', '#E30D00');
INSERT INTO community_flairs (community_name, flair_name, flair_id, colour)
	VALUES ('test_community', 'Green  flair', '6b36afc8-5205-49c1-af16-4dc6f96db982', '#0D976F');
-- Insert Posts data
--
INSERT INTO posts (community_name, title, user_name, selected_flair_id)
	VALUES ('test_community', 'Hello World One!', 'testaccount', 'test_community#4b36afc8-5205-49c1-af16-4dc6f96db982');
INSERT INTO post_contents (post_id, content)
	VALUES (1, 'This is post content for hello world one.');
--
INSERT INTO posts (community_name, title, user_name, selected_flair_id)
	VALUES ('test_community', 'Hello World Two!', 'test2', 'test_community#5b36afc8-5205-49c1-af16-4dc6f96db982');
INSERT INTO post_contents (post_id, content)
	VALUES (2, 'This is post content for hello world two.');
--
INSERT INTO posts (community_name, title, user_name, selected_flair_id)
	VALUES ('test_community', 'This post should be hidden for testaccount user!', 'anotheraccount', 'test_community#6b36afc8-5205-49c1-af16-4dc6f96db982');
INSERT INTO post_contents (post_id, content)
	VALUES (3, 'testaccount user should not be able to view this post!');
INSERT INTO hide_or_fav_posts (post_id, user_name, hide_or_favourite)
	VALUES (3, 'testaccount', 'Y');
--
INSERT INTO posts (community_name, title, user_name, selected_flair_id)
	VALUES ('test_community', 'This post should be favourited for testaccount user!', 'test3', 'test_community#4b36afc8-5205-49c1-af16-4dc6f96db982');
INSERT INTO post_contents (post_id, content)
	VALUES (4, 'This post should appear as favourited for testaccount user!');
INSERT INTO hide_or_fav_posts (post_id, user_name, hide_or_favourite)
	VALUES (4, 'testaccount', 'N');
--
INSERT INTO posts (community_name, title, user_name, selected_flair_id)
	VALUES ('test_community', 'This post should be pinned when viewing test_community!', 'testaccount', 'test_community#5b36afc8-5205-49c1-af16-4dc6f96db982');
INSERT INTO post_contents (post_id, content)
	VALUES (5, 'This post should be pinned for test_community.');
UPDATE community SET pinned_post = 3 WHERE community_name = 'test_community';
--
INSERT INTO posts (community_name, title, user_name, selected_flair_id)
	VALUES ('test_community', 'This post should have 5 comments and 2 likes!', 'testaccount', 'test_community#6b36afc8-5205-49c1-af16-4dc6f96db982');
INSERT INTO favours (post_id, favour_point, giver, receiver)
	VALUES (6, 1, 'testaccount', 'testaccount');
INSERT INTO favours (post_id, favour_point, giver, receiver)
	VALUES (6, 1, 'anotheraccount', 'testaccount');
INSERT INTO favours (post_id, favour_point, giver, receiver)
	VALUES (6, 1, 'test1', 'testaccount');
INSERT INTO favours (post_id, favour_point, giver, receiver)
	VALUES (6, -1, 'test2', 'testaccount');
INSERT INTO post_contents (post_id, content)
	VALUES (6, 'This post should be pinned for test_community.');
INSERT INTO comments (post_id, commenter, content)
	VALUES (6, 'testaccount', 'This should be the first comment.');
INSERT INTO comments (post_id, replying_to, commenter, is_edited, content)
	VALUES (6, '6#1', 'anotheraccount', 'Y', 'The second comment should be replying the first comment and show as edited.');
INSERT INTO comments (post_id, replying_to, commenter, is_deleted, content)
	VALUES (6, '6#2', 'anotheraccount', 'Y', 'The third comment should be replying the second comment and show should show as deleted.');
INSERT INTO comments (post_id, commenter, content)
	VALUES (6, 'test1', 'This should be a comment by itself with 3 likes.');
INSERT INTO favours (unique_comment_id, favour_point, giver, receiver)
	VALUES ('6#4', 1, 'testaccount', 'test1');
INSERT INTO favours (unique_comment_id, favour_point, giver, receiver)
	VALUES ('6#4', 1, 'test2', 'test1');
INSERT INTO favours (unique_comment_id, favour_point, giver, receiver)
	VALUES ('6#4', 1, 'test3', 'test1');
INSERT INTO favours (unique_comment_id, favour_point, giver, receiver)
	VALUES ('6#4', -1, 'anotheraccount', 'test1');
INSERT INTO favours (unique_comment_id, favour_point, giver, receiver)
	VALUES ('6#4', 1, 'test1', 'test1');
--
INSERT INTO posts (community_name, title, user_name, selected_flair_id)
	VALUES ('another_community', 'Hello World One for another_community!', 'test1', 'test_community#5b36afc8-5205-49c1-af16-4dc6f96db982');
INSERT INTO post_contents (post_id, content)
	VALUES (7, 'This is post content for hello world for another_community post.');
--
INSERT INTO posts (community_name, title, user_name, selected_flair_id)
	VALUES ('banned_community', 'testaccount should not be able to see this post as he is banned from here!', 'anotheraccount', 'banned_community#4b36afc8-5205-49c1-af16-4dc6f96db982');
INSERT INTO post_contents (post_id, content)
	VALUES (8, 'testaccount should not be able to see this post... as he is banned.');
--