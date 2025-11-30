import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import './App.css';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Signin from './pages/Signin';
import PlayMedia from './pages/PlayMedia';
import NewMedia from './pages/NewMedia';
import EditMedia from './pages/EditMedia';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import MediaList from './pages/MediaList';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/signin" element={<Signin />} />
              <Route path="/media" element={<MediaList />} />
              <Route path="/media/play/:id" element={<PlayMedia />} />
              <Route path="/media/new" element={<NewMedia />} />
              <Route path="/media/edit/:id" element={<EditMedia />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/edit" element={<EditProfile />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;