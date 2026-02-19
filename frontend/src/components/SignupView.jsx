import React, { useState } from 'react';
import './Login.css';
import api from '../services/api';

const SignupView = ({ onSignupSuccess, onSwitchToLogin }) => {
    const [username, setUsername] = useState('');
    const [mobile, setMobile] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Backend currently only expects email/password, but we'll send everything
            // and maybe update backend if needed, or just use email/password for now.
            const data = await api.signup(email, password);
            onSignupSuccess(data.user);
        } catch (err) {
            setError(err.response?.data?.error || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-screen">
            <div className="login-screen__card">
                <h1>Sign Up</h1>
                {error && <div className="login-error">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Mobile Number"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        required
                    />
                    <input
                        type="email"
                        placeholder="Email"
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
                    <button type="submit" className="login-button sign-up" disabled={loading}>
                        {loading ? 'Processing...' : 'Sign Up'}
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
                        Already subscribed to Netflix?
                        <span className="switch-link" onClick={onSwitchToLogin} style={{ marginLeft: '5px', color: '#0071eb', cursor: 'pointer', fontWeight: 'bold' }}>
                            Login now.
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignupView;
