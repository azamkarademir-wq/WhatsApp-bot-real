const express=require('express');const app=express();const PORT=process.env.PORT||10000;app.get('/',(req,res)=>{res.send('BOT AKTIF')});app.listen(PORT,()=>{console.log('BOT AKTIF')});
