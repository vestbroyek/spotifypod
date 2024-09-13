import React, { useState, useEffect, useRef } from 'react';

const ProgressBar = ({ player, playerState }) => {
  const [progress, setProgress] = useState(0);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [trackDuration, setTrackDuration] = useState(undefined);
  const progressBarRef = useRef(null);

  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (playerState && !playerState.paused) {
        const currentPosition = playerState.position + (Date.now() - playerState.timestamp);
        setCurrentPosition(currentPosition);
        const progressPercentage = (currentPosition / playerState.duration) * 100;
        setProgress(progressPercentage);
      }
    }, 1000);

    if (playerState.track_window.current_track) {
      setTrackDuration(playerState.track_window.current_track.duration_ms);
    }

    return () => clearInterval(intervalId);
  }, [playerState]);

  const handleSeek = (event) => {
    if (progressBarRef.current && player) {
      const progressBar = progressBarRef.current;
      const clickPosition = event.clientX - progressBar.getBoundingClientRect().left;
      const progressBarWidth = progressBar.offsetWidth;
      const seekPercentage = (clickPosition / progressBarWidth) * 100;
      const seekPosition = (seekPercentage / 100) * playerState.duration;
      player.seek(seekPosition);
      setCurrentPosition(seekPosition);
    }
  };

    
  return (
    <div className="w-full" style={{ maxWidth: 250, margin: '0 auto' }}>
      <div 
        className="progressBar-background" 
        ref={progressBarRef} 
        onClick={handleSeek}
        style={{
          backgroundColor: '#e6eaeb', 
          borderRadius: 10, 
          width: '100%',
          position: 'relative',
          height: 20,
          overflow: 'hidden'
        }}
      >
        <div 
          className="progressBar-foreground"
          style={{ 
            borderRadius: 10,
            height: '100%', 
            width: `${Math.max(progress, 1)}%`, // Ensure progress is at least 1% to be visible
            backgroundColor: '#063059',
            position: 'absolute',
            top: 0,
            left: 0,
            transition: 'width 0.3s ease'
          }}
        />
      </div>
      <div className="flex justify-between mb-2 text-sm">
        <span style={{ float: 'left', color: '#86868b', fontSize: 20 }}>{formatTime(currentPosition)}</span>
        <span style={{ float: 'right', color: '#86868b', fontSize: 20 }}>{formatTime(trackDuration)}</span>
      </div>
    </div>
  );
};

export default ProgressBar;