import * as userService from "../services/user.service.js";

export const getUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json({ status: "success", data: users });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.status(200).json({ status: "success", data: user });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    res.status(200).json({ status: "success", data: user });
  } catch (error) {
    next(error);
  }
};

export const setUserStatus = async (req, res, next) => {
  try {
    const user = await userService.setUserStatus(req.params.id, req.body.status);
    res.status(200).json({ status: "success", data: user });
  } catch (error) {
    next(error);
  }
};
