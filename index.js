const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(bodyParser.json());
app.use('/clients', express.static(path.join(__dirname, 'clients'))); // Serve HTMLs

app.post('/upload', async (req, res) => {
  try {
    const { name, image_urls_combined } = req.body;

    if (!name || !image_urls_combined) {
      return res.status(400).json({ error: 'Missing name or image_urls_combined' });
    }

    const imageUrls = image_urls_combined.split(',').map(url => url.trim());
    const clientFile = path.join(__dirname, 'clients', `${name}.html`);

    // Generate styled HTML content
    const insertHtml = imageUrls.map(url =>
      `<img src="${url}" style="max-width: 100%; margin-bottom: 20px; border-radius: 12px;">`
    ).join('\n');

    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Photos for ${name}'s Electrical Job</title>
        <link href="https://fonts.googleapis.com/css2?family=Poppins&display=swap" rel="stylesheet">
        <style>
          body {
            background-color: #9266cc;
            color: white;
            font-family: 'Poppins', sans-serif;
            padding: 40px;
          }
          h1 {
            text-align: center;
            margin-bottom: 40px;
          }
          img {
            display: block;
            margin: 0 auto 20px;
          }
        </style>
      </head>
      <body>
        <h1>Advid AI — Photos for ${name}'s Electrical Job</h1>
        ${insertHtml}
      </body>
      </html>
    `;

    // Always overwrite old HTML
    fs.writeFileSync(clientFile, fullHtml);

    const publicUrl = `https://${req.hostname}/clients/${name}.html`;
    res.json({ success: true, url: publicUrl });

  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server live at port ${PORT}`);
});

