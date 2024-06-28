const { QuickDB } = require('quick.db');
const db = new QuickDB();

exports.help = {
    name: 'setname',
    description: "Change le nom du bot.",
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
        return message.channel.send("Veuillez envoyer mon nouveau nom.");
    }

    const newName = args.join(" ");

    try {
        await client.user.setUsername(newName);
        message.channel.send(`Mon nom a été changé en \`${newName}\`.`);
    } catch (error) {
        console.error('Erreur lors du changement de nom du bot:', error);
        message.channel.send("Je n'ai pas pu changer mon nom. Assurez-vous que le nom est valide et que vous ne changez pas trop souvent de nom.");
    }
};
