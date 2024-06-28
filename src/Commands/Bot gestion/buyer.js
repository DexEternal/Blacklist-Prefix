const { EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

exports.help = {
    name: 'buyer',
    aliases: ['addbuyer'],
    description: "Gérer la liste des buyers du bot."
};

exports.run = async (client, message, args) => {
    const userId = message.author.id;
    const buyerId = client.config.clients.buyer;

    if (userId !== buyerId) {
        return message.channel.send("Vous n'avez pas la permission d'utiliser cette commande.");
    }

    const buyersKey = 'buyers';

    let buyers = await db.get(buyersKey) || [];

    if (!Array.isArray(buyers)) {
        buyers = [];
    }

    if (args.length === 0) {
        if (buyers.length === 0) {
            return message.channel.send("Aucun buyer n'est défini pour le bot.");
        }

        const buyerDetails = await Promise.all(buyers.map(async buyerId => {
            try {
                const user = await client.users.fetch(buyerId);
                return { username: user.username, id: user.id };
            } catch (error) {
                console.error(`Erreur lors de la récupération de l'utilisateur avec l'ID ${buyerId}:`, error);
                return { username: 'Utilisateur inconnu', id: buyerId };
            }
        }));

        const embed = new EmbedBuilder()
            .setTitle("Buyers")
            .setColor(client.config.clients.embedColor)
            .setFooter({ text: client.config.clients.name, iconURL: client.config.clients.logo })
            .setDescription(buyerDetails.map(buyer => `\`${buyer.username}\` \`(${buyer.id})\``).join('\n'));

        return message.channel.send({ embeds: [embed] });
    }

    const newBuyerId = args[0].replace(/[\\<>@!]/g, '');
    try {
        const buyer = await client.users.fetch(newBuyerId);

        if (!buyer) {
            return message.channel.send("Utilisateur non trouvé. Veuillez saisir une ID ou une mention valide.");
        }

        if (buyers.includes(newBuyerId)) {
            return message.channel.send("Cet utilisateur est déjà un buyer du bot.");
        }

        buyers.push(newBuyerId);
        await db.set(buyersKey, buyers);

        return message.channel.send(`\`${buyer.username}\` a été ajouté aux buyers du bot.`);
    } catch (error) {
        console.error(`Erreur lors de la récupération de l'utilisateur avec l'ID ${newBuyerId}:`, error);
        return message.channel.send("Une erreur s'est produite lors de la récupération de l'utilisateur.");
    }
};
