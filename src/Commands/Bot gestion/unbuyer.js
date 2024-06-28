const { QuickDB } = require('quick.db');
const db = new QuickDB();

exports.help = {
    name: 'unbuyer',
    aliases: ['delbuyer'],
    description: "Supprime un acheteur de la liste des buyers."
};

exports.run = async (client, message, args) => {
    const userId = message.author.id;
    const buyerId = client.config.clients.buyer;

    if (userId !== buyerId) {
        return message.channel.send("Vous n'avez pas la permission d'utiliser cette commande.");
    }

    if (args.length === 0) {
        return message.channel.send("Saisissez une ID ou une mention.");
    }

    const targetId = args[0].replace(/[\\<>@!]/g, '');
    const targetUser = await client.users.fetch(targetId).catch(() => null);

    if (!targetUser) {
        return message.channel.send("Utilisateur non trouvé. Veuillez saisir une ID ou une mention valide.");
    }

    let buyers = await db.get('buyers') || [];

    if (!Array.isArray(buyers)) {
        buyers = [];
    }

    if (!buyers.includes(targetId)) {
        return message.channel.send(`\`${targetUser.username}\` n'est pas un buyer.`);
    }

    buyers = buyers.filter(id => id !== targetId);
    await db.set('buyers', buyers);

    return message.channel.send(`\`${targetUser.username}\` a été supprimé de la liste des buyers.`);
};
