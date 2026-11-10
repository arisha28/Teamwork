import { User } from "../models/User.js";
import { NotFoundError, BadRequestError } from "../utils/AppError.js";

export const getAllUsers = async () => {
  return User.find().sort({ createdAt: -1 });
};

export const getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    throw new NotFoundError("User not found.");
  }
  return user;
};

export const updateUser = async (id, updateData) => {
  const allowedUpdates = ["name", "role"];
  const updates = {};
  for (const key of allowedUpdates) {
    if (updateData[key] !== undefined) {
      updates[key] = updateData[key];
    }
  }

  const user = await User.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true
  });

  if (!user) {
    throw new NotFoundError("User not found.");
  }
  return user;
};

export const setUserStatus = async (id, status) => {
  if (!["active", "disabled"].includes(status)) {
    throw new BadRequestError("Invalid status. Must be 'active' or 'disabled'.");
  }

  const user = await User.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new NotFoundError("User not found.");
  }
  return user;
};
