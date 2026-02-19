import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Banner from './components/Banner';
import Row from './components/Row';
import MovieDetails from './components/MovieDetails';
import LoginView from './components/LoginView';
import SignupView from './components/SignupView';
import SearchResults from './components/SearchResults';
import api from './services/api';
import './index.css';

function App() {
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [user, setUser] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [authState, setAuthState] = useState('login'); // 'login' or 'signup'

  // Persistence: Check for token and user on load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleSearch = async (query) => {
    if (!query) {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    const results = await api.searchMovies(query);
    setSearchResults(results);
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setAuthState('login');
  };

  if (!user) {
    return (
      <>
        <Navbar
          onLoginClick={() => setAuthState('login')}
          onSignupClick={() => setAuthState('signup')}
          isGuest={true}
        />
        {authState === 'signup' ? (
          <SignupView
            onSignupSuccess={setUser}
            onSwitchToLogin={() => setAuthState('login')}
          />
        ) : (
          <LoginView
            onLoginSuccess={setUser}
            onSwitchToSignup={() => setAuthState('signup')}
          />
        )}
      </>
    );
  }

  return (
    <div className="app">
      <Navbar onSearch={handleSearch} onLogout={handleLogout} />

      {isSearching ? (
        <SearchResults results={searchResults} onMovieClick={setSelectedMovie} />
      ) : (
        <>
          <Banner onMovieClick={setSelectedMovie} />

          <Row title="My List" fetchType="watchlist" onMovieClick={setSelectedMovie} />

          <Row
            title="NETFLIX ORIGINALS"
            fetchType="originals"
            isLargeRow={true}
            onMovieClick={setSelectedMovie}
          />
          <Row title="Trending Now" fetchType="trending" onMovieClick={setSelectedMovie} />
          <Row title="Top Rated" fetchType="top_rated" onMovieClick={setSelectedMovie} />
          <Row title="Action Movies" fetchType="action" onMovieClick={setSelectedMovie} />
          <Row title="Comedy Movies" fetchType="comedy" onMovieClick={setSelectedMovie} />
          <Row title="Horror Movies" fetchType="horror" onMovieClick={setSelectedMovie} />
          <Row title="Romance Movies" fetchType="romance" onMovieClick={setSelectedMovie} />
          <Row title="Documentaries" fetchType="documentaries" onMovieClick={setSelectedMovie} />
        </>
      )}

      <MovieDetails
        movieData={selectedMovie}
        onClose={() => setSelectedMovie(null)}
      />

      <footer style={{
        padding: "50px",
        backgroundColor: "#111",
        color: "#757575",
        fontSize: "13px",
        textAlign: "center"
      }}>
        <p>© 2026 Netflix Clone - Build Challenge</p>
      </footer>
    </div>
  );
}

export default App;
