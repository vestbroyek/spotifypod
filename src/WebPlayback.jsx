import React, { useState, useEffect } from 'react';
import ProgressBar from './ProgressBar'
import PlaylistView from './PlaylistView'

const track = {
    name: "",
    album: {
        name: "",
        images: [
            { url: "" }
        ]
    },
    artists: [
        { name: "" }
    ]
}

function WebPlayback(props) {

    const [is_paused, setPaused] = useState(false);
    const [is_active, setActive] = useState(false);
    const [player, setPlayer] = useState(undefined);
    const [current_track, setTrack] = useState(track);
    const [playerState, setPlayerState] = useState(undefined);
    const [token, setToken] = useState('');
    const [showPlaylists, setShowPlaylists] = useState(false);

    useEffect(() => {
        const getToken = async () => {
            const response = await fetch('/auth/token');
            const json = await response.json();
            setToken(json.access_token);
          };

        getToken();

        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;

        document.body.appendChild(script);

        window.onSpotifyWebPlaybackSDKReady = () => {
            const player = new window.Spotify.Player({
              name: 'SpotifyPod',
              getOAuthToken: async cb => {
                const response = await fetch('/auth/token');
                const json = await response.json();
                cb(json.access_token);
              },
              volume: 0.5
            });

            setPlayer(player);

            player.addListener('ready', ({ device_id }) => {
                console.log('Ready with Device ID', device_id);
                console.log('Attempting to transfer playback...')
                transferPlayback(device_id);
            });

            player.addListener('not_ready', ({ device_id }) => {
                console.log('Device ID has gone offline', device_id);
            });

            player.addListener('player_state_changed', ( state => {

                if (!state) {
                    return;
                }

                setTrack(state.track_window.current_track);
                setPaused(state.paused);
                setPlayerState(state);

                player.getCurrentState().then( state => { 
                    (!state)? setActive(false) : setActive(true) 
                });

            }));

            player.connect();

        };
    }, []);

    const toggleView = () => {
        setShowPlaylists(!showPlaylists);
    };

    const transferPlayback = async (device_id) => {
        try {
          const response = await fetch('https://api.spotify.com/v1/me/player', {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${props.token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              device_ids: [device_id],
              play: true,
            }),
          });
    
          if (response.status === 204) {
            console.log('Playback transferred successfully');
          } else {
            console.error('Failed to transfer playback:', response.status);
          }
        } catch (error) {
          console.error('Error transferring playback:', error);
        }
      };

    if (!is_active) { 
        return (
            <>
                <div className="container">
                    <div className="main-wrapper">
                        <div className="spinner"></div>
                            <b> Loading... </b>
                    </div>
                </div>
            </>)
    } 

    if (showPlaylists) {
        return <PlaylistView onBackToPlayer={toggleView} />;
    }

    return (
        <>
            <div className="container">
                <div className="main-wrapper">

                    <img src={current_track.album.images[0].url} className="now-playing__cover" alt="" />

                    <div className="now-playing__side">
                        <div className="now-playing__name">{current_track.name}</div>
                        <div className="now-playing__artist">{current_track.artists[0].name}</div>
                        <div className="now-playing__album">{current_track.album.name}</div>

                        <div className="controls">
                            <button className="btn-spotify" onClick={() => { player.previousTrack() }}>
                                &lt;&lt;
                            </button>

                            <button className="btn-spotify" onClick={() => { player.togglePlay() }}>
                                { is_paused ? ">" : "||" }
                            </button>

                            <button className="btn-spotify" onClick={() => { player.nextTrack() }}>
                                &gt;&gt;
                            </button>
                        </div>

                        <ProgressBar player={player} playerState={playerState} />

                        <button className="btn-spotify" onClick={toggleView}>
                            View Playlists
                        </button>

                    </div>
                </div>
            </div>
        </>
    );
}

export default WebPlayback
