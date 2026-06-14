const config = require('../config.json');

module.exports = {
    name: 'kayıt',
    description: 'Bir üyeyi sunucuya kaydeder. Kullanım: pixel!kayıt <@kullanıcı> <İsim> <Yaş>',
    async execute(message, args, client) {
        // 1. YETKİ KONTROLÜ
        const isOwner = String(message.author.id) === String(config.ownerId);
        const hasRole = message.member.roles.cache.some(
            role => String(role.id) === String(config.registrationOfficialRole)
        );

        if (!isOwner && !hasRole) {
            return message.reply('❌ Bu komutu sadece kayıt yetkilileri veya sunucu sahibi kullanabilir.')
                .then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
        }

        // 2. ARGÜMAN KONTROLÜ
        if (!args[0] || !args[1] || !args[2]) {
            return message.reply(`❌ Eksik bilgi! Doğru kullanım: \`${config.prefix}kayıt <@kullanıcı> <İsim> <Yaş>\``)
                .then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
        }

        const targetUser = message.mentions.members.first();
        if (!targetUser) {
            return message.reply('❌ Lütfen kayıt edilecek kişiyi etiketleyin (@Kullanıcı).')
                .then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
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
            // 3. ROLLERİ DÜZENLE
            if (unregisteredRole && targetUser.roles.cache.has(unregisteredRole.id)) {
                await targetUser.roles.remove(unregisteredRole);
            }
            await targetUser.roles.add(registeredRole);

            // 4. İSİM GÜNCELLE
            const newName = `${name} | ${age}`;
            await targetUser.setNickname(newName);

            // 5. EMBED OLUŞTUR
            const embed = {
                color: 0x5865F2,
                title: '🎉 Yeni Üye Kaydedildi!',
                description: 'Aramıza yeni bir katılımcı daha eklendi.',
                thumbnail: {
                    url: targetUser.user.displayAvatarURL({ dynamic: true, size: 256 })
                },
                fields: [
                    { name: '👤 Kullanıcı', value: `${targetUser} (\`${targetUser.id}\`)`, inline: true },
                    { name: ' Yeni İsim', value: `\`${newName}\``, inline: true },
                    { name: '🆔 Yaş', value: `\`${age}\``, inline: true },
                    { name: '️ Verilen Rol', value: `${registeredRole}`, inline: false },
                    { name: ' Kayıt Eden', value: `${message.author} (\`${message.author.tag}\`)`, inline: false }
                ],
                footer: { text: `PixelCore • ${message.guild.name}`, icon_url: message.guild.iconURL({ dynamic: true }) },
                timestamp: new Date()
            };

            // 6. LOG KANALINA GÖNDER
            if (registerChannel) {
                registerChannel.send({ embeds: [embed] }).catch(console.error);
            }

            // 7. BAŞARI MESAJI VE OTOMATİK SİLME (GÜVENLİ)
            message.reply('✅ Kayıt işlemi başarıyla tamamlandı!')
                .then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));

        } catch (error) {
            console.error(error);
            message.reply('❌ Kayıt sırasında bir hata oluştu. Botun yetkilerini kontrol edin.')
                .then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
        }
    }
};