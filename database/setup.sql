-- [Add uuid extension if not exists]
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- [Create enums]
DO $$
BEGIN
	DROP TYPE flairenum CASCADE;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'flairenum') THEN
        CREATE TYPE FlairEnum AS ENUM ('Text', 'News', 'Discussion', 'Photo', 'Video');
    END IF;
END$$;

-- [Create functions]
-- Select posts with params func
-- TODO join for comments, likes, banlist,
-- TODO add logic for order by hot, best
CREATE OR REPLACE FUNCTION searchPostWithParamsFunc(
	currentUser text, orderParam text, userFilter text, flairFilter text, communityFilter text, queryFilter text)
  RETURNS TABLE(
	post_id INTEGER,
	community_name VARCHAR(21),
	user_name VARCHAR(30),
	age INTERVAL,
	datetime_created TIMESTAMP,
	title VARCHAR(300),
	flair FlairEnum,
	fav_point BIGINT,
	is_favour INTEGER,
	comment_count BIGINT,
	view_count INTEGER,
	url VARCHAR(2048),
	profile_picture VARCHAR(256),
	post_profile_picture VARCHAR(256)
  )
  LANGUAGE plpgsql AS
$func$
DECLARE
        paramQuery text := ' WHERE ';
		appendParam text := ' ';
		BEGIN
		raise notice 'userFilter: %', userFilter;
        IF userFilter != '' THEN
            paramQuery = paramQuery || appendParam || 'user_name = ' || '''' || userFilter || '''';
			appendParam = ' AND ';
        END IF;
        IF flairFilter != '' THEN
            paramQuery = paramQuery || appendParam || 'flair = ' || '''' || flairFilter || '''';
			appendParam = ' AND ';
        END IF;
        IF communityFilter != '' THEN
            paramQuery = paramQuery || appendParam || 'community_name = ' || '''' || communityFilter || '''';
			appendParam = ' AND ';
        END IF;
        IF queryFilter != '' THEN
            paramQuery = paramQuery || appendParam || 'title ILIKE ' || '''' || '%' || queryFilter || '%' || '''';
			appendParam = ' AND ';
        END IF;
		CASE orderParam
			WHEN 'new' THEN
				paramQuery = paramQuery || ' ORDER BY age ASC';
			WHEN 'hot' THEN
				paramQuery = paramQuery || ' ORDER BY view_count DESC';
			WHEN 'best' THEN
				paramQuery = paramQuery || ' ORDER BY fav_point DESC';
			ELSE
		END CASE;
		RAISE NOTICE 'Value: %', 'SELECT * FROM posts' || paramQuery;
        RETURN QUERY EXECUTE
        'WITH all_communities AS
			(SELECT ac.community_name, p.user_name, AGE(CURRENT_TIMESTAMP, p.datetime_created), p.datetime_created, p.title, p.flair, p.url, p.post_id, p.view_count,
				(SELECT favour_point FROM total_post_favours WHERE post_id = p.post_id AND community_name = p.community_name) AS fav_point, fp.favour_point AS is_favour,
				(SELECT count(*) FROM comments WHERE post_id = p.post_id AND community_name = p.community_name) AS comment_count, u.profile_picture,
				(SELECT profile_picture FROM community WHERE community_name = ac.community_name) as post_profile_picture
			FROM community ac
                INNER JOIN posts p ON p.community_name = ac.community_name AND p.datetime_deleted IS NULL
                LEFT JOIN post_favours fp ON fp.post_id = p.post_id AND fp.community_name = p.community_name AND fp.giver = $1
                LEFT JOIN users u ON u.user_name = p.user_name
            GROUP BY ac.community_name, p.user_name, p.datetime_created, p.title, p.flair, p.url, p.post_id, p.view_count, p.community_name, fp.favour_point, u.profile_picture)
            SELECT DISTINCT post_id, community_name, user_name, age, datetime_created, title, flair, fav_point, is_favour, comment_count, view_count, url, profile_picture, post_profile_picture
            FROM all_communities' || paramQuery USING currentUser;
END;
$func$;

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
	datetime_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- [Create community table]
