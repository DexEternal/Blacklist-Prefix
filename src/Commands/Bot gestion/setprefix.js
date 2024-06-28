const { QuickDB } = require('quick.db');
const db = new QuickDB();

exports.help = {
    name: 'setprefix',
    aliases: ['prefix'],
    description: "Change le préfixe du bot."
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

    if (args.length === 0) {
        return message.channel.send("Veuillez saisir le nouveau préfixe.");
    }

    const newPrefix = args[0];

    client.config.clients.prefix = newPrefix;
    await db.set('prefix', newPrefix);

    return message.channel.send(`Mon nouveau préfixe est : \`${newPrefix}\`.`);
};
