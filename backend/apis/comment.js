const { createComment, getCommentsById, updateComment } = require('../db/comment');

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

exports.updateComment = async (req, resp) => {
    let username = req.token.username;
    let newContent = req.body.content;
    if (!newContent) {
        resp.status(400);
        resp.type('application/json');
        resp.json({ message: 'invalid request' });
        return;
    }

    let commentFromDB = await getCommentsById(req.params.commentId);

    if (commentFromDB.rows.length === 0) {
        resp.status(404);
        resp.type('application/json');
        resp.json({ message: 'comment not found' });
        return;
    }

    let comment = commentFromDB.rows[0];
    console.log(comment);

    console.log(username);
    if (comment['commenter'] !== username) {
        resp.status(401);
        resp.type('application/json');
        resp.json({ message: 'unauthorized' });
        return;
    }


    const updatedComment = await updateComment(comment['comment_id'], newContent);

    resp.status(204);
    resp.type('application/json');
    resp.json(
        {
            ...updatedComment.rows[0],
        },
    );
};
