import React, { useState, useEffect, useRef } from 'react';

const ProgressBar = ({ player, playerState }) => {
  const [progress, setProgress] = useState(0);
  const progressBarRef = useRef(null);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (playerState && !playerState.paused) {
        const currentPosition = playerState.position + (Date.now() - playerState.timestamp);
        const progressPercentage = (currentPosition / playerState.duration) * 100;
        setProgress(progressPercentage);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [playerState]);

  const handleSeek = (event) => {
    if (progressBarRef.current && player) {
      const progressBar = progressBarRef.current;
      const clickPosition = event.clientX - progressBar.getBoundingClientRect().left;
      const progressBarWidth = progressBar.offsetWidth;
      const seekPercentage = (clickPosition / progressBarWidth) * 100;
      const seekPosition = (seekPercentage / 100) * playerState.duration;

      player.seek(seekPosition).then(() => {
        console.log('Seeked to position:', seekPosition);
      });
    }
  };

  return (
    <div 
      className="w-full h-2 bg-gray-200 rounded-full cursor-pointer" 
      ref={progressBarRef} 
      onClick={handleSeek}
      style={{backgroundColor: 'blue'}}>
      <div 
        className="h-full bg-green-500 rounded-full" 
        style={{ width: `${progress}%`, height: 100, backgroundColor: 'green'}}
      ></div>
    </div>
  );
};

export default ProgressBar;