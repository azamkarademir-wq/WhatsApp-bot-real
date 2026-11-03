const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const express = require('express')
const app = express()
const fs = require('fs')
const P = require('pino')

app.get('/', (req,res) => res.send('Bot Live - QR icin Logs a bak'))

app.listen(process.env.PORT || 3000, () => console.log('Site Live'))

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth')
  const sock = makeWASocket({ auth: state, logger: P({level:'silent'}) })
  sock.ev.on('creds.update', saveCreds)
  sock.ev.on('connection.update', async (u) => {
    if(u.qr) console.log('QR KODU ASAGIDA - TELEFONDAN OKUT:', u.qr)
    if(u.connection === 'open') console.log('WHATSAPP BAGLANDI!')
  })
  sock.ev.on('messages.upsert', async m => {
    const msg = m.messages[0]
    if(!msg.message || msg.key.fromMe) return
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || ''
    const from = msg.key.remoteJid
    if(text.toLowerCase() === '.tagsil'){
      const group = await sock.groupMetadata(from)
      const members = group.participants.map(p => p.id)
      let txt = 'Herkes:\n'
      for(let mem of members) txt += `@${mem.split('@')[0]} `
      await sock.sendMessage(from, { text: txt, mentions: members })
    }
  })
}
startBot()
