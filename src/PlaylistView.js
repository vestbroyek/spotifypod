import React, { useState, useEffect } from 'react';

const PlaylistView = ({ onBackToPlayer }) => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const response = await fetch('/playlists'); // Adjust limit as needed
        if (!response.ok) throw new Error('Failed to fetch playlists');
        const data = await response.json();
        // Sort playlists alphabetically
        const sortedPlaylists = data.items.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setPlaylists(sortedPlaylists);
      } catch (error) {
        console.error('Error fetching playlists:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlaylists();
  }, []);

  if (loading) {
    return <div>Loading playlists...</div>;
  }

  return (
    <div className="playlist-view">
      <button onClick={onBackToPlayer} className="btn-spotify">
        Back to player
      </button>
      <h2>Playlists</h2>
      <ul className="playlist-list">
        {playlists.map(playlist => (
          <li style={{ color: '#86868b' }} key={playlist.id} className="playlist-item">
            <span className="playlist-name">{playlist.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlaylistView;