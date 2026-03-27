"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AddVideoForm } from "@/components/add-video-form";
import { useAuth } from "@/components/auth-provider";
import type { StickyVideo } from "@/types/video";

type DashboardClientProps = {
  email: string | null;
};

export function DashboardClient({ email }: DashboardClientProps) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [token, setToken] = useState("");
  const [videos, setVideos] = useState<StickyVideo[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  const withAuthRequest = useCallback(
    async <T,>(input: RequestInfo, init?: RequestInit): Promise<T> => {
      if (!user) {
        throw new Error("Not authenticated.");
      }

      const idToken = token || (await user.getIdToken());
      if (!token) {
        setToken(idToken);
      }

      const response = await fetch(input, {
        ...init,
        headers: {
          ...(init?.headers ?? {}),
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
      });

      const payload = (await response.json()) as T & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Request failed.");
      }

      return payload;
    },
    [token, user],
  );

  const loadVideos = useCallback(async () => {
    if (!user) {
      return;
    }

    setFetching(true);
    setError("");
    try {
      const payload = await withAuthRequest<{ videos: StickyVideo[] }>("/api/videos", {
        method: "GET",
      });
      setVideos(payload.videos);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : "Unable to load videos.";
      setError(message);
    } finally {
      setFetching(false);
    }
  }, [user, withAuthRequest]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
      return;
    }

    if (user) {
      void loadVideos();
    }
  }, [loadVideos, loading, router, user]);

  const groupedVideos = useMemo(() => {
    const watching = videos.filter((video) => video.category === "watching");
    const later = videos.filter((video) => video.category === "later");
    return { watching, later };
  }, [videos]);

  const handleCreate = (video: StickyVideo) => {
    setVideos((prev) => [video, ...prev]);
  };

  const handleDelete = async (videoId: string) => {
    await withAuthRequest<{ success: boolean }>("/api/videos", {
      method: "DELETE",
      body: JSON.stringify({ id: videoId }),
    });

    setVideos((prev) => prev.filter((video) => video._id !== videoId));
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-7 px-6 py-8 sm:py-10">
      <header className="glass-card flex flex-col gap-4 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs tracking-[0.2em] text-zinc-400 uppercase">Dashboard</p>
          <h1 className="mt-1 text-2xl font-semibold text-zinc-100">Add or remove videos</h1>
          <p className="mt-1 text-sm text-zinc-400">{email ?? user?.email ?? "Logged in"}</p>
        </div>
      </header>

      {token ? <AddVideoForm onCreated={handleCreate} token={token} /> : null}

      {error ? (
        <div className="rounded-xl border border-red-500/45 bg-red-500/12 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      {fetching ? (
        <div className="grid gap-5 md:grid-cols-2">
          <div className="glass-card h-48 animate-pulse rounded-2xl" />
          <div className="glass-card h-48 animate-pulse rounded-2xl" />
        </div>
      ) : (
        <section className="space-y-8">
          <div>
            <h2 className="mb-3 text-lg font-semibold text-zinc-100">Currently Watching</h2>
            {groupedVideos.watching.length === 0 ? (
              <p className="rounded-xl border border-zinc-800 bg-black/35 p-4 text-sm text-zinc-400">
                No videos in currently watching.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {groupedVideos.watching.map((video) => (
                  <article key={video._id} className="glass-card rounded-2xl p-3">
                    <div className="relative h-36 overflow-hidden rounded-xl">
                      <Image
                        src={video.thumbnail}
                        alt={video.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                    <h3 className="mt-3 line-clamp-2 text-sm font-semibold text-zinc-100">
                      {video.title}
                    </h3>
                    <p className="mt-1 text-xs text-zinc-400">{video.channelName}</p>
                    <button
                      type="button"
                      onClick={() => handleDelete(video._id)}
                      className="mt-3 h-9 w-full rounded-lg border border-red-500/50 bg-red-500/12 text-xs font-semibold text-red-200 transition hover:bg-red-500/18"
                    >
                      Delete
                    </button>
                  </article>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="mb-3 text-lg font-semibold text-zinc-100">Watch Later</h2>
            {groupedVideos.later.length === 0 ? (
              <p className="rounded-xl border border-zinc-800 bg-black/35 p-4 text-sm text-zinc-400">
                No videos in watch later.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {groupedVideos.later.map((video) => (
                  <article key={video._id} className="glass-card rounded-2xl p-3">
                    <div className="relative h-36 overflow-hidden rounded-xl">
                      <Image
                        src={video.thumbnail}
                        alt={video.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                    <h3 className="mt-3 line-clamp-2 text-sm font-semibold text-zinc-100">
                      {video.title}
                    </h3>
                    <p className="mt-1 text-xs text-zinc-400">{video.channelName}</p>
                    <button
                      type="button"
                      onClick={() => handleDelete(video._id)}
                      className="mt-3 h-9 w-full rounded-lg border border-red-500/50 bg-red-500/12 text-xs font-semibold text-red-200 transition hover:bg-red-500/18"
                    >
                      Delete
                    </button>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
