import express from 'express';
import pa11y from 'pa11y';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

app.post('/api/check-accessibility', async (req, res) => {
    const { url } = req.body;
    console.log(`Testing the accessibility of ${url}`);

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        const results = await pa11y(url, {
            standard: 'WCAG2AA',
            timeout: 60000,
            wait: 5000,
            runners: ['axe', 'htmlcs']
        });
        console.log('Test completed!');
        res.json(results);
    } catch (error) {
        console.error('Pa11y error:', error);
        res.status(500).json({ error: 'Failed to run accessibility test' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