DROP TABLE IF EXISTS community CASCADE;
CREATE TABLE community (
	community_name VARCHAR(21)
		PRIMARY KEY,
		CHECK(length(community_name) > 3 AND length(community_name) < 21
		AND community_name ~* '^[A-Za-z0-9_\-]+$' AND community_name !~* '\_%'),
	datetime_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	description VARCHAR(256) NOT NULL DEFAULT 'Describe the community.',
	profile_picture VARCHAR(256),
	colour CHAR(7) NOT NULL DEFAULT '#00b2d2' CHECK(colour ~* '^#[A-Fa-f0-9]{6}$') -- Colour theme of the community
);

-- [Create posts table]
DROP TABLE IF EXISTS posts CASCADE;
CREATE TABLE posts (
	community_name VARCHAR(21) NOT NULL REFERENCES community(community_name) ON DELETE CASCADE ON UPDATE CASCADE,
	post_id INTEGER NOT NULL,
	user_name VARCHAR(30) NOT NULL REFERENCES users(user_name) ON DELETE CASCADE ON UPDATE CASCADE,
	flair FlairEnum NOT NULL,
	url VARCHAR(2048),
	title VARCHAR(300) NOT NULL,
	datetime_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	datetime_deleted TIMESTAMP DEFAULT NULL,
	view_count INTEGER NOT NULL DEFAULT 0,
	PRIMARY KEY (post_id, community_name)
);

-- [Create post contents table]
DROP TABLE IF EXISTS post_contents CASCADE;
CREATE TABLE post_contents (
	community_name VARCHAR(21) NOT NULL,
	post_id INTEGER NOT NULL,
	content VARCHAR(1000) NOT NULL,
	is_edited BOOLEAN NOT NULL DEFAULT FALSE,
	datetime_edited TIMESTAMP DEFAULT NULL,
	PRIMARY KEY (post_id, community_name),
	CONSTRAINT PFK
	FOREIGN KEY (community_name, post_id)
	REFERENCES  posts(community_name, post_id)
	ON DELETE CASCADE ON UPDATE CASCADE
);

-- [Create comments table]
DROP TABLE IF EXISTS comments CASCADE;
CREATE TABLE comments(
	community_name VARCHAR(21) NOT NULL,
	post_id INTEGER NOT NULL,
	comment_id INTEGER NOT NULL,
	replying_to INTEGER DEFAULT NULL,
	commenter VARCHAR(30) NOT NULL REFERENCES users(user_name) ON DELETE CASCADE ON UPDATE CASCADE,
	datetime_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
	is_edited BOOLEAN NOT NULL DEFAULT FALSE,
	content VARCHAR(1000) NOT NULL,
	PRIMARY KEY (community_name, post_id, comment_id),
	CONSTRAINT PFK
	FOREIGN KEY (community_name, post_id)
	REFERENCES post_contents(community_name, post_id)
	ON DELETE CASCADE ON UPDATE CASCADE
);

-- [Create followed_communities]
DROP TABLE IF EXISTS followed_communities CASCADE;
CREATE TABLE followed_communities(
	community_name VARCHAR(21) NOT NULL REFERENCES community(community_name) ON DELETE CASCADE ON UPDATE CASCADE,
	user_name VARCHAR(30) NOT NULL REFERENCES users(user_name) ON DELETE CASCADE ON UPDATE CASCADE,
	followed_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (community_name, user_name)
);

-- [Create post_favours table]
DROP TABLE IF EXISTS post_favours CASCADE;
CREATE TABLE post_favours (
	community_name VARCHAR(21) NOT NULL,
	post_id INTEGER NOT NULL,
	giver VARCHAR(30) NOT NULL REFERENCES users(user_name) ON DELETE CASCADE ON UPDATE CASCADE,
	receiver VARCHAR(30) NOT NULL REFERENCES users(user_name) ON DELETE CASCADE ON UPDATE CASCADE,
	favour_point INTEGER NOT NULL CHECK(favour_point=1 OR favour_point=-1),
	PRIMARY KEY (community_name, post_id, giver, receiver),
	CONSTRAINT PFK
	FOREIGN KEY (community_name, post_id)
	REFERENCES posts(community_name, post_id)
	ON DELETE CASCADE ON UPDATE CASCADE
);

