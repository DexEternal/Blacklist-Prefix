const { QuickDB } = require('quick.db');
const db = new QuickDB();

exports.help = {
    name: 'emoji',
    aliases: ['create'],
    description: "Crée des émojis sur le serveur."
};

exports.run = async (client, message, args) => {
    const userId = message.author.id;
    const buyer = client.config.clients.buyer;

    let owners = await db.get('owners') || [];
    let buyers = await db.get('buyers') || [];

    if (!owners.includes(userId) && !buyers.includes(userId) && userId !== buyer) {
        return message.channel.send("Vous n'avez pas la permission d'utiliser cette commande.");
    }

    if (message.attachments.size > 0) {
        const image = message.attachments.first();
        const emojiName = args[0];

        if (!emojiName) {
            return message.channel.send("Veuillez saisir un nom pour l'émoji.");
        }

        try {
            const emoji = await message.guild.emojis.create({
                attachment: image.url,
                name: emojiName
            });
            return message.channel.send(`L'émoji ${emoji} a été créé avec succès.`);
        } catch (error) {
            console.error(`Erreur lors de la création de l'émoji ${emojiName}:`, error);
            return message.channel.send(`Erreur lors de la création de l'émoji. Veuillez réessayer.`);
        }
    }

    if (!args.length) {
        return message.channel.send("Veuillez saisir les émojis à créer.");
    }

    const emojiList = args.join(' ').match(/<a?:\w+:\d+>/g);
    if (!emojiList || emojiList.length === 0) {
        return message.channel.send("Aucun émoji valide trouvé. Veuillez saisir des émojis à créer.");
    }

    let createdEmojiCount = 0;

    for (const emoji of emojiList) {
        const emojiNameMatch = emoji.match(/:(\w+):/);
        const emojiIdMatch = emoji.match(/:(\d+)>/);

        if (emojiNameMatch && emojiIdMatch) {
            const emojiName = emojiNameMatch[1];
            const emojiId = emojiIdMatch[1];
            const isAnimated = emoji.startsWith('<a:');
            const emojiUrl = `https://cdn.discordapp.com/emojis/${emojiId}.${isAnimated ? 'gif' : 'png'}`;

            try {
                await message.guild.emojis.create({
                    attachment: emojiUrl,
                    name: emojiName
                });
                createdEmojiCount++;
            } catch (error) {
                console.error(`Erreur lors de la création de l'émoji ${emojiName}:`, error);
            }
        }
    }

    message.channel.send(`\`${createdEmojiCount}\` émoji(s) ont été créés.`);
};
