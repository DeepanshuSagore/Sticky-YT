"use client";

import { useState } from "react";
import type { StickyVideo, VideoCategory } from "@/types/video";

type AddVideoFormProps = {
  onCreated: (video: StickyVideo) => void;
  token: string;
};

export function AddVideoForm({ onCreated, token }: AddVideoFormProps) {
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState<VideoCategory>("watching");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/videos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          url,
          category,
        }),
      });

      const payload = (await response.json()) as {
        video?: StickyVideo;
        error?: string;
      };

      if (!response.ok || !payload.video) {
        throw new Error(payload.error ?? "Unable to add video.");
      }

      onCreated(payload.video);
      setUrl("");
      setCategory("watching");
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : "Unable to add video.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-card flex flex-col gap-4 rounded-2xl border border-red-500/25 p-4 sm:flex-row sm:items-end"
    >
      <label className="flex-1 space-y-2">
        <span className="text-xs tracking-widest text-zinc-300 uppercase">YouTube URL</span>
        <input
          type="url"
          required
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          className="w-full rounded-xl border border-red-500/30 bg-black/40 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-red-400"
        />
      </label>

      <label className="space-y-2">
        <span className="text-xs tracking-widest text-zinc-300 uppercase">Category</span>
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value as VideoCategory)}
          className="h-11 rounded-xl border border-red-500/30 bg-black/40 px-3 text-sm text-zinc-200 outline-none focus:border-red-400"
        >
          <option value="watching">Currently Watching</option>
          <option value="later">Watch Later</option>
        </select>
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="red-glow h-11 rounded-xl bg-red-500 px-5 text-sm font-semibold text-white transition hover:bg-red-400 disabled:opacity-65"
      >
        {submitting ? "Adding..." : "Add Video"}
      </button>

      {error ? <p className="text-xs text-red-300 sm:basis-full">{error}</p> : null}
    </form>
  );
}