-- [Create comment_favours table]
DROP TABLE IF EXISTS comment_favours CASCADE;
CREATE TABLE comment_favours (
	community_name VARCHAR(21) NOT NULL,
	post_id INTEGER NOT NULL,
	comment_id INTEGER NOT NULL,
	giver VARCHAR(30) NOT NULL REFERENCES users(user_name) ON DELETE CASCADE ON UPDATE CASCADE,
	receiver VARCHAR(30) NOT NULL REFERENCES users(user_name) ON DELETE CASCADE ON UPDATE CASCADE,
	favour_point INTEGER NOT NULL CHECK(favour_point=1 OR favour_point=-1),
	PRIMARY KEY (community_name, post_id, comment_id, giver),
	CONSTRAINT PFK
	FOREIGN KEY (community_name, post_id, comment_id)
	REFERENCES comments(community_name, post_id, comment_id)
	ON DELETE CASCADE ON UPDATE CASCADE
);

-- [Create moderators table]
DROP TABLE IF EXISTS moderators CASCADE;
CREATE TABLE moderators(
	community_name VARCHAR(21) NOT NULL REFERENCES community(community_name) ON DELETE CASCADE ON UPDATE CASCADE,
	user_name VARCHAR(30) NOT NULL REFERENCES users(user_name) ON DELETE CASCADE ON UPDATE CASCADE,
	is_admin BOOLEAN NOT NULL DEFAULT FALSE,
	PRIMARY KEY (community_name, user_name)
);

-- [Create banlist table]
DROP TABLE IF EXISTS banlist CASCADE;
CREATE TABLE banlist(
	user_name VARCHAR(30) NOT NULL REFERENCES users(user_name) ON DELETE CASCADE ON UPDATE CASCADE,
	community_name VARCHAR(21) NOT NULL,
	is_approved BOOLEAN NOT NULL DEFAULT FALSE,
	PRIMARY KEY (community_name, user_name),
	CONSTRAINT PFK
	FOREIGN KEY (community_name)
	REFERENCES community(community_name)
	ON DELETE CASCADE ON UPDATE CASCADE
);

DROP VIEW IF EXISTS total_community_favours;
CREATE OR REPLACE VIEW total_community_favours AS
	SELECT community_name, COALESCE(
	(SELECT SUM(favour_point) FROM (
		SELECT favour_point FROM post_favours WHERE community_name = cm.community_name
			UNION ALL
		SELECT favour_point FROM comment_favours WHERE community_name = cm.community_name)
	as fp), 0) AS favour_point
	FROM community cm;

DROP VIEW IF EXISTS total_post_favours;
CREATE OR REPLACE VIEW total_post_favours AS
	SELECT post_id, community_name, COALESCE(
		(SELECT SUM(favour_point)
			FROM post_favours
			WHERE post_id = p.post_id AND community_name = p.community_name)
		, 0) as favour_point
	FROM posts p;

DROP VIEW IF EXISTS total_comment_favours;
CREATE OR REPLACE VIEW total_comment_favours AS
	SELECT comment_id, post_id, community_name, COALESCE(
		(SELECT SUM(favour_point)
			FROM comment_favours
			WHERE comment_id = c.comment_id AND post_id = c.post_id AND community_name = c.community_name)
		, 0) as favour_point
	FROM comments c;

DROP VIEW IF EXISTS total_user_favours;
CREATE OR REPLACE VIEW total_user_favours AS
	SELECT user_name,
	COALESCE((SELECT SUM(fp.favour_point)
        FROM
            (SELECT favour_point
                FROM post_favours
                WHERE receiver = u.user_name
                UNION ALL SELECT favour_point
                FROM comment_favours
                WHERE receiver = u.user_name) AS fp), 0) as favour_point
	FROM users u;

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
-- Insert banlist
INSERT INTO banlist (community_name, user_name, is_approved)
	VALUES ('banned_community','testaccount', TRUE);
