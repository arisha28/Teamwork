import * as commentService from "../services/comment.service.js";

export const createComment = async (req, res, next) => {
  try {
    const comment = await commentService.createComment(req.params.taskId, req.user._id, req.body.content);
    res.status(201).json({ status: "success", data: comment });
  } catch (error) {
    next(error);
  }
};

export const getComments = async (req, res, next) => {
  try {
    const comments = await commentService.getCommentsByTask(req.params.taskId);
    res.status(200).json({ status: "success", data: comments });
  } catch (error) {
    next(error);
  }
};

export const updateComment = async (req, res, next) => {
  try {
    const comment = await commentService.updateComment(req.params.commentId, req.user._id, req.body.content);
    res.status(200).json({ status: "success", data: comment });
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const result = await commentService.deleteComment(req.params.commentId, req.user._id, req.user.role);
    res.status(200).json({ status: "success", ...result });
  } catch (error) {
    next(error);
  }
};
