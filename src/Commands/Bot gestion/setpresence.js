const { QuickDB } = require('quick.db');
const { Presence, PresenceStatusData } = require('discord.js');
const db = new QuickDB();

exports.help = {
    name: 'setpresence',
    aliases: ['presence'],
    description: "Définit l'état de présence du bot.",
};

exports.run = async (client, message, args) => {
    const userId = message.author.id;
    const buyerId = client.config.clients.buyer;
    const ownersKey = 'owners';
    const buyersKey = 'buyers';
    const presenceKey = 'lastPresence';

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
        return message.channel.send("Veuillez choisir une présence : `online/idle/dnd/invisible`");
    }

    const presenceChoice = args[0].toLowerCase();

    let statusChoice;

    switch (presenceChoice) {
        case 'online':
            statusChoice = 'online';
            break;
        case 'idle':
            statusChoice = 'idle';
            break;
        case 'dnd':
            statusChoice = 'dnd';
            break;
        case 'invisible':
            statusChoice = 'invisible';
            break;
        default:
            return message.channel.send("Veuillez choisir une présence valide : `online/idle/dnd/invisible`");
    }

    try {
        await client.user.setPresence({ status: statusChoice });
        await db.set(presenceKey, statusChoice);
        message.channel.send(`Présence définie sur \`${presenceChoice}\`.`);
    } catch (error) {
        console.error('Erreur lors du changement de présence :', error);
        message.channel.send("Je n'ai pas pu définir ma présence. Veuillez réessayer.");
    }
};
