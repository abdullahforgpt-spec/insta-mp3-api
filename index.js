const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// List of processing server endpoints to try sequentially
const COBALT_ENDPOINTS = [
    'https://api.cobalt.tools/api/json',
    'https://cobalt.api.v0.sh/api/json'
];

app.get('/api/extract', async (req, res) => {
    let { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'Instagram URL is required' });
    }

    // Clean URL query strings
    if (url.includes('?')) {
        url = url.split('?')[0];
    }

    // Loop through the mirrors until one works
    for (const endpoint of COBALT_ENDPOINTS) {
        try {
            console.log(`Attempting pipeline extraction via: ${endpoint}`);
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
                },
                body: JSON.stringify({
                    url: url,
                    downloadMode: 'audio',
                    audioFormat: 'mp3',
                    filenameStyle: 'basic'
                })
            });

            if (!response.ok) continue;

            const data = await response.json();

            if (data && data.url) {
                return res.json({ success: true, mp3_link: data.url });
            }
        } catch (err) {
            console.error(`Endpoint ${endpoint} failed or timed out.`);
        }
    }

    // If both nodes fail
    return res.status(500).json({ 
        success: false, 
        error: 'All public processing endpoints are currently rate-limited. Please try again in a few minutes.' 
    });
});

app.listen(PORT, () => {
    console.log(`Optimized infrastructure navigating on port ${PORT}`);
});
