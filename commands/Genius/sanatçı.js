const { EmbedBuilder } = require('discord.js');
const { Client: GeniusClient } = require('genius-lyrics');
const config = require('../../config.json');
const genius = new GeniusClient(config.geniusToken);

module.exports = {
    name: 'sanatçı',
    description: 'Aratılan sanatçı hakkında bilgi ve popüler şarkılarını getirir.',
    async execute(message, args, client) {
        const sanatciAdi = args.join(' ');
        if (!sanatciAdi) return message.reply('⚠️ Hangi sanatçıyı aratıyoruz kanka? Örnek: `pixel-sanatçı Ezhel` veya `pixel-sanatçı Eminem`');

        const beklemeMesaji = await message.reply('🔍 Sanatçı profili taranıyor...');

        try {
            const sanatciAraması = await genius.artists.search(sanatciAdi);
            const sanatci = sanatciAraması[0];

            if (!sanatci) return beklemeMesaji.edit('❌ Bahsettiğin sanatçıyı veritabanında bulamadım.');

            // Sanatçının bazı popüler şarkılarını çekelim
            const sarkilar = await sanatci.songs({ perPage: 5, sort: 'popularity' });
            const sarkiListesi = sarkilar.map((s, index) => `${index + 1}. **${s.title}**`).join('\n') || 'Şarkı bulunamadı.';

            const embed = new EmbedBuilder()
                .setColor(0xFFFF00)
                .setTitle(`👤 Sanatçı Profili: ${sanatci.name}`)
                .setDescription(`[Genius Profiline Git](${sanatci.url})`)
                .setThumbnail(sanatci.image)
                .addFields(
                    { name: '🔥 Öne Çıkan Bazı Şarkıları', value: sarkiListesi }
                )
                .setTimestamp()
                .setFooter({ text: 'PixelCore Sanat', iconURL: client.user.displayAvatarURL() });

            beklemeMesaji.edit({ content: null, embeds: [embed] });

        } catch (error) {
            console.error(error);
            beklemeMesaji.edit('❌ Sanatçı bilgileri çekilirken bir sorun oluştu.');
        }
    }
};