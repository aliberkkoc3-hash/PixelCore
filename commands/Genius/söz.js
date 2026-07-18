const { EmbedBuilder } = require('discord.js');
const { Client: GeniusClient } = require('genius-lyrics');
const config = require('../../config.json');
const genius = new GeniusClient(config.geniusToken);

module.exports = {
    name: 'söz',
    description: 'Aratılan şarkının sözlerini getirir.',
    async execute(message, args, client) {
        const aramaSorgusu = args.join(' ');
        if (!aramaSorgusu) return message.reply('⚠️ Kanka hangi şarkının sözlerini aratıyoruz? Örnek: `pixel-söz Blinding Lights`');

        const beklemeMesaji = await message.reply('🔍 Şarkı sözleri Genius semalarında aranıyor, az bekle kanka...');

        try {
            const aramalar = await genius.songs.search(aramaSorgusu);
            const sarki = aramalar[0];

            if (!sarki) return beklemeMesaji.edit('❌ Aradığın şarkıyı Genius kayıtlarında bulamadım kanka.');

            let sozler = await sarki.lyrics();
            
            // Eğer sözler Discord'un sınırından uzunsa şık bir şekilde keselim
            let kesilmis = false;
            if (sozler.length > 1500) {
                sozler = sozler.substring(0, 1500) + '...';
                kesilmis = true;
            }

            const embed = new EmbedBuilder()
                .setColor(0xFFFF00) // Genius Sarısı
                .setTitle(`🎵 ${sarki.title}`)
                .setAuthor({ name: sarki.artist.name, iconURL: sarki.artist.image })
                .setDescription(sozler)
                .setThumbnail(sarki.thumbnail)
                .setTimestamp()
                .setFooter({ text: 'PixelCore Müzik', iconURL: client.user.displayAvatarURL() });

            if (kesilmis) {
                embed.addFields({ name: '🔗 Devamı İçin', value: `Şarkı sözlerinin tamamına [Buradan](${sarki.url}) ulaşabilirsin kanka.` });
            }

            beklemeMesaji.edit({ content: null, embeds: [embed] });

        } catch (error) {
            console.error(error);
            beklemeMesaji.edit('❌ Şarkı sözlerini çekerken sistemsel bir hata oluştu kanka.');
        }
    }
};