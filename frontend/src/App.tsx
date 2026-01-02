import { useState, useEffect } from 'react';
import WeeklyTable from './components/WeeklyTable';
import Login from './components/Login';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    // Check if user is already logged in
    const authStatus = localStorage.getItem('isAuthenticated');
    const savedUsername = localStorage.getItem('username');
    
    if (authStatus === 'true' && savedUsername) {
      setIsAuthenticated(true);
      setUsername(savedUsername);
    }
  }, []);

  const handleLogin = (user: string) => {
    setUsername(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');
    setIsAuthenticated(false);
    setUsername('');
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-content">
          <h1>Haftalık Planlama</h1>
          <div className="app-header-user">
            <span className="user-name">{username}</span>
            <button className="logout-button" onClick={handleLogout}>
              Çıkış
            </button>
          </div>
        </div>
      </header>
      <main className="app-main">
        <WeeklyTable />
      </main>
    </div>
  );
}

export default App;

