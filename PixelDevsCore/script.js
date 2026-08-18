document.addEventListener('DOMContentLoaded', () => {
    const modForm = document.getElementById('modForm');
    const submitBtn = modForm.querySelector('.btn-submit');
    const btnText = submitBtn.querySelector('.btn-text');

    if (localStorage.getItem('pixeldevs_applied') === 'true') {
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.6';
        submitBtn.style.cursor = 'not-allowed';
        btnText.textContent = 'Bu Cihazdan Zaten Başvuru Yapıldı 🚫';
        
        const inputs = modForm.querySelectorAll('input, textarea');
        inputs.forEach(input => input.disabled = true);
        return;
    }

    if ("Notification" in window && Notification.permission !== "granted") {
        Notification.requestPermission();
    }

    modForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const discordUser = document.getElementById('discord').value.trim();
        const age = document.getElementById('age').value.trim();
        const activeTime = document.getElementById('activeTime').value.trim();
        const experience = document.getElementById('experience').value.trim();
        const whyYou = document.getElementById('whyYou').value.trim();

        if (!discordUser || !age || !activeTime || !experience || !whyYou) {
            alert('Lütfen tüm alanları eksiksiz doldur.');
            return;
        }

        submitBtn.classList.add('loading');
        btnText.textContent = 'Sisteme Gönderiliyor...';

        const applicationData = {
            discord: discordUser,
            age: age,
            activeTime: activeTime,
            experience: experience,
            whyYou: whyYou,
            date: new Date().toLocaleString('tr-TR')
        };

        try {
            const response = await fetch('config.json');
            if (!response.ok) throw new Error('config.json okunamadı!');
            
            const config = await response.json();

            // Doğrudan Discord Webhook'una POST isteği atıyoruz
            const webhookResponse = await fetch(config.webhookURL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    embeds: [{
                        title: "🚀 Yeni Yetkili Başvurusu",
                        color: 6577905, 
                        fields: [
                            { name: "👤 Discord Kullanıcı", value: applicationData.discord, inline: true },
                            { name: "🎂 Yaş", value: applicationData.age, inline: true },
                            { name: "⏰ Günlük Aktiflik", value: applicationData.activeTime, inline: false },
                            { name: "💼 Önceki Deneyimler", value: applicationData.experience, inline: false },
                            { name: "⭐ Neden Seni Seçmeliyiz?", value: applicationData.whyYou, inline: false },
                            { name: "🔗 Discord Sunucu Daveti", value: config.discordInvite, inline: false }
                        ],
                        footer: { text: "PixelDevs Ops • " + applicationData.date }
                    }]
                })
            });

            if (!webhookResponse.ok) throw new Error('Discord webhook bağlantı hatası.');

            localStorage.setItem('pixeldevs_applied', 'true');

            submitBtn.classList.remove('loading');
            submitBtn.classList.add('success');
            btnText.textContent = 'Başvuru Onaylandı! ✅';
            
            if ("Notification" in window && Notification.permission === "granted") {
                new Notification("PixelDevs Ops", {
                    body: "🚀 Başvurun onaylandı ve başarıyla iletildi!",
                    icon: "images/icons/icon.png"
                });
            }

            setTimeout(() => {
                const joinDiscord = confirm('🚀 Başvurun başarıyla alındı!\n\nDiscord sunucumuza katılmak ister misin?');
                if (joinDiscord) {
                    window.open(config.discordInvite, '_blank');
                }
                location.reload();
            }, 1000);

        } catch (error) {
            console.error('Hata:', error);
            alert('Bir hata oluştu. Lütfen Live Server kullandığından ve config.json dosyanın doğru olduğundan emin ol.');
            submitBtn.classList.remove('loading');
            btnText.textContent = 'Başvuruyu Gönder';
        }
    });
});