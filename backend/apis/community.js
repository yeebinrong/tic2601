const { getCommunityByName, getCommunityMemberCount, getFollowedCommunities } = require('../db/community');


// return community info
// example:
//{
//   "community_name": "test_community",
//   "datetime_created": "2022-09-26T12:38:45.608Z",
//   "description": "This is the very first community created ever!",
//   "profile_picture": null,
//   "colour": "#E30D00",
//   "member_count": "1",
//   "joined": true
// }
exports.getCommunity = async (req, resp) => {
    const results = await getCommunityByName(req.params.communityName);
    const memberCount = await getCommunityMemberCount(req.params.communityName);
    const followedCommunities = await getFollowedCommunities(req.token.username);


    const joined = followedCommunities.rows.map(e => e.community_name).includes(req.params.communityName);

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
            member_count: memberCount.rows[0].count,
            joined: joined
        },
    );
};