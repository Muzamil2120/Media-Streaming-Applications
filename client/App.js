import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<RegisterPage />} />
            <Route path="/signin" element={<SigninPage />} />
            {/* Other routes */}
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}