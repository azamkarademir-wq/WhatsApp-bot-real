
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const express = require('express');
const qrcode = require('qrcode-terminal');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot Aktif! WhatsApp baglaniyor...');
});

app.listen(PORT, () => {
  console.log('Web server ' + PORT + ' portunda aktif');
});

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info');
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;
    
    if(qr) {
      console.log('QR KOD GELDI - Render Logs kismindan okut');
      qrcode.generate(qr, { small: true });
    }

    if(connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('Baglanti kapandi, yeniden baglaniyor...', shouldReconnect);
      if(shouldReconnect) startBot();
    } else if(connection === 'open') {
      console.log('✅ WhatsApp Baglandi!');
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if(!msg.message) return;
    
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
    const jid = msg.key.remoteJid;

    if(text.toLowerCase() === '.ping') {
      await sock.sendMessage(jid, { text: 'Pong! ✅ Bot aktif ve calisiyor' });
    }
    if(text.toLowerCase() === '.menu') {
      await sock.sendMessage(jid, { text: 'Komutlar:\n.ping - Bot kontrol\n.menu - Bu menu' });
    }
  });
}

startBot();
