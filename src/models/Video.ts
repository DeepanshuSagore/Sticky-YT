import { model, models, Schema, type InferSchemaType } from "mongoose";

const videoSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    channelName: {
      type: String,
      required: true,
      trim: true,
    },
    videoId: {
      type: String,
      required: true,
      trim: true,
    },
    thumbnail: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["watching", "later"],
      default: "later",
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

videoSchema.index({ userId: 1, videoId: 1 }, { unique: true });

export type VideoDocument = InferSchemaType<typeof videoSchema>;

export const VideoModel = models.Video || model("Video", videoSchema);
