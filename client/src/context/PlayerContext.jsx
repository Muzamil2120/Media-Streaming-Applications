import React, { createContext, useState, useContext } from 'react';

const PlayerContext = createContext({});

export const usePlayer = () => useContext(PlayerContext);

export const PlayerProvider = ({ children }) => {
  const [currentVideo, setCurrentVideo] = useState(null);
  const [queue, setQueue] = useState([]);
  const [volume, setVolume] = useState(80);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [autoplay, setAutoplay] = useState(true);

  const playVideo = (video) => {
    setCurrentVideo(video);
  };

  const addToQueue = (video) => {
    setQueue([...queue, video]);
  };

  const clearQueue = () => {
    setQueue([]);
  };

  const nextVideo = () => {
    if (queue.length > 0) {
      const [next, ...remaining] = queue;
      setCurrentVideo(next);
      setQueue(remaining);
    }
  };

  const value = {
    currentVideo,
    queue,
    volume,
    playbackRate,
    autoplay,
    playVideo,
    addToQueue,
    clearQueue,
    nextVideo,
    setVolume,
    setPlaybackRate,
    setAutoplay,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};