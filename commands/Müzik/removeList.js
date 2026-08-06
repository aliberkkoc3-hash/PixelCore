const { EmbedBuilder } = require('discord.js');
const { useQueue } = require('discord-player');

module.exports = {
    name: 'removelist',
    description: 'Kuyruktan belirli bir şarkıyı çıkarır veya tüm kuyruğu temizler.',
    async execute(message, args, client) {
        // 1. Kullanıcı ses kanalında mı?
        const sesKanali = message.member.voice.channel;
        if (!sesKanali) {
            return message.reply('⚠️ Kanka kuyruktan şarkı silebilmek için önce bir ses kanalında olmalısın!');
        }

        // 2. Aktif kuyruk kontrolü
        const queue = useQueue(message.guild.id);
        if (!queue || !queue.isPlaying()) {
            return message.reply('⚠️ Şu an aktif çalan bir müzik veya liste yok kanka.');
        }

        // 3. Bot ile kullanıcı aynı kanalda mı?
        const botSesKanali = message.guild.members.me.voice.channel;
        if (botSesKanali && botSesKanali.id !== sesKanali.id) {
            return message.reply('⚠️ Kanka benimle aynı ses kanalında olmalısın!');
        }

        if (!queue.tracks.data.length) {
            return message.reply('⚠️ Kuyrukta çıkarılabilecek şarkı yok kanka (sadece o an çalan şarkı var).');
        }

        const secim = args[0];
        if (!secim) {
            return message.reply('⚠️ Çıkarılacak şarkının sıra numarasını yazmalısın veya hepsini temizlemek için `all` demelisin.\nÖrnek: `pixel-removelist 2` veya `pixel-removelist all`');
        }

        try {
            // ALL MODU: O an çalan hariç tüm kuyruğu boşaltır
            if (secim.toLowerCase() === 'all') {
                const silinenMiktar = queue.tracks.data.length;
                queue.tracks.clear();

                const embed = new EmbedBuilder()
                    .setColor(0xFFA500)
                    .setTitle('🗑️ Kuyruk Temizlendi')
                    .setDescription(`Kuyruktaki **${silinenMiktar}** şarkının tamamı listeden kaldırıldı kanka. (O an çalan şarkı devam ediyor)`)
                    .setTimestamp()
                    .setFooter({ text: 'PixelCore Müzik', iconURL: client.user.displayAvatarURL() });

                return message.reply({ embeds: [embed] });
            }

            // TEKİL SİLME MODU
            const siraNo = parseInt(secim, 10);
            if (isNaN(siraNo) || siraNo < 1 || siraNo > queue.tracks.data.length) {
                return message.reply(`⚠️ Lütfen 1 ile ${queue.tracks.data.length} arasında geçerli bir sıra numarası gir kanka.`);
            }

            // discord-player dizisi 0 tabanlı olduğu için siraNo - 1 yapıyoruz
            const silinenSarki = queue.tracks.data[siraNo - 1];
            queue.node.remove(siraNo - 1);

            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('🗑️ Şarkı Kuyruktan Çıkarıldı')
                .setDescription(`**[${silinenSarki.title}](${silinenSarki.url})** listeden fırlatıldı!`)
                .addFields(
                    { name: '👤 Ekleyen', value: `${silinenSarki.requestedBy}`, inline: true },
                    { name: '🔢 Eski Sırası', value: `\`#${siraNo}\``, inline: true }
                )
                .setThumbnail(silinenSarki.thumbnail)
                .setTimestamp()
                .setFooter({ text: 'PixelCore Müzik', iconURL: client.user.displayAvatarURL() });

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('[RemoveList Komut Hatası]:', error);
            message.reply('❌ Şarkı kuyruktan çıkarılırken bir sorun oluştu.');
        }
    }
};