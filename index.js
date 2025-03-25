const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(bodyParser.json());
app.use('/clients', express.static(path.join(__dirname, 'clients'))); // Serve public HTML

app.post('/upload', async (req, res) => {
  try {
    const { name, image_urls_combined } = req.body;

    if (!name || !image_urls_combined) {
      return res.status(400).json({ error: 'Missing name or image_urls_combined' });
    }

    const imageUrls = image_urls_combined.split(',').map(url => url.trim());
    const clientFile = path.join(__dirname, 'clients', `${name}.html`);

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
    </style>
  </head>
  <body>
    <h1>Photos for ${name}'s Electrical Job</h1>
    ${imageUrls.map(url => `<img src="${url}" alt="⚠️ Image File Corrupted">`).join('\n')}
  </body>
</html>`;

    fs.writeFileSync(clientFile, html);

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
