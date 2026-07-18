const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'temizle',
    description: 'Kanaldaki mesajları toplu olarak temizler.',
    async execute(message, args, client) {
        // 1. Yetki Kontrolü: Mesajı yazanın Mesajları Yönet yetkisi var mı?
        if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return message.reply('❌ Kanka bu komutu kullanabilmek için `Mesajları Yönet` yetkisine sahip olman lazım.');
        }

        // 2. Botun Yetki Kontrolü: Botun mesaj silme yetkisi var mı?
        if (!message.guild.members.me.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return message.reply('❌ Kanalı temizleyemiyorum çünkü benim `Mesajları Yönet` yetkim yok kanka.');
        }

        const secim = args[0];

        if (!secim) {
            return message.reply('⚠️ Kanka kaç mesaj sileceğimi yazmalısın veya hepsini silmek için `all` demelisin.\nÖrnek: `pixel-temizle 20` veya `pixel-temizle all`');
        }

        let silinecekMiktar;

        // 3. 'all' Komutunun Kontrolü
        if (secim.toLowerCase() === 'all') {
            silinecekMiktar = 100; // Discord'un tek seferde izin verdiği maksimum sınır
        } else {
            // Eğer sayı girildiyse kontrol edelim
            silinecekMiktar = parseInt(secim, 10);

            if (isNaN(silinecekMiktar)) {
                return message.reply('⚠️ Kanka lütfen geçerli bir sayı gir veya `all` komutunu kullan.');
            }

            if (silinecekMiktar < 1 || silinecekMiktar > 100) {
                return message.reply('⚠️ Tek seferde en az 1, en fazla 100 mesaj silebilirsin kanka.');
            }
        }

        try {
            // Komut mesajının kendisini de silmek için +1 yapmıyoruz çünkü bulkDelete zaten tetiklendiği andaki mesajları kapsar.
            // Ama kendi yazdığımız komut mesajı da dahil gitsin diye kanalı temizliyoruz.
            const silinenler = await message.channel.bulkDelete(silinecekMiktar, true);

            // Başarılı bildirim embed'i
            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setDescription(`🧹 Kanal başarıyla temizlendi! **${silinenler.size}** adet mesaj çöpe fırlatıldı.`)
                .setFooter({ text: `${message.author.tag} tarafından temizlendi.`, iconURL: message.author.displayAvatarURL() });

            const bilgilendirmeMesaji = await message.channel.send({ embeds: [embed] });

            // Bu bilgilendirme mesajı da kanalda kalıp kalabalık yapmasın, 5 saniye sonra kendi kendini yok etsin kanka
            setTimeout(() => {
                bilgilendirmeMesaji.delete().catch(() => {});
            }, 5000);

        } catch (error) {
            console.error('[Temizle Hatası]:', error);
            
            // Discord 14 günden eski mesajların toplu silinmesine izin vermez, bu hatayı yakalayalım
            if (error.message.includes('14 days old')) {
                return message.reply('❌ Discord kuralları gereği 14 günden daha eski mesajları toplu olarak silemiyorum kanka.');
            }
            
            message.reply('❌ Mesajlar silinirken sistemsel bir hata oluştu.');
        }
    }
};