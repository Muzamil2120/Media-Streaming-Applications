import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {withStyles} from 'material-ui/styles'
import Card, {CardContent, CardMedia} from 'material-ui/Card'
import Typography from 'material-ui/Typography'
import Button from 'material-ui/Button'
import { Link } from 'react-router-dom'

const styles = theme => ({
  card: {
    maxWidth: 800,
    margin: 'auto',
    marginTop: theme.spacing.unit * 5,
    textAlign: 'center'
  },
  title: {
    padding: theme.spacing.unit * 3,
    color: theme.palette.primary.main,
    fontSize: '2.5rem'
  },
  media: {
    minHeight: 400,
    backgroundColor: theme.palette.primary.light
  },
  button: {
    margin: theme.spacing.unit * 2
  }
})

class Home extends Component {
  render() {
    const {classes} = this.props
    return (
      <div>
        <Card className={classes.card}>
          <Typography type="headline" component="h1" className={classes.title}>
            Welcome to MERN Mediastream
          </Typography>
          <CardMedia className={classes.media} title="Media Streaming Platform">
            <div style={{padding: '100px 0', color: 'white'}}>
              <Typography type="display1" component="h2" style={{color: 'white'}}>
                Stream Your Media Anywhere
              </Typography>
              <Typography type="subheading" component="p" style={{color: 'white', margin: '20px 0'}}>
                Upload, stream, and share your videos with the world
              </Typography>
            </div>
          </CardMedia>
          <CardContent>
            <Link to="/media">
              <Button variant="raised" color="primary" className={classes.button} size="large">
                Browse Media
              </Button>
            </Link>
            <Link to="/new-media">
              <Button variant="raised" color="secondary" className={classes.button} size="large">
                Upload Video
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }
}

Home.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(Home)