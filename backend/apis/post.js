const { getPostById } = require('../db/post');
// return post info
// example:
// {
//   "post_id": 1,
//   "user_name": "testaccount",
//   "selected_flair_id": "test_community#4b36afc8-5205-49c1-af16-4dc6f96db982",
//   "community_name": "test_community",
//   "url": null,
//   "title": "Hello World One!",
//   "date_created": "2022-09-26T12:38:45.614Z",
//   "date_deleted": null
// }
exports.getPost = async (req, resp) => {
    const results = await getPostById(req.params.postId);
    if (results.rows.length === 0) {
        resp.status(404);
        resp.type('application/json');
        resp.json({ message: 'Post not found!' });
        return;
    }
    resp.status(200);
    resp.type('application/json');
    resp.json(
        {
            ...results.rows[0],
        },
    );
};