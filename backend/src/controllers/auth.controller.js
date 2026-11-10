import * as authService from "../services/auth.service.js";

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const result = await authService.registerUser({ name, email, password, role });
    res.status(201).json({
      status: "success",
      message: "User registered successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser({ email, password });
    res.status(200).json({
      status: "success",
      message: "Login successful",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      status: "success",
      data: { user: req.user }
    });
  } catch (error) {
    next(error);
  }
};
