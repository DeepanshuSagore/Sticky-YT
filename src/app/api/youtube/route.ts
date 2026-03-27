import { NextRequest, NextResponse } from "next/server";
import { fetchYouTubeMetadata, extractYouTubeVideoId } from "@/lib/youtube";
import { UnauthorizedError, verifyRequestToken } from "@/lib/server-auth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await verifyRequestToken(request);

    const url = request.nextUrl.searchParams.get("url");
    if (!url) {
      return NextResponse.json({ error: "Missing YouTube URL." }, { status: 400 });
    }

    const videoId = extractYouTubeVideoId(url);
    if (!videoId) {
      return NextResponse.json({ error: "Invalid YouTube URL." }, { status: 400 });
    }

    const metadata = await fetchYouTubeMetadata(videoId);
    return NextResponse.json({
      videoId,
      ...metadata,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ error: "Unable to load YouTube metadata." }, { status: 500 });
  }
}
