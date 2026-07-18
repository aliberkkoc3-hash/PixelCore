const { EmbedBuilder } = require('discord.js');
const { Client: GeniusClient } = require('genius-lyrics');
const config = require('../../config.json');
const genius = new GeniusClient(config.geniusToken);

module.exports = {
    name: 'şarkı-bilgi',
    description: 'Aratılan şarkının detaylı künye ve çıkış bilgilerini getirir.',
    async execute(message, args, client) {
        const aramaSorgusu = args.join(' ');
        if (!aramaSorgusu) return message.reply('⚠️ Hangi şarkının künyesine bakıyoruz? Örnek: `pixel-şarkı-bilgi Starboy`');

        const beklemeMesaji = await message.reply('📊 Şarkı detayları analiz ediliyor...');

        try {
            const aramalar = await genius.songs.search(aramaSorgusu);
            const sarki = aramalar[0];

            if (!sarki) return beklemeMesaji.edit('❌ Şarkı bulunamadı kanka.');

            // Şarkının tüm detaylarını çekelim
            const detaylar = await sarki.featuredArtists; 
            const cikisTarihi = sarki.releaseDate ? new Date(sarki.releaseDate).toLocaleDateString('tr-TR') : 'Bilinmiyor';

            const embed = new EmbedBuilder()
                .setColor(0xFFFF00)
                .setTitle(`📝 Şarkı Künyesi: ${sarki.title}`)
                .setThumbnail(sarki.thumbnail)
                .addFields(
                    { name: '🎤 Sanatçı', value: sarki.artist.name, inline: true },
                    { name: '📅 Çıkış Tarihi', value: cikisTarihi, inline: true },
                    { name: '🔗 Genius Sayfası', value: `[Göz At](${sarki.url})`, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'PixelCore Kültür', iconURL: client.user.displayAvatarURL() });

            beklemeMesaji.edit({ content: null, embeds: [embed] });

        } catch (error) {
            console.error(error);
            beklemeMesaji.edit('❌ Şarkı bilgileri çekilirken bir hata yaşandı.');
        }
    }
};