const config = require('../config.json');

module.exports = {
    name: 'guildMemberAdd',
    once: false,
    execute(member, client) {
        const welcomeChannel = member.guild.channels.cache.get(config.welcomerChannel);
        const logChannel = member.guild.channels.cache.get(config.logChannel);

        if (!welcomeChannel) {
            console.warn('⚠️ Welcomer kanalı bulunamadı.');
            return;
        }

        // Hoşgeldin mesajı
        const embed = {
            color: 0x5865F2,
            title: '🎉 Sunucumuza Hoş Geldin!',
            description: `Merhaba **${member.user.username}**, aramıza katıldığın için mutluyuz! 🚀`,
            thumbnail: {
                url: member.user.displayAvatarURL({ dynamic: true, size: 256 })
            },
            fields: [
                {
                    name: '📋 Kurallar',
                    value: 'Sunucu kurallarını okumayı unutma.',
                    inline: true
                },
                {
                    name: '💬 Sohbet',
                    value: 'Diğer üyelerle tanışmak için sohbet kanallarına göz at.',
                    inline: true
                },
                {
                    name: '🆘 Destek',
                    value: 'Bir sorun mu var? Yetkililere başvur.',
                    inline: true
                },
                {
                    name: '📊 Sunucu Bilgisi',
                    value: `• Toplam Üye: **${member.guild.memberCount}**\n• Katılım: **<t:${Math.floor(Date.now() / 1000)}:R>**`,
                    inline: false
                }
            ],
            footer: {
                text: `PixelCore • ${member.guild.name}`,
                icon_url: client.user.displayAvatarURL()
            },
            timestamp: new Date(),
            author: {
                name: 'Pixel Devs Topluluğu',
                icon_url: member.guild.iconURL({ dynamic: true }) || null
            }
        };

        welcomeChannel.send({ 
            content: `${member.user}`,
            embeds: [embed] 
        }).catch(console.error);

        // Log mesajı (eğer log kanalı varsa)
        if (logChannel) {
            const logEmbed = {
                color: 0x00FF00,
                title: '📥 Yeni Üye Katıldı',
                description: `${member.user} (**${member.user.id}**) sunucuya katıldı.`,
                thumbnail: {
                    url: member.user.displayAvatarURL({ dynamic: true })
                },
                fields: [
                    {
                        name: 'Hesap Oluşturma',
                        value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`,
                        inline: true
                    },
                    {
                        name: 'Sunucu Üye Sayısı',
                        value: `${member.guild.memberCount}`,
                        inline: true
                    }
                ],
                footer: {
                    text: 'PixelCore Log Sistemi'
                },
                timestamp: new Date()
            };

            logChannel.send({ embeds: [logEmbed] }).catch(console.error);
        }
    }
};