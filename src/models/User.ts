import { model, models, Schema, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  },
);

export type UserDocument = InferSchemaType<typeof userSchema>;

export const UserModel = models.User || model("User", userSchema);
