const config = require('../config'); // Config dosyasını çekiyoruz

module.exports = {
    name: 'messageCreate',
    once: false,
    
    execute(message, client) {
        // 1. Bot kendi mesajına veya diğer botlara tepki vermesin
        if (message.author.bot) return;

        // 2. Mesaj, config'deki prefix ile başlıyor mu kontrol et
        if (!message.content.startsWith(config.prefix)) return;

        // 3. Prefix'i mesajdan kes ve geriye kalanı parçalara ayır
        // Örnek: "!ping 123" -> args: ["ping", "123"]
        const args = message.content.slice(config.prefix.length).trim().split(/ +/);
        
        // 4. Komut ismini al ve küçük harfe çevir (büyük/küçük harf duyarlılığını kaldır)
        const commandName = args.shift().toLowerCase();

        // --- ŞİMDİLİK BASİT KOMUTLAR (Commands klasörü boş olduğu için) ---
        
        if (commandName === 'ping') {
            message.reply(`🏓 Pong! Gecikme: ${client.ws.ping}ms`);
        } 
        else if (commandName === 'yardim' || commandName === 'help') {
            message.reply(`📜 **Komutlar:**\n- \`${config.prefix}ping\` : Botun gecikmesini gösterir.\n- \`${config.prefix}yardim\` : Bu mesajı gösterir.`);
        }
        else {
            // Tanınmayan bir komut girildiyse (isteğe bağlı)
            // message.reply(`❌ \`${commandName}\` adında bir komut bulamadım.`);
        }

        // NOT: İleride commands klasörüne komut ekleyince, yukarıdaki if/else bloklarını silip
        // client.commands.get(commandName) mantığına geçeceğiz. Şimdilik bu yapı işini görür!
    }
};