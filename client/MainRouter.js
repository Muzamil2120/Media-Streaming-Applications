import React, { Component } from 'react'
import { Route, Switch } from 'react-router-dom'
import Home from './core/Home'
import Menu from './core/Menu'
import MediaList from './media/MediaList'
import NewMedia from './media/NewMedia'

class MainRouter extends Component {
  componentDidMount() {
    const jssStyles = document.getElementById('jss-server-side')
    if (jssStyles && jssStyles.parentNode) {
      jssStyles.parentNode.removeChild(jssStyles)
    }
  }

  render() {
    return (
      <div>
        <Menu/>
        <Switch>
          <Route exact path="/" component={Home}/>
          <Route path="/media" component={MediaList}/>
          <Route path="/new-media" component={NewMedia}/>
        </Switch>
      </div>
    )
  }
}

export default MainRouter