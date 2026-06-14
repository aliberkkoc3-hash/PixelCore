const config = require('../config.json');

module.exports = {
    name: 'kayıt',
    description: 'Bir üyeyi sunucuya kaydeder. Kullanım: pixel!kayıt <@kullanıcı> <İsim> <Yaş>',
    async execute(message, args, client) { // Buraya 'async' eklendi
        // Yetki kontrolü
        if (!message.member.roles.cache.has(config.registrationOfficialRole)) {
            return message.reply('❌ Bu komutu sadece kayıt yetkilileri kullanabilir.');
        }

        // Argüman kontrolü
        if (!args[0] || !args[1] || !args[2]) {
            return message.reply(`❌ Eksik bilgi! Doğru kullanım: \`${config.prefix}kayıt <@kullanıcı> <İsim> <Yaş>\``);
        }

        const targetUser = message.mentions.members.first();
        if (!targetUser) {
            return message.reply('❌ Lütfen kayıt edilecek kişiyi etiketleyin (@Kullanıcı).');
        }

        const name = args[1];
        const age = args[2];

        const registeredRole = message.guild.roles.cache.get(config.registeredRole);
        const unregisteredRole = message.guild.roles.cache.get(config.unregisteredRole);
        const registerChannel = message.guild.channels.cache.get(config.registerChannel);

        if (!registeredRole) {
            return message.reply('❌ Config dosyasında "registeredRole" ID\'si bulunamadı.');
        }

        try {
            // 1. Rolleri düzenle
            if (unregisteredRole && targetUser.roles.cache.has(unregisteredRole.id)) {
                await targetUser.roles.remove(unregisteredRole);
            }
            await targetUser.roles.add(registeredRole);

            // 2. İsim güncelle
            const newName = `${name} | ${age}`;
            await targetUser.setNickname(newName);

            // 3. Geliştirilmiş Embed
            const embed = {
                color: 0x5865F2,
                title: '🎉 Yeni Üye Kaydedildi!',
                description: `Aramıza yeni bir katılımcı daha eklendi.`,
                thumbnail: {
                    url: targetUser.user.displayAvatarURL({ dynamic: true, size: 256 })
                },
                fields: [
                    {
                        name: '👤 Kullanıcı',
                        value: `${targetUser} (\`${targetUser.id}\`)`,
                        inline: true
                    },
                    {
                        name: '📛 Yeni İsim',
                        value: `\`${newName}\``,
                        inline: true
                    },
                    {
                        name: '🆔 Yaş',
                        value: `\`${age}\``,
                        inline: true
                    },
                    {
                        name: '🛡️ Verilen Rol',
                        value: `${registeredRole}`,
                        inline: false
                    },
                    {
                        name: '📝 Kayıt Eden Yetkili',
                        value: `${message.author} (\`${message.author.tag}\`)`,
                        inline: false
                    }
                ],
                footer: {
                    text: `PixelCore Kayıt Sistemi • ${message.guild.name}`,
                    icon_url: message.guild.iconURL({ dynamic: true })
                },
                timestamp: new Date()
            };

            // 4. Log kanalına gönder
            if (registerChannel) {
                registerChannel.send({ embeds: [embed] }).catch(console.error);
            }

            // 5. Komutu yazan kişiye DM veya kısa yanıt
            message.author.send({ embeds: [embed] }).catch(() => {
                message.reply('✅ Kayıt işlemi başarıyla tamamlandı ve loglandı.').then(msg => setTimeout(() => msg.delete(), 5000));
            });

        } catch (error) {
            console.error(error);
            message.reply('❌ Kayıt sırasında bir hata oluştu. Botun yetkilerini ve rol hiyerarşisini kontrol edin.');
        }
    }
};