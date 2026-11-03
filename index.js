const {default:makeWASocket,useMultiFileAuthState}=require('@whiskeysockets/baileys');const qrcode=require('qrcode-terminal');const express=require('express');const P=require('pino');const app=express();app.get('/',(req,res)=>res.send('Bot calisiyor'));app.listen(process.env.PORT||3000,()=>console.log('Site Live'));async function start(){console.log('Bot baslatiliyor...');const {state,saveCreds}=await useMultiFileAuthState('auth');const sock=makeWASocket({auth:state,logger:P({level:'silent'})});sock.ev.on('creds.update',saveCreds);sock.ev.on('connection.update',u=>{if(u.qr){console.log('QR GELDI');qrcode.generate(u.qr,{small:true})};if(u.connection==='open')console.log('BAGLANDI')});}start();const makeWASocket = require('@whiskeysockets/baileys').default
const { useMultiFileAuthState } = require('@whiskeysockets/baileys')
const express = require('express')
const qrcode = require('qrcode-terminal')
const P = require('pino')
const app = express()

app.get('/', (req,res) => res.send('Bot calisiyor - Logs a bak QR icin'))
app.listen(process.env.PORT || 3000, () => console.log('Site Live'))

async function start() {
  console.log('Bot baslatiliyor...')
  const { state, saveCreds } = await useMultiFileAuthState('auth_info')
  const sock = makeWASocket({ auth: state, logger: P({level:'silent'}), printQRInTerminal: false })
  sock.ev.on('creds.update', saveCreds)
  sock.ev.on('connection.update', (u) => {
    const { connection, lastDisconnect, qr } = u
    if(qr){
      console.log('================ QR KODU ================')
      qrcode.generate(qr, {small:true})
      console.log('YUKARIDAKI QR I WHATSAPP ILE OKUT!')
    }
    if(connection === 'open') console.log('!!! WHATSAPP BAGLANDI !!!')
    if(connection === 'close') console.log('Baglanti kapandi, yeniden baslatiliyor...')
  })
  sock.ev.on('messages.upsert', async ({messages}) => {
    const msg = messages[0]
    if(!msg.message || msg.key.fromMe) return
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || ''
    const from = msg.key.remoteJid
    console.log('Mesaj geldi:', text)
    if(text.toLowerCase() === '.tagsil'){
      try{
        const group = await sock.groupMetadata(from)
        const members = group.participants.map(p => p.id)
        let txt = ''
        for(let m of members) txt += `@${m.split('@')[0]} `
        await sock.sendMessage(from, { text: txt, mentions: members })
      }catch(e){ console.log('Hata:', e) }
    }
  })
}
start().catch(e => console.log('Bot hata:', e))
