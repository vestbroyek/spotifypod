import React, { useState, useEffect } from 'react';

const track = {
    name: "",
    album: {
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
    const [token, setToken] = useState('');

    useEffect(() => {

        const getToken = async () => {
            const response = await fetch('/auth/token');
            const json = await response.json();
            setToken(json.access_token);
          };

        console.log("Fetching a fresh token...");
        getToken();

        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;

        document.body.appendChild(script);

        window.onSpotifyWebPlaybackSDKReady = () => {
            const player = new window.Spotify.Player({
              name: 'Web Playback SDK',
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

                player.getCurrentState().then( state => { 
                    (!state)? setActive(false) : setActive(true) 
                });

            }));

            player.connect();

        };
    }, []);

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
                        <b> Instance not active. Transfer your playback using your Spotify app </b>
                    </div>
                </div>
            </>)
    } else {
        return (
            <>
                <div className="container">
                    <div className="main-wrapper">

                        <img src={current_track.album.images[0].url} className="now-playing__cover" alt="" />

                        <div className="now-playing__side">
                            <div className="now-playing__name">{current_track.name}</div>
                            <div className="now-playing__artist">{current_track.artists[0].name}</div>

                            <button className="btn-spotify" onClick={() => { player.previousTrack() }} >
                                &lt;&lt;
                            </button>

                            <button className="btn-spotify" onClick={() => { player.togglePlay() }} >
                                { is_paused ? "PLAY" : "PAUSE" }
                            </button>

                            <button className="btn-spotify" onClick={() => { player.nextTrack() }} >
                                &gt;&gt;
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}

export default WebPlayback
