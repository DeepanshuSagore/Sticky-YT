export type VideoCategory = "watching" | "later";

export type StickyVideo = {
  _id: string;
  userId: string;
  title: string;
  channelName: string;
  videoId: string;
  thumbnail: string;
  category: VideoCategory;
  createdAt: string;
};
