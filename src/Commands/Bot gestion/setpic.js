const { QuickDB } = require('quick.db');
const db = new QuickDB();
const { EmbedBuilder } = require('discord.js');

exports.help = {
    name: 'setpic',
    description: "Change la photo de profil du bot.",
    aliases: ['setpp', 'setpdp']
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

    if (message.attachments.size === 0) {
        return message.channel.send("Veuillez saisir ma nouvelle photo de profil en joignant une image.");
    }

    const imageUrl = message.attachments.first().url;

    try {
        await client.user.setAvatar(imageUrl);
        message.channel.send("Ma photo de profil a été changée avec succès.");
    } catch (error) {
        console.error('Erreur lors du changement de photo de profil:', error);
        message.channel.send("Je n'ai pas pu changer ma photo de profil. Assurez-vous que l'image est accessible.");
    }
};
