import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { extractYouTubeVideoId, fetchYouTubeMetadata } from "@/lib/youtube";
import { UnauthorizedError, verifyRequestToken } from "@/lib/server-auth";
import { UserModel } from "@/models/User";
import { VideoModel } from "@/models/Video";
import type { VideoCategory } from "@/types/video";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_CATEGORIES: VideoCategory[] = ["watching", "later"];

async function ensureUser(firebaseUid: string, email: string) {
  await UserModel.findOneAndUpdate(
    { firebaseUid },
    {
      $set: {
        email,
      },
      $setOnInsert: {
        createdAt: new Date(),
      },
    },
    { upsert: true, new: true },
  );
}

function parseCategory(value: unknown): VideoCategory {
  if (typeof value === "string" && VALID_CATEGORIES.includes(value as VideoCategory)) {
    return value as VideoCategory;
  }
  return "later";
}

export async function GET(request: NextRequest) {
  try {
    const decodedToken = await verifyRequestToken(request);
    await connectToDatabase();

    await ensureUser(decodedToken.uid, decodedToken.email ?? "unknown@email.com");
    const videos = await VideoModel.find({ userId: decodedToken.uid }).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ videos });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Unable to fetch videos." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const decodedToken = await verifyRequestToken(request);
    const body = (await request.json()) as {
      url?: string;
      category?: VideoCategory;
    };

    if (!body.url) {
      return NextResponse.json({ error: "YouTube URL is required." }, { status: 400 });
    }

    const videoId = extractYouTubeVideoId(body.url);
    if (!videoId) {
      return NextResponse.json({ error: "Invalid YouTube URL." }, { status: 400 });
    }

    await connectToDatabase();
    await ensureUser(decodedToken.uid, decodedToken.email ?? "unknown@email.com");

    const metadata = await fetchYouTubeMetadata(videoId);

    const video = await VideoModel.findOneAndUpdate(
      {
        userId: decodedToken.uid,
        videoId,
      },
      {
        userId: decodedToken.uid,
        videoId,
        title: metadata.title,
        thumbnail: metadata.thumbnail,
        channelName: metadata.channelName,
        category: parseCategory(body.category),
      },
      {
        upsert: true,
        new: true,
      },
    );

    return NextResponse.json({ video }, { status: 201 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json({ error: "Invalid video payload." }, { status: 400 });
    }

    return NextResponse.json({ error: "Unable to save video." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const decodedToken = await verifyRequestToken(request);
    const body = (await request.json()) as {
      id?: string;
      category?: VideoCategory;
    };

    if (!body.id) {
      return NextResponse.json({ error: "Video id is required." }, { status: 400 });
    }

    if (!body.category || !VALID_CATEGORIES.includes(body.category)) {
      return NextResponse.json({ error: "Valid category is required." }, { status: 400 });
    }

    await connectToDatabase();

    const video = await VideoModel.findOneAndUpdate(
      { _id: body.id, userId: decodedToken.uid },
      { $set: { category: body.category } },
      { new: true },
    ).lean();

    if (!video) {
      return NextResponse.json({ error: "Video not found." }, { status: 404 });
    }

    return NextResponse.json({ video });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error instanceof mongoose.Error.CastError) {
      return NextResponse.json({ error: "Invalid video id." }, { status: 400 });
    }

    return NextResponse.json({ error: "Unable to update video." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const decodedToken = await verifyRequestToken(request);
    const body = (await request.json()) as { id?: string };

    if (!body.id) {
      return NextResponse.json({ error: "Video id is required." }, { status: 400 });
    }

    await connectToDatabase();

    const deleted = await VideoModel.findOneAndDelete({
      _id: body.id,
      userId: decodedToken.uid,
    });

    if (!deleted) {
      return NextResponse.json({ error: "Video not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error instanceof mongoose.Error.CastError) {
      return NextResponse.json({ error: "Invalid video id." }, { status: 400 });
    }

    return NextResponse.json({ error: "Unable to delete video." }, { status: 500 });
  }
}
