require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Config dosyasını içe aktar
const config = require('./config');

// Bot istemcisini oluştur
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent, // Mesaj içeriğini okumak için ZORUNLU
        GatewayIntentBits.GuildMembers
    ]
});

// İleride commands klasörünü kullanacağımız için collection'ı şimdiden tanımlıyoruz
client.commands = new Collection();
client.config = config; // Config'e her yerden client.config ile erişebiliriz

// --- EVENT YÜKLEME SİSTEMİ ---
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);

    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

// --- BOTU BAŞLAT ---
client.login(process.env.TOKEN).catch(err => {
    console.error("❌ Bot giriş yaparken hata oluştu! Token'ı kontrol et.");
});