INSERT INTO banlist (community_name, user_name, is_approved)
	VALUES ('test_community', 'test3', FALSE);
-- Insert followed community
INSERT INTO followed_communities (community_name, user_name) VALUES ('test_community', 'testaccount');
INSERT INTO followed_communities (community_name, user_name) VALUES ('another_community', 'testaccount');
-- Insert moderators
INSERT INTO moderators (community_name, user_name, is_admin)
	VALUES ('test_community', 'testaccount', TRUE);
INSERT INTO moderators (community_name, user_name, is_admin)
	VALUES ('test_community', 'test1', FALSE);
INSERT INTO moderators (community_name, user_name, is_admin)
	VALUES ('test_community', 'test3', FALSE);
INSERT INTO moderators (community_name, user_name, is_admin)
	VALUES ('banned_community', 'test1', TRUE);
INSERT INTO moderators (community_name, user_name, is_admin)
	VALUES ('another_community', 'test1', TRUE);
INSERT INTO moderators (community_name, user_name, is_admin)
	VALUES ('another_community', 'test2', TRUE);
INSERT INTO moderators (community_name, user_name, is_admin)
	VALUES ('another_community', 'test3', TRUE);
-- Insert Posts data
--
INSERT INTO posts (post_id, community_name, title, user_name, flair)
	VALUES (1, 'test_community', 'Hello World One!', 'testaccount', 'Text');
INSERT INTO post_contents (community_name, post_id, content)
	VALUES ('test_community', 1, 'This is post content for hello world one.');
--
INSERT INTO posts (post_id, community_name, title, user_name, flair)
	VALUES (2, 'test_community', 'Hello World Two!', 'test2', 'Text');
INSERT INTO post_contents (community_name, post_id, content)
	VALUES ('test_community', 2, 'This is post content for hello world two.');
--
INSERT INTO posts (post_id, community_name, title, user_name, flair)
	VALUES (3, 'test_community', 'This post is by anotheraccount user!', 'anotheraccount', 'Text');
INSERT INTO post_contents (community_name, post_id, content)
	VALUES ('test_community', 3, 'testaccount user should not be able to view this post!');
--
INSERT INTO posts (post_id, community_name, title, user_name, flair)
	VALUES (4, 'test_community', 'This post is by testaccount user!', 'test3', 'Text');
INSERT INTO post_contents (community_name, post_id, content)
	VALUES ('test_community', 4, 'This post is by testaccount user!');
--
INSERT INTO posts (post_id, community_name, title, user_name, flair)
	VALUES (5, 'test_community', 'This post should be is for test_community!', 'testaccount', 'Text');
INSERT INTO post_contents (community_name, post_id, content)
	VALUES ('test_community', 5, 'This post content should be is for test_community.');
--
INSERT INTO posts (post_id, community_name, title, user_name, flair)
	VALUES (6, 'test_community', 'This post should have 4 comments and 2 likes!', 'testaccount', 'Text');
INSERT INTO post_favours (community_name, post_id, favour_point, giver, receiver)
	VALUES ('test_community', 6, 1, 'testaccount', 'testaccount');
INSERT INTO post_favours (community_name, post_id, favour_point, giver, receiver)
	VALUES ('test_community', 6, 1, 'anotheraccount', 'testaccount');
INSERT INTO post_favours (community_name, post_id, favour_point, giver, receiver)
	VALUES ('test_community', 6, 1, 'test1', 'testaccount');
INSERT INTO post_favours (community_name, post_id, favour_point, giver, receiver)
	VALUES ('test_community', 6, -1, 'test2', 'testaccount');
INSERT INTO post_contents (community_name, post_id, content)
	VALUES ('test_community', 6, 'This post content should have 4 comments and 2 likes');
INSERT INTO comments (comment_id, community_name, post_id, commenter, content)
	VALUES (1, 'test_community', 6, 'testaccount', 'This should be the first comment.');
INSERT INTO comments (comment_id, community_name, post_id, replying_to, commenter, is_edited, content)
	VALUES (2, 'test_community', 6, 1, 'anotheraccount', TRUE, 'The second comment should be replying the first comment and show as edited.');
