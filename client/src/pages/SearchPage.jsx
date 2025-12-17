import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import VideoCard from '../components/VideoCard';
import { mediaAPI, dailymotionAPI } from '../services/api';
import { formatDuration } from '../utils/formatters';

const SearchPage = () => {
  const location = useLocation();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get query from URL
  const params = new URLSearchParams(location.search);
  const query = params.get('q') || '';

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    setLoading(true);
    setError('');
    
    Promise.all([
      mediaAPI.searchMedia(query).catch(() => ({ media: [] })),
      dailymotionAPI.search(query).catch(() => [])
    ]).then(([localRes, dmRes]) => {
      const localVideos = (localRes.media || []).map(v => ({
        ...v,
        thumbnail: v.thumbnail || v.thumbnailUrl // Ensure thumbnail property exists
      }));

      const dmVideos = dmRes.map(video => ({
        _id: video.id,
        title: video.title,
        description: video.description,
        thumbnail: video.thumbnail_url,
        thumbnailUrl: video.thumbnail_url,
        views: video.views_total,
        duration: formatDuration(video.duration),
        uploader: {
          _id: 'dailymotion',
          username: video['channel.name'] || 'Dailymotion',
          avatar: null
        },
        created: new Date(),
        isDailymotion: true,
        filePath: video.url
      }));
      
      setResults([...localVideos, ...dmVideos]);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setError('Search failed');
      setLoading(false);
    });
  }, [query]);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <h3>Search Results for "{query}"</h3>
        {loading && <div style={{ color: '#666' }}>Loading...</div>}
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {!loading && !error && (
          <div style={{ color: '#666' }}>About {results.length} results</div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{ flex: 3 }}>
          {results.length > 0 ? (
            results.map((video) => (
              <div key={video._id} style={{ marginBottom: 12 }}>
                <VideoCard media={video} />
              </div>
            ))
          ) : (
            !loading && !error && (
              <div style={{ textAlign: 'center', padding: 48, color: '#666' }}>
                <h4>No results found</h4>
                <div>Try different keywords or filters</div>
              </div>
            )
          )}
        </div>

        <aside style={{ flex: 1 }}>
          <div style={{ padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
            <strong>Filters</strong>
            <div style={{ marginTop: 8 }}>
              <div>Upload date</div>
              <div>Duration</div>
              <div>Sort by</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default SearchPage;