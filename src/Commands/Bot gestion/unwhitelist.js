const { EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

exports.help = {
    name: 'unwhitelist',
    aliases: ['unwl', 'delwl', 'removewl', 'delwhitelist', 'removewhitelist'],
    description: "Supprime un utilisateur de la liste des utilisateurs whitelistés."
};

exports.run = async (client, message, args) => {
    const userId = message.author.id;
    const buyerId = client.config.clients.buyer;
    const ownersKey = 'owners';
    const buyersKey = 'buyers';

    let owners = await db.get(ownersKey) || [];
    let buyers = await db.get(buyersKey) || [];

    if (!Array.isArray(owners)) {
        owners = [];
    }

    if (!Array.isArray(buyers)) {
        buyers = [];
    }

    if (userId !== buyerId && !owners.includes(userId) && !buyers.includes(userId)) {
        return message.channel.send("Vous n'avez pas la permission d'utiliser cette commande.");
    }

    const whitelistKey = 'whitelist';

    if (args.length === 0) {
        return message.channel.send("Saisissez une ID ou une mention.");
    }

    const memberId = args[0].replace(/[\\<>@!]/g, '');
    const member = await client.users.fetch(memberId).catch(() => null);

    if (!member) {
        return message.channel.send("Utilisateur non trouvé. Veuillez saisir une ID ou une mention valide.");
    }

    let whitelist = await db.get(whitelistKey) || [];

    if (!Array.isArray(whitelist)) {
        whitelist = [];
    }

    if (!whitelist.includes(memberId)) {
        return message.channel.send(`\`${member.username}\` n'est pas whitelist.`);
    }

    whitelist = whitelist.filter(id => id !== memberId);
    await db.set(whitelistKey, whitelist);

    return message.channel.send(`\`${member.username}\` a été retiré de la liste de la whitelist.`);
};
