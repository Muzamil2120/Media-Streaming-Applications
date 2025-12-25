import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'mediaStreaming.likedVideos.v1';

const LikesContext = createContext(null);

const safeParse = (value, fallback) => {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const normalizeVideo = (video) => {
  if (!video) return null;
  const id = video.id || video._id;
  if (!id) return null;

  return {
    id: String(id),
    title: video.title || 'Untitled',
    thumbnail: video.thumbnail || '',
    uploader: video.uploader
      ? {
          id: video.uploader.id || video.uploader._id || '',
          name: video.uploader.name || video.uploader.username || 'Unknown',
        }
      : { id: '', name: 'Unknown' },
    likedAt: video.likedAt || Date.now(),
  };
};

export const LikesProvider = ({ children }) => {
  const [likedVideos, setLikedVideos] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = safeParse(raw, []);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeVideo).filter(Boolean);
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(likedVideos));
  }, [likedVideos]);

  const isLiked = useCallback(
    (id) => {
      if (!id) return false;
      const key = String(id);
      return likedVideos.some((v) => v.id === key);
    },
    [likedVideos]
  );

  const addLike = useCallback((video) => {
    const normalized = normalizeVideo(video);
    if (!normalized) return;

    setLikedVideos((prev) => {
      const without = prev.filter((v) => v.id !== normalized.id);
      return [normalized, ...without].slice(0, 50);
    });
  }, []);

  const removeLike = useCallback((id) => {
    if (!id) return;
    const key = String(id);
    setLikedVideos((prev) => prev.filter((v) => v.id !== key));
  }, []);

  const toggleLike = useCallback(
    (video) => {
      const id = video?.id || video?._id;
      if (!id) return false;

      const currentlyLiked = isLiked(id);
      if (currentlyLiked) {
        removeLike(id);
        return false;
      }

      addLike(video);
      return true;
    },
    [addLike, isLiked, removeLike]
  );

  const value = useMemo(
    () => ({ likedVideos, isLiked, addLike, removeLike, toggleLike }),
    [likedVideos, isLiked, addLike, removeLike, toggleLike]
  );

  return <LikesContext.Provider value={value}>{children}</LikesContext.Provider>;
};

export const useLikes = () => {
  const ctx = useContext(LikesContext);
  if (!ctx) throw new Error('useLikes must be used within a LikesProvider');
  return ctx;
};
