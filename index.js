const crypto = require('crypto');
global.crypto = crypto;

const express = require('express');
const mongoose = require('mongoose');
const { Client, RemoteAuth } = require('whatsapp-web.js');
const { MongoStore } = require('wwebjs-mongo');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const MONGODB_URI =
    'mongodb+srv://Ryhavean:raven123_@cluster0.6yxmbht.mongodb.net/?appName=Cluster0';

let client;
let clientReady = false;

async function startBot() {
    try {
        await mongoose.connect(MONGODB_URI);

        const store = new MongoStore({
            mongoose: mongoose
        });

        client = new Client({
            authStrategy: new RemoteAuth({
                store: store,
                backupSyncIntervalMs: 300000
            }),
            puppeteer: {
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage'
                ]
            }
        });

        client.on('ready', () => {
            console.log('WhatsApp hazırdır');
            clientReady = true;
        });

        client.on('authenticated', () => {
            console.log('Authenticated');
        });

        client.on('auth_failure', (msg) => {
            console.log('Auth Failure:', msg);
        });

        client.on('disconnected', (reason) => {
            console.log('Disconnected:', reason);
            clientReady = false;
        });

        await client.initialize();
    } catch (err) {
        console.error(err);
    }
}

startBot();

app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>WhatsApp Pair Code</title>
    </head>
    <body style="text-align:center;margin-top:50px;">
        <h1>WhatsApp Bot Panel</h1>

        <input
            id="phone"
            placeholder="994501234567"
            style="padding:10px;width:250px;"
        >

        <button onclick="getCode()">
            Kodu Al
        </button>

        <h2 id="result"></h2>

        <script>
            async function getCode() {
                const phone = document.getElementById('phone').value;

                document.getElementById('result').innerText =
                    'Kod alınır...';

                try {
                    const response = await fetch('/code', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            phone: phone
                        })
                    });

                    const data = await response.json();

                    document.getElementById('result').innerText =
                        data.code;
                } catch (err) {
                    document.getElementById('result').innerText =
                        err.message;
                }
            }
        </script>
    </body>
    </html>
    `);
});

app.post('/code', async (req, res) => {
    try {
        const phone = String(req.body.phone || '')
            .replace(/\D/g, '');

        if (!phone) {
            return res.json({
                code: 'Nömrə daxil edilməyib'
            });
        }

        if (!client) {
            return res.json({
                code: 'WhatsApp client başlamayıb'
            });
        }

        let wait = 0;

        while (!clientReady && wait < 30000) {
            await new Promise(resolve =>
                setTimeout(resolve, 1000)
            );
            wait += 1000;
        }

        if (!clientReady) {
            return res.json({
                code: 'WhatsApp hazır deyil'
            });
        }

        const pairingCode =
            await client.requestPairingCode(phone);

        return res.json({
            code: pairingCode
        });

    } catch (err) {
        console.error(err);

        return res.json({
            code: 'Xəta: ' + err.message
        });
    }
});

app.listen(PORT, () => {
    console.log('Server başladı: ' + PORT);
});