INSERT INTO comments (comment_id, community_name, post_id, replying_to, commenter, is_deleted, content)
	VALUES (3, 'test_community', 6, 2, 'anotheraccount', TRUE, 'The third comment should be replying the second comment and show should show as deleted.');
INSERT INTO comments (comment_id, community_name, post_id, commenter, content)
	VALUES (4, 'test_community', 6, 'test1', 'This should be a comment by itself with 3 likes.');
INSERT INTO comment_favours (community_name, post_id, comment_id, favour_point, giver, receiver)
	VALUES ('test_community', 6, 4, 1, 'testaccount', 'test1');
INSERT INTO comment_favours (community_name, post_id, comment_id, favour_point, giver, receiver)
	VALUES ('test_community', 6, 4, 1, 'test2', 'test1');
INSERT INTO comment_favours (community_name, post_id, comment_id, favour_point, giver, receiver)
	VALUES ('test_community', 6, 4, 1, 'test3', 'test1');
INSERT INTO comment_favours (community_name, post_id, comment_id, favour_point, giver, receiver)
	VALUES ('test_community', 6, 4, -1, 'anotheraccount', 'test1');
INSERT INTO comment_favours (community_name, post_id, comment_id, favour_point, giver, receiver)
	VALUES ('test_community', 6, 4, 1, 'test1', 'test1');
--
INSERT INTO posts (post_id, community_name, title, user_name, flair)
	VALUES (1, 'another_community', 'Hello World One for another_community!', 'test1', 'Text');
INSERT INTO post_contents (community_name, post_id, content)
	VALUES ('another_community', 1, 'This is post content for hello world for another_community post.');
--
INSERT INTO posts (post_id, community_name, title, user_name, flair)
	VALUES (1, 'banned_community', 'testaccount should not be able to see this post as he is banned from here!', 'anotheraccount', 'Text');
INSERT INTO post_contents (community_name, post_id, content)
	VALUES ('banned_community', 1, 'testaccount should not be able to see this post... as he is banned.');
--
-- Password is username in lowercase eg. user_name=Arial, password=arial
INSERT INTO users(user_name,password, email,user_description)
    VALUES ('Arial', '9b949dd8f6ceb05388ae95aea9141f6d664a6c5f5b6af4e91f92bfee49041c4a', 'arial@gmail.com', 'Golden Retriever');
INSERT INTO users(user_name,password, email,user_description)
    VALUES ('Benji', '56987df6cba487ef5295f4849bee8820d3ca701aa6d897c51ee22127e05390a0', 'benji@gmail.com', 'Jack Russsel');	
INSERT INTO users(user_name,password, email,user_description)
    VALUES ('Carter', 'e1dc69f127056e7f228e562c4905c1a09e3ad6e1c31cb5638d90df49b9a0e52a', 'carter@gmail.com', 'German Shepherd');
INSERT INTO users (user_name,password, email,user_description)
    VALUES ('Cooper', '0522bcf1efa814a5625897750561f25fdc9153639c0c01068fa661b98bef1a92', 'cooper@gmail.com', 'Bulldog');
INSERT INTO users (user_name,password, email,user_description)
    VALUES ('Cody', '7f29c003dfda781898ca47b9ce9ccb16cf6b5eb9110811c2a09db8d8f8a1e04b', 'cody@gmail.com', 'Siberian Husky');	
INSERT INTO community (community_name)
     VALUES ('Dogs');	 
INSERT INTO community (community_name)
     VALUES ('DogOwners');
INSERT INTO followed_communities (community_name, user_name) VALUES ('Dogs', 'testaccount');
INSERT INTO followed_communities (community_name, user_name) VALUES ('DogOwners', 'testaccount');
INSERT INTO moderators (community_name, user_name, is_admin)
	VALUES ('Dogs', 'Benji', TRUE);
INSERT INTO posts (post_id, community_name, title, user_name, datetime_created, flair)
	VALUES (1, 'Dogs', 'Missing Dog', 'Benji', '20220823', 'Text' );	
