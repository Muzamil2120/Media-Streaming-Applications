import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Chip,
  Button,
} from '@mui/material';
import {
  TrendingUp,
  Visibility,
  ThumbUp,
  Subscriptions,
  AccessTime,
  VideoCall,
  People,
  MonetizationOn,
  Whatshot,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const DashboardPage = () => {
  // Mock data
  const stats = [
    { title: 'Total Views', value: '1.2M', change: '+12%', icon: <Visibility />, color: '#2196F3' },
    { title: 'Subscribers', value: '45.2K', change: '+8%', icon: <Subscriptions />, color: '#4CAF50' },
    { title: 'Total Likes', value: '256K', change: '+15%', icon: <ThumbUp />, color: '#FF9800' },
    { title: 'Watch Time', value: '45.6K', change: '+22%', icon: <AccessTime />, color: '#9C27B0' },
    { title: 'Videos', value: '156', change: '+5%', icon: <VideoCall />, color: '#FF5722' },
    { title: 'Revenue', value: '$4,256', change: '+18%', icon: <MonetizationOn />, color: '#795548' },
  ];

  const viewsData = [
    { day: 'Mon', views: 4000 },
    { day: 'Tue', views: 3000 },
    { day: 'Wed', views: 5000 },
    { day: 'Thu', views: 2780 },
    { day: 'Fri', views: 1890 },
    { day: 'Sat', views: 2390 },
    { day: 'Sun', views: 3490 },
  ];

  const topVideos = [
    { id: 1, title: 'Introduction to MERN Stack', views: '150K', likes: '12K', duration: '15:30' },
    { id: 2, title: 'React Hooks Masterclass', views: '120K', likes: '9.5K', duration: '45:20' },
    { id: 3, title: 'Node.js Performance', views: '98K', likes: '8.2K', duration: '38:45' },
    { id: 4, title: 'MongoDB Atlas Guide', views: '76K', likes: '6.8K', duration: '28:10' },
    { id: 5, title: 'Express.js REST API', views: '65K', likes: '5.9K', duration: '33:25' },
  ];

  const audienceData = [
    { name: '18-24', value: 35 },
    { name: '25-34', value: 28 },
    { name: '35-44', value: 20 },
    { name: '45-54', value: 12 },
    { name: '55+', value: 5 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <Box sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Dashboard Overview
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track your channel performance and analytics
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={stat.title}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: stat.color, mr: 2 }}>
                    {stat.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {stat.value}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Chip
                    label={stat.change}
                    size="small"
                    icon={stat.change.startsWith('+') ? <ArrowUpward /> : <ArrowDownward />}
                    color={stat.change.startsWith('+') ? 'success' : 'error'}
                    sx={{ borderRadius: 1 }}
                  />
                  <Typography variant="caption" sx={{ ml: 1 }}>
                    from last week
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Views Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Views Over Time
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={viewsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="views"
                  stroke="#FF0000"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Audience Chart */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Audience Age Distribution
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={audienceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {audienceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Top Videos & Quick Actions */}
      <Grid container spacing={3}>
        {/* Top Videos */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold">
                Top Performing Videos
              </Typography>
              <Button variant="outlined">See All</Button>
            </Box>
            <List>
              {topVideos.map((video, index) => (
                <React.Fragment key={video.id}>
                  <ListItem
                    secondaryAction={
                      <Chip
                        label={`${video.views} views`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    }
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.light', color: 'white' }}>
                        {index + 1}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={video.title}
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                            <ThumbUp sx={{ fontSize: 14, mr: 0.5 }} />
                            {video.likes} likes
                          </Typography>
                          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                            <AccessTime sx={{ fontSize: 14, mr: 0.5 }} />
                            {video.duration}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < topVideos.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button variant="contained" startIcon={<VideoCall />} fullWidth>
                Upload New Video
              </Button>
              <Button variant="outlined" startIcon={<TrendingUp />} fullWidth>
                View Analytics
              </Button>
              <Button variant="outlined" startIcon={<People />} fullWidth>
                Manage Subscribers
              </Button>
              <Button variant="outlined" startIcon={<Whatshot />} fullWidth>
                Promote Content
              </Button>
            </Box>

            {/* Recent Activity */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Recent Activity
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="New comment on 'MERN Stack Tutorial'"
                    secondary="2 hours ago"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Video 'React Hooks' reached 10K views"
                    secondary="5 hours ago"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Gained 124 new subscribers"
                    secondary="1 day ago"
                  />
                </ListItem>
              </List>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;