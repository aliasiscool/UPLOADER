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

    const imageUrls = image_urls_combined
      .split(',')
      .map(url => url.trim().replace(/^{|}$/g, '')); // remove any surrounding {}

    // 👇 Sanitize filename by removing spaces
    const safeFilename = name.replace(/\s+/g, '');

    const clientFile = path.join(__dirname, 'clients', `${safeFilename}.html`);

    const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Photos for ${name}'s Electrical Job</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins&display=swap" rel="stylesheet">
    <style>
      body {
        background-color: #0F3325;
        font-family: 'Poppins', sans-serif;
        color: white;
        padding: 20px;
        text-align: center;
      }
      img {
        max-width: 90%;
        margin: 15px 0;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0,0,0,0.3);
      }
      div {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
    </style>
  </head>
  <body>
    <h1>Photos for ${name}'s Electrical Job</h1>
    ${imageUrls.map(url => `
      <div>
        <img src="${url}" alt="⚡">
      </div>
    `).join('\n')}
  </body>
</html>`;

    fs.writeFileSync(clientFile, html);

    const publicUrl = `https://${req.hostname}/clients/${safeFilename}.html`;
    res.json({ success: true, url: publicUrl });

  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server live at port ${PORT}`);
});



