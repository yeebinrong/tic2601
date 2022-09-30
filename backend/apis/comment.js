const { createComment } = require('../db/comment');

exports.createComment = async (req, resp) => {
    let username = req.token.username;
    let content = req.body.content;
    let postId = req.params.postId;
    let replyTo = req.body.replyTo;


    let newComment = await createComment(postId, username, content, replyTo);

    console.log(newComment);
    resp.status(200);
    resp.type('application/json');
    resp.json(
        {
            ...newComment.rows[0],
        },
    );
};