INSERT INTO post_contents (community_name, post_id, content)
	VALUES ('Dogs', 1, 'My dog benji is lost yesterday, it is a Jack Russel with full black hair, please contact me if anyone sees it');		
INSERT INTO comments (comment_id, community_name, post_id, commenter,datetime_created,content)
	VALUES (1, 'Dogs', 1, 'Arial', '20220823','I have found your dog, we are at dog park now, please come and pick up');	
INSERT INTO comment_favours (community_name, post_id, comment_id, favour_point, giver, receiver)
	VALUES ('Dogs', 1, 1, 1, 'Benji', 'Arial');
INSERT INTO comment_favours (community_name, post_id, comment_id, favour_point, giver, receiver)
	VALUES ('Dogs', 1, 1, 1, 'Cooper', 'Arial');
INSERT INTO comment_favours (community_name, post_id, comment_id, favour_point, giver, receiver)
	VALUES ('Dogs', 1, 1, 1, 'Cody', 'Arial');
INSERT INTO posts (post_id, community_name, title, user_name, datetime_created, flair)
	VALUES (2, 'Dogs', 'How did I find my dog', 'Benji', '20220830', 'Text');
INSERT INTO post_contents (community_name, post_id, content)
     VALUES ('Dogs', 2, 'The owner of Arial have found my dog in the park');
INSERT INTO post_favours (community_name, post_id, favour_point, giver, receiver)
	VALUES ('Dogs', 2, 1, 'Cooper', 'Benji');
INSERT INTO post_favours (community_name, post_id, favour_point, giver, receiver)
	VALUES ('Dogs', 2, 1, 'Cody', 'Benji');
INSERT INTO comments (comment_id, community_name, post_id, commenter,datetime_created,content)
	VALUES (1, 'Dogs', 2, 'Arial', '20220830','Happy to help:)');
INSERT INTO comments (comment_id, community_name, post_id,replying_to,commenter,datetime_created,content)
	VALUES (2, 'Dogs', 2, 1,'Benji', '20220830','Thank you!!');
INSERT INTO comment_favours (community_name, post_id, comment_id, favour_point, giver, receiver)
	VALUES ('Dogs', 2, 2, 1, 'Arial', 'Benji');
INSERT INTO users(user_name,password, email,user_description)
    VALUES ('Debra', 'debra', 'debra@gmail.com', 'Golden Retriever');
INSERT INTO users(user_name,password, email,user_description)
    VALUES ('Eli', 'eli', 'eli@gmail.com', 'Golden Retriever');
INSERT INTO users(user_name,password, email,user_description)
    VALUES ('Jacky', 'jacky', 'jacky@gmail.com', 'Golden Retriever');
INSERT INTO users(user_name,password, email,user_description)
    VALUES ('Kiki', 'kiki', 'kiki@gmail.com', 'Golden Retriever');
INSERT INTO users(user_name,password, email,user_description)
    VALUES ('Lucki', 'lucki', 'lucki@gmail.com', 'Golden Retriever');
INSERT INTO users(user_name,password, email,user_description)
    VALUES ('Coco','coco', 'coco@gmail.com', 'Golden Retriever');
INSERT INTO users(user_name,password, email,user_description)
    VALUES ('Penny', 'penny', 'penny@gmail.com', 'Golden Retriever');
INSERT INTO users(user_name,password, email,user_description)
    VALUES ('Suki', 'suki', 'suki@gmail.com', 'Golden Retriever');
INSERT INTO users(user_name,password, email,user_description)
    VALUES ('Tami', 'tami', 'tami@gmail.com', 'Golden Retriever');
INSERT INTO users(user_name,password, email,user_description)
    VALUES ('Vicki', 'vicki', 'vicki@gmail.com', 'Golden Retriever');
INSERT INTO users(user_name,password, email,user_description)
    VALUES ('Wiley', 'wiley', 'wiley@gmail.com', 'Golden Retriever');
INSERT INTO community(community_name, datetime_created )
    VALUES ('GoldenRetri','20220101');
