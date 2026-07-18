const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'uptime',
    description: 'Botun ne kadar süredir kesintisiz aktif (açık) olduğunu gösterir.',
    async execute(message, args, client) {
        // Toplam çalışma süresini milisaniye cinsinden alıyoruz
        let totalSeconds = (client.uptime / 1000);
        
        // Gün, saat, dakika ve saniye hesaplamaları
        const days = Math.floor(totalSeconds / 86400);
        totalSeconds %= 86400;
        const hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);

        // Süreyi daha şık bir metne dönüştürelim
        let uptimeString = '';
        if (days > 0) uptimeString += `\`${days}\` gün `;
        if (hours > 0) uptimeString += `\`${hours}\` saat `;
        if (minutes > 0) uptimeString += `\`${minutes}\` dakika `;
        uptimeString += `\`${seconds}\` saniye`;

        const embed = new EmbedBuilder()
            .setColor(0x2ECC71) // Şık bir yeşil tonu
            .setTitle('🟢 PixelCore Çalışma Süresi (Uptime)')
            .setDescription(`Botumuz şu anda kesintisiz olarak ${uptimeString} süredir aktif ve hizmet veriyor kanka!`)
            .addFields(
                { name: '🤖 Bot Durumu', value: 'Aktif / Stabil', inline: true },
                { name: '⚡ Gecikme (Ping)', value: `\`${client.ws.ping}ms\``, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: 'PixelCore İstatistik', iconURL: client.user.displayAvatarURL() });

        message.reply({ embeds: [embed] });
    }
};