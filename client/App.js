import React from 'react'
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles'
import { blue, red } from 'material-ui/colors'
import { BrowserRouter } from 'react-router-dom'
import { hot } from 'react-hot-loader'
import MainRouter from './MainRouter'

const theme = createMuiTheme({
  palette: {
    primary: {
      light: blue[300],
      main: blue[500],
      dark: blue[700],
      contrastText: '#fff',
    },
    secondary: {
      light: red[300],
      main: red[500],
      dark: red[700],
      contrastText: '#000',
    }
  }
})

const App = () => (
  <BrowserRouter>
    <MuiThemeProvider theme={theme}>
      <MainRouter/>
    </MuiThemeProvider>
  </BrowserRouter>
)

export default hot(module)(App)