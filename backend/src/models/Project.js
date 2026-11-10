import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    role: {
      type: String,
      enum: ["ADMIN", "MEMBER"],
      default: "MEMBER"
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true
    },
    description: {
      type: String,
      default: "",
      trim: true
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    status: {
      type: String,
      enum: ["ACTIVE", "ARCHIVED"],
      default: "ACTIVE"
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date
    },
    members: [memberSchema]
  },
  { timestamps: true }
);

export const Project = mongoose.model("Project", projectSchema);