INSERT INTO moderators (community_name, user_name, is_admin)
	VALUES ('DogOwners', 'Cody', TRUE);
INSERT INTO moderators (community_name, user_name, is_admin)
	VALUES ('GoldenRetri', 'Wiley', TRUE);
INSERT INTO moderators (community_name, user_name, is_admin)
	VALUES ('GoldenRetri', 'Eli', TRUE);
INSERT INTO banlist (community_name, user_name, is_approved)
	VALUES ('DogOwners', 'Tami', TRUE);
INSERT INTO banlist (community_name, user_name, is_approved)
	VALUES ('Dogs', 'Coco', FALSE);
INSERT INTO followed_communities (community_name, user_name) VALUES ('Dogs', 'Cody');
INSERT INTO followed_communities (community_name, user_name) VALUES ('DogOwners', 'Cody');
INSERT INTO followed_communities (community_name, user_name) VALUES ('GoldenRetri', 'Cody');
INSERT INTO followed_communities (community_name, user_name) VALUES ('GoldenRetri', 'Wiley');
-- Insert posts and comment 
INSERT INTO posts (post_id, community_name, title, user_name, datetime_created, flair)
	VALUES (1, 'DogOwners', 'Do you allow your dog sleep on your bed', 'Cody', '20220825', 'Text' );
INSERT INTO post_contents (community_name, post_id, content)
    VALUES ('DogOwners', 1,'If you have a dog, will you aloow it to sleep with you on your bed?');
INSERT INTO comments (comment_id, community_name, post_id,commenter,datetime_created,content)
	VALUES (1, 'DogOwners', 1, 'Arial', '20220825','yes, definitely! they need to stay with you to feel safe');
INSERT INTO comment_favours (community_name, post_id, comment_id, favour_point, giver, receiver)
	VALUES ('DogOwners', 1, 1, 1, 'Cody', 'Arial');
INSERT INTO comments (comment_id, community_name, post_id,commenter,datetime_created,content)
	VALUES (2, 'DogOwners', 1, 'Benji', '20220826','It depends on the dog, my dog likes to sleep alone');
INSERT INTO comment_favours (community_name, post_id, comment_id, favour_point, giver, receiver)
	VALUES ('DogOwners', 1, 2, 1, 'Cody', 'Benji');
INSERT INTO comment_favours (community_name, post_id, comment_id, favour_point, giver, receiver)
	VALUES ('DogOwners', 1, 2, 1, 'Cooper', 'Benji');
INSERT INTO comments (comment_id, community_name, post_id,commenter,datetime_created,content)
	VALUES (3, 'DogOwners', 1, 'Kiki', '20220826','My dog needs her space to fully stretch, she hates to stay on my bed');
INSERT INTO comment_favours (community_name, post_id, comment_id, favour_point, giver, receiver)
	VALUES ('DogOwners', 1, 3, 1, 'Cooper', 'Kiki');
INSERT INTO comments (comment_id, community_name, post_id,commenter,datetime_created,content)
	VALUES (4, 'DogOwners', 1, 'Suki', '20220827','We had a dog for 14 years that would get in bed with us for "snuggle puppy time", about 15 minutes, then get down and get in her kennel to sleep.');
INSERT INTO comment_favours (community_name, post_id, comment_id, favour_point, giver, receiver)
	VALUES ('DogOwners', 1, 4, 1, 'Cody', 'Suki');
INSERT INTO comment_favours (community_name, post_id, comment_id, favour_point, giver, receiver)
	VALUES ('DogOwners', 1, 4, 1, 'Debra', 'Suki');
INSERT INTO comment_favours (community_name, post_id, comment_id, favour_point, giver, receiver)
	VALUES ('DogOwners', 1, 4, 1, 'Eli', 'Suki');
INSERT INTO comment_favours (community_name, post_id, comment_id, favour_point, giver, receiver)
	VALUES ('DogOwners', 1, 4, 1, 'Jacky', 'Suki');
INSERT INTO comment_favours (community_name, post_id, comment_id, favour_point, giver, receiver)
	VALUES ('DogOwners', 1, 4, 1, 'Lucki', 'Suki');