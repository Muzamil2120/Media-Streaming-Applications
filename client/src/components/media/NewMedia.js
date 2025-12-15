import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from 'material-ui/styles'
import Card, { CardContent, CardActions } from 'material-ui/Card'
import Typography from 'material-ui/Typography'
import TextField from 'material-ui/TextField'
import Button from 'material-ui/Button'

const styles = theme => ({
  card: {
    maxWidth: 600,
    margin: 'auto',
    marginTop: theme.spacing.unit * 5,
    padding: theme.spacing.unit * 3
  },
  title: {
    padding: `${theme.spacing.unit * 3}px 0`
  },
  textField: {
    width: '100%',
    marginBottom: theme.spacing.unit * 2
  }
})

class NewMedia extends Component {
  state = {
    title: '',
    description: '',
    genre: ''
  }

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value
    })
  }

  handleSubmit = () => {
    console.log('Media upload data:', this.state)
  }

  render() {
    const { classes } = this.props
    
    return (
      <Card className={classes.card}>
        <CardContent>
          <Typography type="headline" component="h2" className={classes.title}>
            Upload New Media
          </Typography>
          
          <TextField
            id="title"
            label="Media Title"
            className={classes.textField}
            value={this.state.title}
            onChange={this.handleChange('title')}
            margin="normal"
          />
          
          <TextField
            id="description"
            label="Description"
            multiline
            rows="4"
            className={classes.textField}
            value={this.state.description}
            onChange={this.handleChange('description')}
            margin="normal"
          />
          
          <TextField
            id="genre"
            label="Genre"
            className={classes.textField}
            value={this.state.genre}
            onChange={this.handleChange('genre')}
            margin="normal"
          />

          <Button variant="raised" color="primary" style={{marginTop: 10}}>
            Select Video File
          </Button>
        </CardContent>
        
        <CardActions>
          <Button 
            variant="raised" 
            color="primary" 
            onClick={this.handleSubmit}
            disabled={!this.state.title}
          >
            Upload Media
          </Button>
        </CardActions>
      </Card>
    )
  }
}

NewMedia.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(NewMedia)