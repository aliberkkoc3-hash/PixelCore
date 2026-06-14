const config = require('../config.json');

module.exports = {
    name: 'temizle',
    description: 'Kanaldaki mesajları temizler. Kullanım: pixel!temizle <All veya 1-200>',
    execute(message, args, client) {
        // Yetki kontrolü: ownerId VEYA cleaningStaffRole
        const isOwner = message.author.id === config.ownerId;
        const hasRole = message.member.roles.cache.has(config.cleaningStaffRole);

        if (!isOwner && !hasRole) {
            return message.reply('❌ Bu komutu sadece temizlik yetkilileri veya sunucu sahibi kullanabilir.');
        }

        if (!args[0]) {
            return message.reply(`❌ Lütfen bir miktar belirtin! Örnek: \`${config.prefix}temizle 50\` veya \`${config.prefix}temizle all\``);
        }

        const amountArg = args[0].toLowerCase();
        let amount;

        if (amountArg === 'all') {
            amount = 100;
        } else {
            amount = parseInt(amountArg);
            if (isNaN(amount) || amount < 1 || amount > 200) {
                return message.reply('❌ Lütfen 1 ile 200 arasında bir sayı girin.');
            }
        }

        const targetChannel = message.channel;
        const logChannel = message.guild.channels.cache.get(config.logChannel);

        message.channel.bulkDelete(amount, true).then(deleted => {
            const embed = {
                color: 0xFF4B2B,
                title: '🧹 Kanal Temizlendi',
                description: `**${targetChannel.name}** kanalında **${deleted.size}** adet mesaj silindi.`,
                fields: [
                    {
                        name: 'Yetkili',
                        value: `${message.author} (\`${message.author.tag}\`)`,
                        inline: true
                    },
                    {
                        name: 'Kanal',
                        value: `${targetChannel}`,
                        inline: true
                    }
                ],
                footer: {
                    text: 'PixelCore Log Sistemi',
                    icon_url: client.user.displayAvatarURL()
                },
                timestamp: new Date()
            };

            // Log kanalına gönder
            if (logChannel) {
                logChannel.send({ embeds: [embed] }).catch(console.error);
            }

            // Komutun yazıldığı yere kısa bilgi ver ve sil
            message.channel.send(`✅ ${deleted.size} mesaj temizlendi.`).then(msg => {
                setTimeout(() => msg.delete(), 3000);
            });

        }).catch(err => {
            console.error(err);
            message.reply('❌ Mesajlar silinirken bir hata oluştu. (14 günden eski mesajlar silinemez).');
        });
    }
};