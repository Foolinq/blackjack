const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Force HTTPS in production and handle redirects
app.use((req, res, next) => {
    // Force HTTPS in production
    if (req.header('x-forwarded-proto') !== 'https' && process.env.NODE_ENV === 'production') {
        return res.redirect(301, `https://${req.header('host')}${req.url}`);
    }
    next();
});

// Serve static files from the current directory
app.use(express.static(__dirname));

// Route all requests to index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Blackjack game running on port ${PORT}`);
});
