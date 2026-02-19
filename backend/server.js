const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

dotenv.config();

const WATCHLIST_FILE = path.join(__dirname, 'watchlist.json');
const USERS_FILE = path.join(__dirname, 'users.json');
const JWT_SECRET = process.env.JWT_SECRET || 'netflix_secret_key_123';

// Initialize files if they don't exist
if (!fs.existsSync(WATCHLIST_FILE)) fs.writeFileSync(WATCHLIST_FILE, JSON.stringify([]));
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, JSON.stringify([]));

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Auth Endpoints
app.post('/api/auth/signup', async (req, res) => {
    console.log(`Backend: Signup attempt for ${req.body.email}`);
    try {
        const { email, password } = req.body;
        const users = JSON.parse(fs.readFileSync(USERS_FILE));

        if (users.find(u => u.email === email)) {
            console.log(`Backend: Signup failed - User ${email} already exists`);
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = { id: Date.now(), email, password: hashedPassword };
        users.push(newUser);
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

        console.log(`Backend: User ${email} created successfully`);
        const token = jwt.sign({ id: newUser.id, email }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ token, user: { id: newUser.id, email } });
    } catch (error) {
        console.error(`Backend: Signup error: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    console.log(`Backend: Login attempt for ${req.body.email}`);
    try {
        const { email, password } = req.body;
        const users = JSON.parse(fs.readFileSync(USERS_FILE));
        const user = users.find(u => u.email === email);

        if (!user || !(await bcrypt.compare(password, user.password))) {
            console.log(`Backend: Login failed for ${email}`);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        console.log(`Backend: Login successful for ${email}`);
        const token = jwt.sign({ id: user.id, email }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, email } });
    } catch (error) {
        console.error(`Backend: Login error: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/movies/:type', async (req, res) => {
    console.log(`Backend: Fetching ${req.params.type} movies...`);
    try {
        const { type } = req.params;
        const { page = 1 } = req.query;
        const TMDB_API_KEY = process.env.TMDB_API_KEY;

        if (!TMDB_API_KEY) {
            return res.status(500).json({ error: 'TMDB API Key missing' });
        }

        const typeConfig = {
            trending: { path: '/trending/all/week', params: {} },
            originals: { path: '/discover/tv', params: { with_networks: 213 } },
            top_rated: { path: '/movie/top_rated', params: {} },
            action: { path: '/discover/movie', params: { with_genres: 28 } },
            comedy: { path: '/discover/movie', params: { with_genres: 35 } },
            horror: { path: '/discover/movie', params: { with_genres: 27 } },
            romance: { path: '/discover/movie', params: { with_genres: 10749 } },
            documentaries: { path: '/discover/movie', params: { with_genres: 99 } },
        };

        const config = typeConfig[type] || typeConfig.trending;
        const response = await axios.get(`https://api.themoviedb.org/3${config.path}`, {
            params: {
                api_key: TMDB_API_KEY,
                language: 'en-US',
                page,
                ...config.params
            },
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching movies:', error.message);
        res.status(error.response?.status || 500).json({ error: error.message });
    }
});

// Search endpoint
app.get('/api/search', async (req, res) => {
    try {
        const { q } = req.query;
        const TMDB_API_KEY = process.env.TMDB_API_KEY;

        if (!TMDB_API_KEY) {
            return res.status(500).json({ error: 'TMDB API Key missing' });
        }

        const response = await axios.get(`https://api.themoviedb.org/3/search/multi`, {
            params: {
                api_key: TMDB_API_KEY,
                language: 'en-US',
                query: q,
                include_adult: false,
            },
        });

        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: error.message });
    }
});

app.get('/api/details/:type/:id', async (req, res) => {
    try {
        const { type, id } = req.params;
        const TMDB_API_KEY = process.env.TMDB_API_KEY;

        // Normalize type (tv or movie)
        const mediaType = type === 'tv' ? 'tv' : 'movie';

        const response = await axios.get(`https://api.themoviedb.org/3/${mediaType}/${id}`, {
            params: {
                api_key: TMDB_API_KEY,
                append_to_response: 'videos,credits,similar',
            },
        });

        res.json(response.data);
    } catch (error) {
        console.error(`Error fetching ${req.params.type} details:`, error.message);
        res.status(error.response?.status || 500).json({ error: error.message });
    }
});

// Watchlist endpoints
app.get('/api/watchlist', (req, res) => {
    const data = fs.readFileSync(WATCHLIST_FILE);
    res.json(JSON.parse(data));
});

app.post('/api/watchlist', (req, res) => {
    const movie = req.body;
    const data = JSON.parse(fs.readFileSync(WATCHLIST_FILE));

    if (!data.find(m => m.id === movie.id)) {
        data.push(movie);
        fs.writeFileSync(WATCHLIST_FILE, JSON.stringify(data, null, 2));
    }
    res.json(data);
});

app.delete('/api/watchlist/:id', (req, res) => {
    const { id } = req.params;
    let data = JSON.parse(fs.readFileSync(WATCHLIST_FILE));
    data = data.filter(m => m.id !== parseInt(id));
    fs.writeFileSync(WATCHLIST_FILE, JSON.stringify(data, null, 2));
    res.json(data);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    const key = process.env.TMDB_API_KEY;
    if (!key || key === 'YOUR_TMDB_API_KEY_HERE') {
        console.warn('⚠️ WARNING: TMDB_API_KEY is not set correctly in backend/.env.');
    } else {
        console.log(`✅ TMDB_API_KEY loaded: ${key.substring(0, 4)}...${key.substring(key.length - 4)}`);
    }
});
