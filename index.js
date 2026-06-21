const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Main Endpoint: /api/extract
app.get('/api/extract', async (req, res) => {
    let { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'Instagram URL is required' });
    }

    try {
        // Clean the Instagram URL structure for the pipeline
        if (url.includes('?')) {
            url = url.split('?')[0];
        }

        // Using an open direct endpoint fallback configuration
        const targetApi = `https://api.vanyarg.dev/api/v1/cobalt?url=${encodeURIComponent(url)}&audioOnly=true`;
        
        const fetchResponse = await fetch(targetApi, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json'
            }
        });

        const data = await fetchResponse.json();

        if (data && data.url) {
            return res.json({ success: true, mp3_link: data.url });
        } else {
            return res.status(500).json({ success: false, error: 'Media stream node is currently rate-limited.' });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: 'Network routing exception, please retry.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running smoothly on port ${PORT}`);
});
