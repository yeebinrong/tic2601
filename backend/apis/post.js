const { getPostById } = require('../db/post');
const { getReplyComments, getCommentsByPostId } = require('../db/comment');
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
    const post = results.rows[0];

    console.log(post);
    const commentsResult = await getCommentsByPostId(post.post_id);
    const comments = commentsResult.rows;
    console.log(comments);

    for (const cmt of comments) {
        await queryReplyComments(cmt);
    }

    resp.status(200);
    resp.type('application/json');
    resp.json(
        {
            ...post,
            comments,
        },
    );
};

async function queryReplyComments(comment) {
    let rs = await getReplyComments(comment.unique_id);
    let replyComments = rs.rows;
    if (replyComments.length === 0) {
        return;
    }

    for (const cmt of replyComments) {
        await queryReplyComments(cmt);
    }

    comment['reply_comments'] = replyComments;
}