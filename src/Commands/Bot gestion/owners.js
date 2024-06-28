const { EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

exports.help = {
    name: 'owner',
    aliases: ['addowner'],
    description: "Gérer la liste des propriétaires du bot."
};

exports.run = async (client, message, args) => {
    const userId = message.author.id;
    const buyerId = client.config.clients.buyer;

    
    const buyers = await db.get('buyers') || [];
    if (userId !== buyerId && !buyers.includes(userId)) {
        return message.channel.send("Vous n'avez pas la permission d'utiliser cette commande.");
    }

    const ownersKey = 'owners';

    let owners = await db.get(ownersKey) || [];

    if (!Array.isArray(owners)) {
        owners = [];
    }

    if (args.length === 0) {
        if (owners.length === 0) {
            return message.channel.send("Aucun owner n'est défini pour le bot.");
        }

        const ownerDetails = await Promise.all(owners.map(async ownerId => {
            try {
                const user = await client.users.fetch(ownerId);
                return { username: user.username, id: user.id };
            } catch (error) {
                console.error(`Erreur lors de la récupération de l'utilisateur avec l'ID ${ownerId}:`, error);
                return { username: 'Utilisateur inconnu', id: ownerId };
            }
        }));

        const embed = new EmbedBuilder()
            .setTitle("Owners")
            .setColor(client.config.clients.embedColor)
            .setFooter({ text: client.config.clients.name, iconURL: client.config.clients.logo })
            .setDescription(ownerDetails.map(owner => `\`${owner.username}\` \`(${owner.id})\``).join('\n'));

        return message.channel.send({ embeds: [embed] });
    }

    const ownerId = args[0].replace(/[\\<>@!]/g, '');
    try {
        const owner = await client.users.fetch(ownerId);

        if (!owner) {
            return message.channel.send("Utilisateur non trouvé. Veuillez saisir une ID ou une mention valide.");
        }

        if (owners.includes(ownerId)) {
            return message.channel.send("Cet utilisateur est déjà un owner du bot.");
        }

        owners.push(ownerId);
        await db.set(ownersKey, owners);

        return message.channel.send(`\`${owner.username}\` a été ajouté aux owners du bot.`);
    } catch (error) {
        console.error(`Erreur lors de la récupération de l'utilisateur avec l'ID ${ownerId}:`, error);
        return message.channel.send("Une erreur s'est produite lors de la récupération de l'utilisateur.");
    }
};
