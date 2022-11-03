const { POOL } = require('../server_config.js');


exports.getPostByIdAndCommunityName = (id, communityName, currentUser) => {
    return POOL.query(`
SELECT
	posts.*,
	post_contents.content,
	coalesce(favour_points.favour_point, 0) AS fav_point,
	coalesce(post_favours.favour_point, 0) AS is_favour
FROM
	posts
LEFT JOIN post_contents ON posts.post_id = post_contents.post_id
LEFT JOIN (
		SELECT
			community_name,
			post_id,
			sum(favour_point) AS favour_point
		FROM
			post_favours
		GROUP BY
			1,
			2) AS favour_points
    ON favour_points.community_name = posts.community_name
	AND favour_points.post_id = posts.post_id
LEFT JOIN post_favours ON post_favours.community_name = posts.community_name
		AND post_favours.post_id = posts.post_id
		AND post_favours.post_id = posts.post_id
		AND post_favours.giver = $1
WHERE
	posts.post_id = $2
	AND posts.community_name = $3
        `,
        [currentUser, id, communityName]);
};

