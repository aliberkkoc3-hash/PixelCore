const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const express = require('express');
require('dotenv').config();

// 1. Bot İstemcisi (Client) Kurulumu
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();

// 2. Event (Etkinlik) Yükleyici
const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
        const event = require(path.join(eventsPath, file));
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
        } else {
            client.on(event.name, (...args) => event.execute(...args, client));
        }
    }
}

// 3. Komut Yükleyici
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(path.join(commandsPath, file));
        client.commands.set(command.name, command);
    }
}

// 4. Minimalist Web Sunucusu (Render vb. platformlarda aktif tutmak için)
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('💚 PixelCore aktif ve canavar gibi çalışıyor!');
});

app.listen(PORT, () => {
    console.log(`🌐 Web sunucusu ${PORT} portunda aktif.`);
});

// 5. Botu Başlat
client.login(process.env.TOKEN);

// Güvenli Kapatma Sistemi
const stopBot = () => {
    console.log('\n🛑 PixelCore kapatılıyor...');
    client.destroy();
    process.exit(0);
};
process.on('SIGINT', stopBot);
process.on('SIGTERM', stopBot);