const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Main Endpoint: /api/extract
app.get('/api/extract', async (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'Instagram URL is required' });
    }

    try {
        // Direct integration with an open infrastructure route bypass
        const response = await fetch('https://cobalt.api.v0.sh/api/json', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url: url,
                downloadMode: 'audio',
                audioFormat: 'mp3'
            })
        });

        const data = await response.json();

        if (data && data.url) {
            return res.json({ success: true, mp3_link: data.url });
        } else if (data && data.text) {
            return res.status(500).json({ success: false, error: data.text });
        } else {
            return res.status(500).json({ success: false, error: 'Media streamline token could not be fetched.' });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: 'Server connectivity route failed.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running smoothly on port ${PORT}`);
});
