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
  Menu,
  MenuItem,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  VolumeUp,
  VolumeOff,
  Fullscreen,
  FullscreenExit,
  Settings,
  ClosedCaption,
  Replay,
  SkipNext,
  SkipPrevious,
  Speed,
  PictureInPicture,
  ThumbUp,
  ThumbDown,
  Share,
  PlaylistAdd,
  MoreVert,
} from '@mui/icons-material';

const VideoPlayer = ({ url, title, videoId, autoPlay = false }) => {
  // Default paused (YouTube-like). Autoplay is supported but handled safely.
  const [playing, setPlaying] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [formatError, setFormatError] = useState('');
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [showControls, setShowControls] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [settingsAnchor, setSettingsAnchor] = useState(null);
  const [speedAnchor, setSpeedAnchor] = useState(null);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [speedOptions] = useState([0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]);
  
  const playerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const containerRef = useRef(null);
  const isMountedRef = useRef(true);

  const getFileExtension = (inputUrl) => {
    if (!inputUrl || typeof inputUrl !== 'string') return '';
    const cleaned = inputUrl.split('?')[0].split('#')[0];
    const lastDot = cleaned.lastIndexOf('.');
    if (lastDot === -1) return '';
    return cleaned.slice(lastDot + 1).toLowerCase();
  };

  const isBrowserPlayableExtension = (ext) => {
    // Keep this conservative: formats widely supported in modern browsers.
    return ['mp4', 'm4v', 'webm', 'mov', 'ogv', 'ogg'].includes(ext);
  };

  // Reset state when switching videos
  useEffect(() => {
    setLoadError('');
    setFormatError('');
    setPlayed(0);
    setDuration(0);
    setSeeking(false);
    setPlaying(false);

    const ext = getFileExtension(url);
    if (ext && !isBrowserPlayableExtension(ext)) {
      setFormatError(`This video format (.${ext}) isn't supported by most browsers. Upload MP4 or WebM for reliable playback.`);
      setPlaying(false);
    }
  }, [url, autoPlay]);

  // Safe autoplay: delay slightly and start muted to satisfy browser policies.
  // This avoids the common browser warning: "The play() request was interrupted by a call to pause()".
  useEffect(() => {
    if (!autoPlay) return;
    if (loadError || formatError) return;

    const timer = setTimeout(() => {
      setMuted(true);
      setPlaying(true);
    }, 200);

    return () => clearTimeout(timer);
  }, [autoPlay, url, loadError, formatError]);

  // Format time display
  const formatTime = (seconds) => {
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds();
    
    if (hh) {
      return `${hh}:${mm.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`;
    }
    return `${mm}:${ss.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (!isMountedRef.current) return;
    setPlaying((prev) => !prev);
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
    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      playerRef.current.seekTo(newValue / 100);
    }
  };

  const handleProgress = (state) => {
    if (!seeking) {
      setPlayed(state.played);
    }

    // Some player backends don't emit a clean duration event; derive it safely.
    if (!duration && playerRef.current && typeof playerRef.current.getDuration === 'function') {
      const d = playerRef.current.getDuration();
      if (typeof d === 'number' && Number.isFinite(d) && d > 0) {
        setDuration(d);
      }
    }
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

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setFullscreen(false);
    }
  };

  const handleSpeedChange = (speed) => {
    setPlaybackRate(speed);
    setSpeedAnchor(null);
  };

  const handleLike = () => {
    setLiked(!liked);
    if (disliked) setDisliked(false);
  };

  const handleDislike = () => {
    setDisliked(!disliked);
    if (liked) setLiked(false);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    // Show success toast
  };

  const handlePictureInPicture = () => {
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture();
    } else if (document.pictureInPictureEnabled) {
      playerRef.current.getInternalPlayer()?.requestPictureInPicture?.();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      clearTimeout(controlsTimeoutRef.current);
      isMountedRef.current = false;
      setPlaying(false); // Stop playback on unmount to prevent play() race
    };
  }, []);

  const showNativeFallback = !!loadError;
  const showFormatError = !!formatError;

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16 / 9',
        bgcolor: '#000',
        borderRadius: 2,
        overflow: 'hidden',
        '&:hover .video-controls': {
          opacity: 1,
        },
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        if (playing) {
          controlsTimeoutRef.current = setTimeout(() => {
            setShowControls(false);
          }, 1000);
        }
      }}
    >
      {/* Video Player */}
      <ReactPlayer
        ref={playerRef}
        url={url}
        playing={playing && !showNativeFallback && !showFormatError}
        volume={volume}
        muted={muted}
        playbackRate={playbackRate}
        width="100%"
        height="100%"
        stopOnUnmount
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onReady={() => {
          if (playerRef.current && typeof playerRef.current.getDuration === 'function') {
            const d = playerRef.current.getDuration();
            if (typeof d === 'number' && Number.isFinite(d) && d > 0) {
              setDuration(d);
            }
          }
        }}
        onError={(e) => {
          const msg = (e && e.message) ? e.message : 'Failed to load video';
          setLoadError(msg);
          setPlaying(false);
        }}
        onProgress={handleProgress}
        onEnded={() => setPlaying(false)}
        config={{
          youtube: {
            playerVars: {
              controls: 0,
              modestbranding: 1,
              rel: 0,
            },
          },
          file: {
            attributes: {
              playsInline: true,
              preload: 'metadata',
              crossOrigin: 'anonymous',
            }
          }
        }}
      />

      {/* Unsupported format (e.g., mkv) */}
      {showFormatError && (
        <Box sx={{ position: 'absolute', inset: 0, p: 2, bgcolor: '#000', display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="body2" sx={{ color: '#fff' }}>
            {title || 'Video'} can\'t be played.
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)' }}>
            {formatError}
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            variant="outlined"
            sx={{ alignSelf: 'flex-start', borderColor: 'rgba(255,255,255,0.35)', color: '#fff' }}
            onClick={() => {
              try {
                window.open(url, '_blank', 'noopener,noreferrer');
              } catch (err) {
                // no-op
              }
            }}
          >
            Download / open video
          </Button>
        </Box>
      )}

      {/* Fallback when ReactPlayer can't load local file */}
      {showNativeFallback && (
        <Box sx={{ position: 'absolute', inset: 0, p: 2, bgcolor: '#000' }}>
          <Typography variant="body2" sx={{ color: '#fff', mb: 1 }}>
            {title || 'Video'} could not be loaded in the custom player.
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: 'block', mb: 2 }}>
            {loadError}
          </Typography>
          <video
            src={url}
            controls
            style={{ width: '100%', height: '100%', maxHeight: '100%', background: '#000', borderRadius: 12 }}
          />
        </Box>
      )}

      {/* Controls Overlay */}
      {!showNativeFallback && !showFormatError && (
      <Box
        className="video-controls"
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: 'rgba(0,0,0,0.8)',
          p: 2,
          opacity: showControls ? 1 : 0,
          transition: 'opacity 0.3s',
        }}
      >
        {/* Progress Bar */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="caption" sx={{ color: 'white', minWidth: 50 }}>
            {formatTime(played * duration)}
          </Typography>
          <Slider
            value={played * 100}
            onChange={handleSeekChange}
            onMouseDown={handleSeekMouseDown}
            onChangeCommitted={handleSeekMouseUp}
            sx={{
              flexGrow: 1,
              mx: 2,
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
          <Typography variant="caption" sx={{ color: 'white', minWidth: 50 }}>
            {formatTime(duration)}
          </Typography>
        </Box>

        {/* Control Buttons */}
        <Stack direction="row" alignItems="center" spacing={1}>
          {/* Play/Pause */}
          <Tooltip title={playing ? 'Pause (k)' : 'Play (k)'}>
            <IconButton onClick={handlePlayPause} sx={{ color: 'white' }}>
              {playing ? <Pause /> : <PlayArrow />}
            </IconButton>
          </Tooltip>

          {/* Skip */}
          <Tooltip title="Previous (←)">
            <IconButton sx={{ color: 'white' }}>
              <SkipPrevious />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Replay 10s (j)">
            <IconButton sx={{ color: 'white' }}>
              <Replay />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Next 10s (l)">
            <IconButton sx={{ color: 'white' }}>
              <SkipNext />
            </IconButton>
          </Tooltip>

          {/* Volume */}
          <Box sx={{ display: 'flex', alignItems: 'center', width: 120 }}>
            <Tooltip title={muted ? 'Unmute (m)' : 'Mute (m)'}>
              <IconButton onClick={toggleMuted} sx={{ color: 'white' }}>
                {muted || volume === 0 ? <VolumeOff /> : <VolumeUp />}
              </IconButton>
            </Tooltip>
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

          {/* Playback Speed */}
          <Tooltip title="Playback speed">
            <Button
              onClick={(e) => setSpeedAnchor(e.currentTarget)}
              sx={{ color: 'white', textTransform: 'none' }}
              startIcon={<Speed />}
            >
              {playbackRate}x
            </Button>
          </Tooltip>
          <Menu
            anchorEl={speedAnchor}
            open={Boolean(speedAnchor)}
            onClose={() => setSpeedAnchor(null)}
          >
            {speedOptions.map((speed) => (
              <MenuItem
                key={speed}
                onClick={() => handleSpeedChange(speed)}
                selected={playbackRate === speed}
              >
                {speed}x
              </MenuItem>
            ))}
          </Menu>

          {/* Captions */}
          <Tooltip title="Subtitles/CC (c)">
            <IconButton sx={{ color: 'white' }}>
              <ClosedCaption />
            </IconButton>
          </Tooltip>

          {/* Settings */}
          <Tooltip title="Settings">
            <IconButton
              onClick={(e) => setSettingsAnchor(e.currentTarget)}
              sx={{ color: 'white' }}
            >
              <Settings />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={settingsAnchor}
            open={Boolean(settingsAnchor)}
            onClose={() => setSettingsAnchor(null)}
          >
            <MenuItem>Quality</MenuItem>
            <MenuItem>Subtitles</MenuItem>
            <MenuItem onClick={handlePictureInPicture}>
              <PictureInPicture sx={{ mr: 1 }} />
              Picture in picture
            </MenuItem>
          </Menu>

          <Box sx={{ flexGrow: 1 }} />

          {/* Picture in Picture */}
          <Tooltip title="Picture in picture">
            <IconButton onClick={handlePictureInPicture} sx={{ color: 'white' }}>
              <PictureInPicture />
            </IconButton>
          </Tooltip>

          {/* Fullscreen */}
          <Tooltip title={fullscreen ? 'Exit fullscreen (f)' : 'Fullscreen (f)'}>
            <IconButton onClick={toggleFullscreen} sx={{ color: 'white' }}>
              {fullscreen ? <FullscreenExit /> : <Fullscreen />}
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
      )}

      {/* Top Bar Controls */}
      {showControls && !showNativeFallback && !showFormatError && (
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            right: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {/* Video Title */}
          <Box
            sx={{
              bgcolor: 'rgba(0,0,0,0.7)',
              p: 1.5,
              borderRadius: 1,
              maxWidth: '60%',
            }}
          >
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 500 }}>
              {title}
            </Typography>
          </Box>

          {/* Action Buttons */}
          <Stack direction="row" spacing={1}>
            <Tooltip title={liked ? 'Unlike' : 'Like'}>
              <IconButton
                onClick={handleLike}
                sx={{
                  color: liked ? 'primary.main' : 'white',
                  bgcolor: 'rgba(0,0,0,0.7)',
                }}
              >
                <ThumbUp />
              </IconButton>
            </Tooltip>
            
            <Tooltip title={disliked ? 'Remove dislike' : 'Dislike'}>
              <IconButton
                onClick={handleDislike}
                sx={{
                  color: disliked ? 'primary.main' : 'white',
                  bgcolor: 'rgba(0,0,0,0.7)',
                }}
              >
                <ThumbDown />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Share">
              <IconButton
                onClick={handleShare}
                sx={{
                  color: 'white',
                  bgcolor: 'rgba(0,0,0,0.7)',
                }}
              >
                <Share />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Save">
              <IconButton
                sx={{
                  color: 'white',
                  bgcolor: 'rgba(0,0,0,0.7)',
                }}
              >
                <PlaylistAdd />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="More">
              <IconButton
                sx={{
                  color: 'white',
                  bgcolor: 'rgba(0,0,0,0.7)',
                }}
              >
                <MoreVert />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      )}

      {/* Play/Pause Overlay */}
      {!playing && !showNativeFallback && !showFormatError && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          onClick={handlePlayPause}
        >
          <IconButton
            sx={{
              bgcolor: 'rgba(0,0,0,0.7)',
              color: 'white',
              width: 80,
              height: 80,
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.9)',
                transform: 'scale(1.1)',
              },
              transition: 'all 0.3s',
            }}
          >
            <PlayArrow sx={{ fontSize: 40 }} />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};

export default VideoPlayer;