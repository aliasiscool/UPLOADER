const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(bodyParser.json());
app.use('/clients', express.static(path.join(__dirname, 'clients')));

app.post('/upload', async (req, res) => {
  try {
    const { name, image_urls_combined } = req.body;

    if (!name || !image_urls_combined) {
      return res.status(400).json({ error: 'Missing name or image_urls_combined' });
    }

    console.log(`📩 Upload requested for ${name}`);

    // Format name: file-safe and readable
    const safeFileName = name.toLowerCase().replace(/\s+/g, '');
    const clientFile = path.join(__dirname, 'clients', `${safeFileName}.html`);

    // Start fresh: overwrite HTML every time
    const title = `Photos for ${name}'s Electrical Job`;
    let html = `
      <html>
        <head>
          <title>${title}</title>
          <link href="https://fonts.googleapis.com/css2?family=Poppins&display=swap" rel="stylesheet">
          <style>
            body {
              background-color: #0F3325;
              color: white;
              font-family: 'Poppins', sans-serif;
              padding: 20px;
            }
            img {
              max-width: 100%;
              margin-bottom: 10px;
              border-radius: 6px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            }
            h1 {
              margin-bottom: 20px;
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
    `;

    const imageUrls = image_urls_combined.split(',').map(url => url.trim());
    imageUrls.forEach(url => {
      html += `<img src="${url}" alt="Image"><br>`;
    });

    html += `</body></html>`;

    fs.writeFileSync(clientFile, html);

    const publicUrl = `https://${req.hostname}/clients/${safeFileName}.html`;
    res.json({ success: true, url: publicUrl });

  } catch (err) {
    console.error('❌ Error in /upload:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});





