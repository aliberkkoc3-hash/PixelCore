const nodemailer = require('nodemailer');
const config = require('../config.json');

module.exports = {
    name: 'guildMemberAdd',
    once: false,
    async execute(member, client) {
        // E-posta ayarları (.env'den çekilecek)
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // Senin Gmail adresin
                pass: process.env.EMAIL_PASS  // Gmail Uygulama Şifresi (Normal şifre değil!)
            }
        });

        // Hazır kayıt linki (ID otomatik doldurulmuş)
        const quickLink = `https://pixelcore-gp6l.onrender.com/admin?pass=${process.env.ADMIN_PASSWORD}&userId=${member.id}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Kendine gönder
            subject: `🔔 Yeni Üye Katıldı: ${member.user.tag}`,
            html: `
                <div style="font-family:sans-serif;background:#1a1a1a;color:white;padding:20px;border-radius:10px;">
                    <h2>🎉 PixelCore - Yeni Üye Bildirimi</h2>
                    <p><strong>Kullanıcı:</strong> ${member.user.tag}</p>
                    <p><strong>ID:</strong> <code>${member.id}</code></p>
                    <p><strong>Katılım:</strong> <t:${Math.floor(member.joinedTimestamp / 1000)}:R></p>
                    <br>
                    <a href="${quickLink}" style="display:inline-block;padding:12px 24px;background:#5865F2;color:white;text-decoration:none;border-radius:5px;font-weight:bold;">
                        👉 Hemen Kayıt Yap
                    </a>
                    <br><br>
                    <small style="color:#888;">Bu linke tıklayarak ID otomatik doldurulmuş admin paneline gidebilirsiniz.</small>
                </div>
            `
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log(`📧 Kayıt bildirimi gönderildi: ${member.user.tag}`);
        } catch (error) {
            console.error('❌ E-posta gönderilemedi:', error.message);
        }
    }
};