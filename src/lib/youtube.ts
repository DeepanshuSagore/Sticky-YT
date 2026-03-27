type YouTubeMetadata = {
  title: string;
  thumbnail: string;
  channelName: string;
};

const VIDEO_ID_REGEX = /^[\w-]{11}$/;

export function extractYouTubeVideoId(input: string): string | null {
  const trimmed = input.trim();

  if (VIDEO_ID_REGEX.test(trimmed)) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    const host = url.hostname.toLowerCase();

    if (host.includes("youtu.be")) {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id && VIDEO_ID_REGEX.test(id) ? id : null;
    }

    if (host.includes("youtube.com") || host.includes("youtube-nocookie.com")) {
      const queryId = url.searchParams.get("v");
      if (queryId && VIDEO_ID_REGEX.test(queryId)) {
        return queryId;
      }

      const pathSegments = url.pathname.split("/").filter(Boolean);
      const candidate = pathSegments[1];

      if (
        (pathSegments[0] === "embed" || pathSegments[0] === "shorts") &&
        candidate &&
        VIDEO_ID_REGEX.test(candidate)
      ) {
        return candidate;
      }
    }

    return null;
  } catch {
    return null;
  }
}

export function buildYouTubeUrl(videoId: string, seconds?: number) {
  if (typeof seconds === "number" && seconds > 0) {
    return `https://www.youtube.com/watch?v=${videoId}&t=${Math.floor(seconds)}s`;
  }

  return `https://www.youtube.com/watch?v=${videoId}`;
}

export async function fetchYouTubeMetadata(videoId: string): Promise<YouTubeMetadata> {
  const url = `https://www.youtube.com/oembed?url=${encodeURIComponent(
    `https://www.youtube.com/watch?v=${videoId}`,
  )}&format=json`;

  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Unable to fetch YouTube metadata.");
  }

  const data = (await response.json()) as {
    title: string;
    author_name: string;
    thumbnail_url: string;
  };

  return {
    title: data.title,
    channelName: data.author_name,
    thumbnail: data.thumbnail_url,
  };
}
