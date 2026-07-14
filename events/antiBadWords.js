const { PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../config.json');

const badWordsPath = path.join(__dirname, '../data/badWords.json');

// Karakter değiştirme haritası (Kurnazlıkları engellemek için)
const charMap = {
    '1': 'i', 'i': 'i', 'ı': 'i', 'î': 'i',
    '3': 'e', 'ê': 'e',
    '4': 'a', '@': 'a', 'â': 'a',
    '0': 'o', 'ö': 'o', 'ô': 'o',
    'u': 'u', 'ü': 'u', 'û': 'u',
    '5': 's', '$': 's', 'ş': 's',
    'c': 'c', 'ç': 'c',
    'g': 'g', 'ğ': 'g'
};

// Mesajı normalize eden (temizleyen) fonksiyon
function normalizeText(text) {
    let clean = text.toLowerCase();

    // 1. Türkçe karakter ve kurnaz harf değişimlerini yap
    clean = clean.split('').map(char => charMap[char] || char).join('');

    // 2. Harf dışındaki tüm noktalama işaretlerini, boşlukları ve sembolleri kaldır (Örn: "s.i.k.t.i.r" -> "siktir")
    clean = clean.replace(/[^a-z]/g, '');

    // 3. Arka arkaya gelen mükerrer harfleri teke düşür (Örn: "ammmmkkkk" -> "amk")
    clean = clean.replace(/([a-z])\1+/g, '$1');

    return clean;
}

module.exports = {
    name: 'messageCreate',
    once: false,
    async execute(message, client) {
        if (message.author.bot || !message.guild) return;

        // Yetkili veya Bot Sahibi ise filtreye takılmasınlar
        if (message.author.id === config.botOwner || message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return;
        }

        if (fs.existsSync(badWordsPath)) {
            try {
                const { bannedWords } = JSON.parse(fs.readFileSync(badWordsPath, 'utf-8'));
                const messageContent = message.content.toLowerCase();

                // 1. Adım: Direkt kelime bazlı hızlı eşleşme kontrolü
                const hasDirectBadWord = bannedWords.some(word => {
                    const regex = new RegExp(`\\b${word.toLowerCase()}\\b`, 'i');
                    return regex.test(messageContent);
                });

                // 2. Adım: Akıllı normalizasyon ile gizlenmiş küfür kontrolü
                const normalizedMessage = normalizeText(messageContent);
                const hasHiddenBadWord = bannedWords.some(word => {
                    const normalizedWord = normalizeText(word);
                    return normalizedMessage.includes(normalizedWord);
                });

                // Eğer iki kontrolden birine takılırsa mesajı uçur
                if (hasDirectBadWord || hasHiddenBadWord) {
                    await message.delete();
                    const warnMsg = await message.channel.send(`⚠️ <@${message.author.id}>, lütfen kelimelerimize dikkat edelim kankam! (Küfür/Argo yasaktır)`);
                    setTimeout(() => warnMsg.delete().catch(() => {}), 5000);
                }
            } catch (error) {
                console.error('[Anti-BadWords Hata]:', error);
            }
        }
    }
};