const { getPostByIdAndCommunityName } = require('../db/post');
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
//   "datetime_created": "2022-09-26T12:38:45.614Z",
//   "datetime_deleted": null
// }
exports.getPost = async (req, resp) => {
    const currentUser = req.token.username;
    const results = await getPostByIdAndCommunityName(
        req.params.postId,
        req.params.communityName,
        currentUser,
    );
    if (results.rows.length === 0) {
        resp.status(404);
        resp.type('application/json');
        resp.json({ message: 'Post not found!' });
        return;
    }
    const post = results.rows[0];

    const commentsResult = await getCommentsByPostId(currentUser, post.post_id, post.community_name);
    let comments = commentsResult.rows;

    for (const cmt of comments) {
        await queryReplyComments(cmt, currentUser);
    }
    comments = addIsCommenter(comments, currentUser);

    const commentCount = getCommentCount(comments);
    resp.status(200);
    resp.type('application/json');
    resp.json(
        {
            ...post,
            comments,
            comment_count: commentCount,
        },
    );
};

async function queryReplyComments(comment, currentUser) {
    let rs = await getReplyComments(currentUser, comment.comment_id, comment.community_name, comment.post_id);
    let replyComments = rs.rows;
    if (replyComments.length === 0) {
        return;
    }

    for (const cmt of replyComments) {
        await queryReplyComments(cmt, currentUser);
    }

    comment['reply_comments'] = replyComments;
}

function addIsCommenter(comments, currentUser) {
    if (!comments) return [];


    return comments.map((cmt) => {
        cmt['is_commenter'] = (cmt['commenter'] === currentUser);
        cmt['reply_comments'] = addIsCommenter(cmt['reply_comments'], currentUser);
        return cmt;
    });
}

function getCommentCount(comments) {
    let count = 0;
    if (!comments) return count;
    count += comments.length;
    for (const cmt of comments) {
        count += getCommentCount(cmt['reply_comments']);
    }
    return count;
}