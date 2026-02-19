import React, { useState } from 'react';
import './Login.css';
import api from '../services/api';

const LoginView = ({ onLoginSuccess, onSwitchToSignup }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await api.login(email, password);
            onLoginSuccess(data.user);
        } catch (err) {
            setError(err.response?.data?.error || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-screen">
            <div className="login-screen__card">
                <h1>Login</h1>
                {error && <div className="login-error">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Email or phone number"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? 'Processing...' : 'Login'}
                    </button>
                    <div className="login-help">
                        <div className="remember-me">
                            <input type="checkbox" id="remember" />
                            <label htmlFor="remember">Remember me</label>
                        </div>
                        <span>Need help?</span>
                    </div>
                </form>
                <div className="login-footer">
                    <p style={{ marginTop: '20px' }}>
                        New to Netflix?
                        <span className="switch-link" onClick={onSwitchToSignup} style={{ marginLeft: '5px', color: '#0071eb', cursor: 'pointer', fontWeight: 'bold' }}>
                            Sign Up now.
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginView;
