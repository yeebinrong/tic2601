const { createComment, getCommentsById, updateComment, insertOrUpdateFavour } = require('../db/comment');

exports.createComment = async (req, resp) => {
    let username = req.token.username;
    let content = req.body.content;
    let postId = req.params.postId;
    let communityName = req.params.communityName;
    let replyTo = req.body.replyTo;

    let newComment = await createComment(communityName, postId, username, content, replyTo);

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

    let commentFromDB = await getCommentsById(username, req.params.commentId, req.params.communityName, req.params.postId);

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


    const updatedComment = await updateComment(comment['comment_id'], newContent, req.params.communityName, req.params.postId);

    resp.status(204);
    resp.type('application/json');
    resp.json(
        {
            ...updatedComment.rows[0],
        },
    );
};

exports.insertOrUpdateFavour = async (req, resp) => {
    let username = req.token.username;
    let communityName = req.params.communityName;
    let postId = req.params.postId;
    let commentId = req.params.commentId;
    let favourPoint = req.body.favourPoint;

    let commentFromDB = await getCommentsById(
        username,
        commentId,
        communityName,
        postId,
    );
    if (commentFromDB.rows.length === 0) {
        resp.status(404);
        resp.type('application/json');
        resp.json({ message: 'comment not found' });
        return;
    }

    const favour = await insertOrUpdateFavour(
        communityName,
        postId,
        commentId,
        username,
        commentFromDB.rows[0].commenter,
        favourPoint,
    )

    resp.status(200);
    resp.type('application/json');
    resp.json(
        {
            status: 'ok'
        },
    );

};
