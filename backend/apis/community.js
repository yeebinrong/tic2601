const { getCommunityByName, getCommunityMemberCount } = require('../db/community');


// return community info
// example:
//{
//   "community_name": "test_community",
//   "pinned_post": 3,
//   "datetime_created": "2022-09-26T12:38:45.608Z",
//   "description": "This is the very first community created ever!",
//   "profile_picture": null,
//   "backdrop_picture": null,
//   "colour": "#E30D00",
//   "members": {
//     "count": "1"
//   }
// }
exports.getCommunity = async (req, resp) => {
    const results = await getCommunityByName(req.params.communityName);
    const memberCount = await getCommunityMemberCount(req.params.communityName);
    if (results.rows.length === 0) {
        resp.status(404);
        resp.type('application/json');
        resp.json({ message: 'Community not found!' });
        return;
    }
    resp.status(200);
    resp.type('application/json');
    resp.json(
        {
            ...results.rows[0],
            members: memberCount.rows[0],
        },
    );
};