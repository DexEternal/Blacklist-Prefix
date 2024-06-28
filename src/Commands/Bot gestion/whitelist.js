const { EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

exports.help = {
    name: 'whitelist',
    aliases: ['wl'],
    description: "Gérer la liste des utilisateurs whitelistés du bot."
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

    if (!owners.includes(userId) && userId !== buyerId && !buyers.includes(userId)) {
        return message.channel.send("Vous n'avez pas la permission d'utiliser cette commande.");
    }

    const whitelistKey = 'whitelist';

    if (args.length === 0) {
        let whitelist = await db.get(whitelistKey) || [];

        if (!Array.isArray(whitelist)) {
            whitelist = [];
        }

        if (whitelist.length === 0) {
            return message.channel.send("Aucun utilisateur n'est whitelisté.");
        }

        const whitelistDetails = await Promise.all(whitelist.map(async memberId => {
            try {
                const user = await client.users.fetch(memberId);
                return { username: user.username, id: user.id };
            } catch (error) {
                console.error(`Erreur lors de la récupération de l'utilisateur avec l'ID ${memberId}:`, error);
                return { username: 'Utilisateur inconnu', id: memberId };
            }
        }));

        const embed = new EmbedBuilder()
            .setTitle("Whitelist")
            .setColor(client.config.clients.embedColor)
            .setFooter({
                text: client.config.clients.name,
                iconURL: client.config.clients.logo
            })
            .setDescription(whitelistDetails.map(member => `\`${member.username}\` \`(${member.id})\``).join('\n'));

        return message.channel.send({ embeds: [embed] });
    }

    const memberId = args[0].replace(/[\\<>@!]/g, '');

    try {
        const member = await client.users.fetch(memberId);

        if (!member) {
            return message.channel.send("Utilisateur non trouvé. Veuillez saisir une ID ou une mention valide.");
        }

        let whitelist = await db.get(whitelistKey) || [];

        if (!Array.isArray(whitelist)) {
            whitelist = [];
        }

        if (whitelist.includes(memberId)) {
            return message.channel.send("Cet utilisateur est déjà whitelist.");
        }

        whitelist.push(memberId);
        await db.set(whitelistKey, whitelist);

        return message.channel.send(`\`${member.username}\` a été ajouté à la liste des utilisateurs whitelist.`);
    } catch (error) {
        console.error(`Erreur lors de la récupération de l'utilisateur avec l'ID ${memberId}:`, error);
        return message.channel.send("Une erreur s'est produite lors de la récupération de l'utilisateur.");
    }
};
