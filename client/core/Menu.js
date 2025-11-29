import React from 'react'
import { withRouter, Link } from 'react-router-dom'
import AppBar from 'material-ui/AppBar'
import Toolbar from 'material-ui/Toolbar'
import Typography from 'material-ui/Typography'
import IconButton from 'material-ui/IconButton'
import HomeIcon from 'material-ui-icons/Home'
import VideoLibrary from 'material-ui-icons/VideoLibrary'
import AddBox from 'material-ui-icons/AddBox'
import Button from 'material-ui/Button'

const isActive = (history, path) => {
  if (history.location.pathname == path)
    return {color: '#ff4081'}
  else
    return {color: '#ffffff'}
}

const Menu = withRouter(({history}) => (
  <AppBar position="static">
    <Toolbar>
      <Typography type="title" color="inherit" style={{flex: 1}}>
        MERN Mediastream
      </Typography>
      <Link to="/">
        <IconButton aria-label="Home" style={isActive(history, "/")}>
          <HomeIcon/>
        </IconButton>
      </Link>
      <Link to="/media">
        <Button style={isActive(history, "/media")}>
          <VideoLibrary style={{marginRight: 8}}/>
          Browse Media
        </Button>
      </Link>
      <Link to="/new-media">
        <Button style={isActive(history, "/new-media")}>
          <AddBox style={{marginRight: 8}}/>
          Upload
        </Button>
      </Link>
    </Toolbar>
  </AppBar>
))

export default Menu;