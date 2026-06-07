const crypto = require('crypto');
global.crypto = crypto;

const { Client, RemoteAuth } = require('whatsapp-web.js');
const { MongoStore } = require('wwebjs-mongo');
const mongoose = require('mongoose');
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send(`
        <div style="text-align:center; margin-top:50px; font-family:sans-serif;">
            <h1>WhatsApp Bot Panel</h1>
            <input type="text" id="phone" placeholder="994501234567" style="padding:10px; width:250px;">
            <button onclick="getCode()" style="padding:10px;">Kodu Al</button>
            <h2 id="result" style="color:#008080; margin-top:30px;"></h2>
            <script>
                async function getCode() {
                    const phone = document.getElementById('phone').value;
                    document.getElementById('result').innerText = 'Bot başladılır... Zəhmət olmasa 15-20 saniyə gözləyin.';
                    const res = await fetch('/get-code', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ phone })
                    });
                    const data = await res.json();
                    document.getElementById('result').innerText = data.code;
                }
            </script>
        </div>
    `);
});

app.post('/get-code', async (req, res) => {
    const { phone } = req.body;
    try {
        const MONGODB_URI = 'mongodb+srv://Ryhavean:raven123_@cluster0.6yxmbht.mongodb.net/?appName=Cluster0';
        
        if (mongoose.connection.readyState === 0) await mongoose.connect(MONGODB_URI);
        const store = new MongoStore({ mongoose: mongoose });

        const client = new Client({
            authStrategy: new RemoteAuth({ store: store, backupSyncIntervalMs: 300000 }),
            puppeteer: { 
                headless: true, 
                args: ['--no-sandbox', '--disable-setuid-sandbox'] 
            }
        });

        // ÇÖZÜM: requestPairingCode-u 'ready' hadisəsi daxilində və ya 
        // client tam işə düşdükdən sonra çağırırıq
        client.on('ready', async () => {
            console.log('Client hazırdır.');
        });

        await client.initialize();

        // Brauzer nüvəsinin tam yüklənməsi üçün kiçik bir fasilə
        await new Promise(resolve => setTimeout(resolve, 10000));

        const code = await client.requestPairingCode(phone);
        res.json({ code: `SİZİN 8 RƏQƏMLİ KODUNUZ: ${code}` });

    } catch (err) {
        console.error(err);
        res.json({ code: 'Xəta baş verdi: ' + err.message });
    }
});

app.listen(port, () => console.log(`Server ${port} portunda aktivdir.`));
