const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(bodyParser.json());
app.use('/clients', express.static(path.join(__dirname, 'clients'))); // Public-facing folder

app.post('/upload', async (req, res) => {
  try {
    const { name, image_urls_combined } = req.body;

    if (!name || !image_urls_combined) {
      return res.status(400).json({ error: 'Missing name or image_urls_combined' });
    }

    const imageUrls = image_urls_combined.split(',').map(url => url.trim());

    // Make file URL-safe (e.g., replace spaces with underscores)
    const safeName = name.trim().replace(/\s+/g, '_');
    const clientFile = path.join(__dirname, 'clients', `${safeName}.html`);

    // Generate clean title
    const title = `Photos for ${name}'s Electrical Job`;

    const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins&display=swap" rel="stylesheet">
    <style>
      body {
        background-color: #0F3325;
        font-family: 'Poppins', sans-serif;
        color: white;
        padding: 20px;
        text-align: center;
      }
      h1 {
        margin-bottom: 20px;
        font-size: 28px;
      }
      img.logo {
        max-height: 60px;
        margin-bottom: 25px;
      }
      img.job-photo {
        max-width: 90%;
        margin: 15px auto;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0,0,0,0.3);
        display: block;
      }
    </style>
  </head>
  <body>
    <img class="logo" src="https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg" alt="Company Logo">
    <h1>${title}</h1>
    ${imageUrls.map(url => `<img class="job-photo" src="${url}" alt="Job Photo">`).join('\n')}
  </body>
</html>`;

    fs.writeFileSync(clientFile, html);

    const publicUrl = `https://${req.hostname}/clients/${safeName}.html`;
    res.json({ success: true, url: publicUrl });

  } catch (err) {
    console.error('❌ Error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server live at port ${PORT}`);
});
