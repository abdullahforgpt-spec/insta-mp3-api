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
        // Cobalt API Core Routing
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
            // VERIFIED AUDIO ISOLATION LAYER
            // Client ko direct video url dene ke bajaye hum direct remote data pipe karenge
            const audioStream = await fetch(data.url);
            
            // Masking response headers to force true audio stream chunking
            res.setHeader('Content-Type', 'audio/mpeg');
            res.setHeader('Content-Disposition', `attachment; filename="instagram_audio_${Date.now()}.mp3"`);
            res.setHeader('Access-Control-Allow-Origin', '*');

            // Pipe binary buffer directly into client response stream
            const arrayBuffer = await audioStream.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            return res.send(buffer);
        } else {
            return res.status(500).json({ success: false, error: 'Target audio node compilation failed.' });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: 'Internal streaming pipeline error.' });
    }
});

app.listen(PORT, () => {
    console.log(`Audio Stream Engine active on port ${PORT}`);
});
