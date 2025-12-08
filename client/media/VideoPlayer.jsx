import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import {
  Box,
  IconButton,
  Slider,
  Typography,
  Tooltip,
  Button,
  Stack,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  VolumeUp,
  VolumeOff,
  Fullscreen,
  Settings,
  ClosedCaption,
  Replay,
  SkipNext,
  SkipPrevious,
} from '@mui/icons-material';
import { formatDuration } from '../../utils/formatters';

const VideoPlayer = ({ url, title }) => {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [showControls, setShowControls] = useState(true);
  
  const playerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  const handlePlayPause = () => {
    setPlaying(!playing);
  };

  const handleVolumeChange = (event, newValue) => {
    setVolume(newValue / 100);
    setMuted(newValue === 0);
  };

  const handleSeekMouseDown = () => {
    setSeeking(true);
  };

  const handleSeekChange = (event, newValue) => {
    setPlayed(newValue / 100);
  };

  const handleSeekMouseUp = (event, newValue) => {
    setSeeking(false);
    playerRef.current.seekTo(newValue / 100);
  };

  const handleProgress = (state) => {
    if (!seeking) {
      setPlayed(state.played);
    }
  };

  const handleDuration = (duration) => {
    setDuration(duration);
  };

  const toggleMuted = () => {
    setMuted(!muted);
  };

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (playing) {
        setShowControls(false);
      }
    }, 3000);
  };

  const handleFullscreen = () => {
    const playerContainer = playerRef.current?.wrapper;
    if (playerContainer?.requestFullscreen) {
      playerContainer.requestFullscreen();
    }
  };

  useEffect(() => {
    return () => {
      clearTimeout(controlsTimeoutRef.current);
    };
  }, []);

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        bgcolor: '#000',
        borderRadius: 2,
        overflow: 'hidden',
        '&:hover .video-controls': {
          opacity: 1,
        },
      }}
      onMouseMove={handleMouseMove}
    >
      {/* Video Player */}
      <ReactPlayer
        ref={playerRef}
        url={url}
        playing={playing}
        volume={volume}
        muted={muted}
        playbackRate={playbackRate}
        width="100%"
        height="100%"
        onProgress={handleProgress}
        onDuration={handleDuration}
        config={{
          youtube: {
            playerVars: {
              controls: 0,
              modestbranding: 1,
              rel: 0,
            },
          },
        }}
      />

      {/* Controls Overlay */}
      <Box
        className="video-controls"
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: 'rgba(0,0,0,0.7)',
          p: 2,
          opacity: showControls ? 1 : 0,
          transition: 'opacity 0.3s',
        }}
      >
        {/* Progress Bar */}
        <Slider
          value={played * 100}
          onChange={handleSeekChange}
          onMouseDown={handleSeekMouseDown}
          onChangeCommitted={handleSeekMouseUp}
          sx={{
            color: 'primary.main',
            height: 4,
            '& .MuiSlider-thumb': {
              width: 12,
              height: 12,
              transition: '0.3s cubic-bezier(.47,1.64,.41,.8)',
              '&:hover, &.Mui-active': {
                width: 20,
                height: 20,
              },
            },
          }}
        />

        {/* Control Buttons */}
        <Stack direction="row" alignItems="center" spacing={1}>
          {/* Play/Pause */}
          <IconButton onClick={handlePlayPause} sx={{ color: 'white' }}>
            {playing ? <Pause /> : <PlayArrow />}
          </IconButton>

          {/* Skip Buttons */}
          <IconButton sx={{ color: 'white' }}>
            <SkipPrevious />
          </IconButton>
          <IconButton sx={{ color: 'white' }}>
            <Replay />
          </IconButton>
          <IconButton sx={{ color: 'white' }}>
            <SkipNext />
          </IconButton>

          {/* Volume */}
          <Box sx={{ display: 'flex', alignItems: 'center', width: 120 }}>
            <IconButton onClick={toggleMuted} sx={{ color: 'white' }}>
              {muted || volume === 0 ? <VolumeOff /> : <VolumeUp />}
            </IconButton>
            <Slider
              value={volume * 100}
              onChange={handleVolumeChange}
              sx={{
                color: 'white',
                ml: 1,
                '& .MuiSlider-track': {
                  border: 'none',
                },
              }}
            />
          </Box>

          {/* Time Display */}
          <Typography variant="body2" sx={{ color: 'white', ml: 2 }}>
            {formatDuration(played * duration)} / {formatDuration(duration)}
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          {/* Additional Controls */}
          <IconButton sx={{ color: 'white' }}>
            <ClosedCaption />
          </IconButton>
          <IconButton sx={{ color: 'white' }}>
            <Settings />
          </IconButton>
          <IconButton onClick={handleFullscreen} sx={{ color: 'white' }}>
            <Fullscreen />
          </IconButton>
        </Stack>
      </Box>

      {/* Video Title Overlay */}
      {title && showControls && (
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            right: 16,
            bgcolor: 'rgba(0,0,0,0.7)',
            p: 1.5,
            borderRadius: 1,
          }}
        >
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 500 }}>
            {title}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default VideoPlayer;