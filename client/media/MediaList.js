import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from 'material-ui/styles'
import Typography from 'material-ui/Typography'
import Grid from 'material-ui/Grid'
import Card, { CardContent, CardMedia } from 'material-ui/Card'
import Button from 'material-ui/Button'

const styles = theme => ({
  root: {
    flexGrow: 1,
    margin: theme.spacing.unit * 3
  },
  card: {
    maxWidth: 345,
    margin: theme.spacing.unit * 2
  },
  media: {
    height: 200,
  }
})

class MediaList extends Component {
  state = {
    media: []
  }

  render() {
    const { classes } = this.props
    
    return (
      <div className={classes.root}>
        <Typography variant="display1" gutterBottom>
          Browse Media
        </Typography>
        <Grid container spacing={24}>
          <Grid item xs={12} sm={6} md={4}>
            <Card className={classes.card}>
              <CardMedia
                className={classes.media}
                image="/api/placeholder/345/200"
                title="Sample Media 1"
              />
              <CardContent>
                <Typography variant="headline" component="h2">
                  Sample Video 1
                </Typography>
                <Typography component="p">
                  This is a sample media description.
                </Typography>
                <Button color="primary" style={{marginTop: 10}}>
                  Watch Now
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </div>
    )
  }
}

MediaList.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(MediaList)