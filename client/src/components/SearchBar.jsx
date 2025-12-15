import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Typography,
  IconButton,
  Chip,
  Divider,
  Button,
  Popover,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Search,
  History,
  TrendingUp,
  Close,
  FilterList,
  Sort,
  Whatshot,
  AccessTime,
  ThumbUp,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searchHistory, setSearchHistory] = useState([
    'React hooks tutorial',
    'Node.js backend',
    'MongoDB Atlas',
    'Material UI components',
  ]);
  const [trendingSearches] = useState([
    'AI tutorials 2024',
    'Web3 development',
    'React 18 features',
    'TypeScript advanced',
  ]);
  const [filters, setFilters] = useState({
    type: 'all',
    duration: 'any',
    sort: 'relevance',
    date: 'any',
  });
  const [anchorEl, setAnchorEl] = useState(null);

  const handleSearch = (query) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setSearchQuery('');
      
      // Add to history
      if (!searchHistory.includes(query)) {
        setSearchHistory([query, ...searchHistory.slice(0, 4)]);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    handleSearch(suggestion);
  };

  const clearHistory = () => {
    setSearchHistory([]);
  };

  const removeHistoryItem = (itemToRemove) => {
    setSearchHistory(searchHistory.filter(item => item !== itemToRemove));
  };

  const applyFilters = () => {
    const queryParams = new URLSearchParams({
      q: searchQuery,
      ...filters,
    }).toString();
    navigate(`/search?${queryParams}`);
    setAnchorEl(null);
  };

  useEffect(() => {
    if (searchQuery) {
      // Mock suggestions
      const mockSuggestions = [
        `${searchQuery} tutorial`,
        `${searchQuery} for beginners`,
        `${searchQuery} advanced`,
        `${searchQuery} 2024`,
      ];
      setSuggestions(mockSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  return (
    <Box sx={{ position: 'relative', width: '100%', maxWidth: 600 }}>
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            placeholder="Search videos, channels, and more..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              sx: { borderRadius: 3 },
            }}
            variant="outlined"
            size="small"
          />
          
          <IconButton
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{ 
              bgcolor: 'action.selected',
              borderRadius: 2,
            }}
          >
            <FilterList />
          </IconButton>
          
          <Button
            type="submit"
            variant="contained"
            sx={{ borderRadius: 3, px: 3 }}
          >
            Search
          </Button>
        </Box>
      </form>

      {/* Filters Popover */}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: { width: 300, p: 2, borderRadius: 2 },
        }}
      >
        <Typography variant="h6" gutterBottom>
          Search Filters
        </Typography>
        
        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            label="Type"
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="video">Video</MenuItem>
            <MenuItem value="channel">Channel</MenuItem>
            <MenuItem value="playlist">Playlist</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Duration</InputLabel>
          <Select
            value={filters.duration}
            onChange={(e) => setFilters({ ...filters, duration: e.target.value })}
            label="Duration"
          >
            <MenuItem value="any">Any duration</MenuItem>
            <MenuItem value="short">Short (&lt; 4 minutes)</MenuItem>
            <MenuItem value="medium">Medium (4-20 minutes)</MenuItem>
            <MenuItem value="long">Long (&gt; 20 minutes)</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Sort by</InputLabel>
          <Select
            value={filters.sort}
            onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
            label="Sort by"
          >
            <MenuItem value="relevance">Relevance</MenuItem>
            <MenuItem value="date">Upload date</MenuItem>
            <MenuItem value="rating">Rating</MenuItem>
            <MenuItem value="view">View count</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl fullWidth size="small" sx={{ mb: 3 }}>
          <InputLabel>Date</InputLabel>
          <Select
            value={filters.date}
            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            label="Date"
          >
            <MenuItem value="any">Any time</MenuItem>
            <MenuItem value="hour">Last hour</MenuItem>
            <MenuItem value="day">Today</MenuItem>
            <MenuItem value="week">This week</MenuItem>
            <MenuItem value="month">This month</MenuItem>
            <MenuItem value="year">This year</MenuItem>
          </Select>
        </FormControl>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => setFilters({
              type: 'all',
              duration: 'any',
              sort: 'relevance',
              date: 'any',
            })}
          >
            Clear
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={applyFilters}
          >
            Apply
          </Button>
        </Box>
      </Popover>

      {/* Suggestions Dropdown */}
      {(suggestions.length > 0 || searchQuery === '') && (
        <Paper
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            mt: 1,
            zIndex: 1300,
            maxHeight: 400,
            overflow: 'auto',
          }}
        >
          {searchQuery === '' ? (
            <>
              {/* Search History */}
              {searchHistory.length > 0 && (
                <>
                  <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <History fontSize="small" />
                      Recent searches
                    </Typography>
                    <Button size="small" onClick={clearHistory}>
                      Clear all
                    </Button>
                  </Box>
                  
                  <List>
                    {searchHistory.map((item) => (
                      <ListItem
                        key={item}
                        button
                        onClick={() => handleSuggestionClick(item)}
                        secondaryAction={
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeHistoryItem(item);
                            }}
                          >
                            <Close fontSize="small" />
                          </IconButton>
                        }
                      >
                        <ListItemIcon>
                          <History />
                        </ListItemIcon>
                        <ListItemText primary={item} />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}

              <Divider />

              {/* Trending Searches */}
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <TrendingUp fontSize="small" />
                  Trending searches
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {trendingSearches.map((trend) => (
                    <Chip
                      key={trend}
                      label={trend}
                      onClick={() => handleSuggestionClick(trend)}
                      icon={<Whatshot />}
                      size="small"
                      sx={{ mb: 1 }}
                    />
                  ))}
                </Box>
              </Box>
            </>
          ) : (
            /* Search Suggestions */
            <List>
              {suggestions.map((suggestion, index) => (
                <ListItem
                  key={index}
                  button
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <ListItemIcon>
                    <Search />
                  </ListItemIcon>
                  <ListItemText primary={suggestion} />
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default SearchBar;