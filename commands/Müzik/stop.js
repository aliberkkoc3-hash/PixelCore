const { EmbedBuilder } = require('discord.js');
const { useQueue } = require('discord-player');

module.exports = {
    name: 'stop',
    description: 'Çalan müziği durdurur, kuyruğu temizler ve botu ses kanalından çıkartır.',
    async execute(message, args, client) {
        // 1. Kullanıcının ses kanalında olup olmadığını kontrol et
        const sesKanali = message.member.voice.channel;
        if (!sesKanali) {
            return message.reply('⚠️ Kanka müziği durdurabilmem için önce bir ses kanalında olmalısın!');
        }

        // 2. Sunucudaki aktif müzik kuyruğunu çağır
        const queue = useQueue(message.guild.id);

        if (!queue || !queue.isPlaying()) {
            return message.reply('⚠️ Şu anda aktif olarak çalan bir müzik yok kanka.');
        }

        // 3. Bot ile kullanıcının aynı ses kanalında olup olmadığını kontrol et
        const botSesKanali = message.guild.members.me.voice.channel;
        if (botSesKanali && botSesKanali.id !== sesKanali.id) {
            return message.reply('⚠️ Kanka benimle aynı ses kanalında olmalısın!');
        }

        try {
            // Müziği durdur ve kanaldan ayrıl
            queue.delete();

            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('🛑 Müzik Durduruldu')
                .setDescription('Müzik yayını sonlandırıldı, kuyruk temizlendi ve kanaldan ayrıldım kanka.')
                .setTimestamp()
                .setFooter({ text: 'PixelCore Müzik', iconURL: client.user.displayAvatarURL() });

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('[Stop Komut Hatası]:', error);
            message.reply('❌ Müzik durdurulurken bir sorun oluştu.');
        }
    }
};