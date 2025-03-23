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

    // Create initial HTML if not exists
    if (!fs.existsSync(clientFile)) {
      fs.writeFileSync(clientFile, `<html><body><h1>Images for ${name}</h1>\n</body></html>`);
    }

    // Insert images before </body>
    let content = fs.readFileSync(clientFile, 'utf8');
    const insertHtml = imageUrls.map(url => `<img src="${url}" style="max-width: 100%; margin-bottom: 10px;">`).join('\n');
    content = content.replace('</body>', `${insertHtml}\n</body>`);

    fs.writeFileSync(clientFile, content);

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
