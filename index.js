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
        // Updated to use the active production processing endpoint
        const cobaltResponse = await fetch('https://api.cobalt.tools/api/json', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url: url,
                downloadMode: 'audio', 
                audioFormat: 'mp3',    
                filenameStyle: 'basic'
            })
        });

        const data = await cobaltResponse.json();

        if (data && data.url) {
            return res.json({ success: true, mp3_link: data.url });
        } else {
            return res.status(500).json({ success: false, error: data.text || 'The extraction engine node rejected this request.' });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: 'Internal pipeline connectivity issue.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running smoothly on port ${PORT}`);
});
