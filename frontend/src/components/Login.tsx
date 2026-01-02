import { useState } from "react";
import "./Login.css";

interface LoginProps {
  onLogin: (username: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      setError("Lütfen kullanıcı adı girin");
      return;
    }

    if (!password.trim()) {
      setError("Lütfen şifre girin");
      return;
    }

    // Kullanıcı adı ve şifre doğrulama
    if (username.trim().toLowerCase() !== "ulak") {
      setError("Kullanıcı adı hatalı");
      return;
    }

    if (password !== "Password7") {
      setError("Şifre hatalı");
      return;
    }

    // Giriş başarılı
    localStorage.setItem("username", username);
    localStorage.setItem("isAuthenticated", "true");
    onLogin(username);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Haftalık Planlama</h1>
          <p>Proje yönetim sistemine hoş geldiniz</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="login-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="username">Kullanıcı Adı</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError("");
              }}
              placeholder="Kullanıcı adınızı girin"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Şifre</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder="Şifrenizi girin"
            />
          </div>

          <button type="submit" className="login-button">
            Giriş Yap
          </button>
        </form>
      </div>
    </div>
  );
}
