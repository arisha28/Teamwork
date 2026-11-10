import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: [true, "Password is required"]
    },
    role: {
      type: String,
      enum: ["REGULAR_USER", "PROJECT_ADMIN", "SYSTEM_ADMIN"],
      default: "REGULAR_USER"
    },
    status: {
      type: String,
      enum: ["active", "disabled"],
      default: "active"
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.passwordHash;
        return ret;
      }
    }
  }
);

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export const User = mongoose.model("User", userSchema);
