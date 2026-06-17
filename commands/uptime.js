const { EmbedBuilder } = require('discord.js');
const moment = require('moment');

module.exports = {
    name: 'uptime',
    description: 'Botun ne kadar süredir aktif olduğunu yazar!',


    async execute(message, args, client) {
        const tS = (client.uptime / 1000); // tS = totalSeconds
        const d = Math.floor(tS / 86400); // d = days
        const h = Math.floor(tS / 3600) % 24; // h = hours
        const m = Math.floor(tS / 60) % 60; // m = minutes
        const s = Math.floor(tS % 60); // s = seconds

        const uS = `${d} gün, ${h} saat, ${m} dakika, ${s} saniye`; // uS = uptimeString

        const embed = new EmbedBuilder()
             .setTitle('🟢 PixelCore Uptime')
             .setDescription(`**Bot şu anda ${uS} süredir aktif!**`)
             .setColor('#00ff00')
             .setTimestamp()
             .setFooter({ text: `PixelCore | ${moment().format('DD.MM.YYYY HH:mm:ss')}` });

        await message.reply({ embeds: [embed] });
    }
};