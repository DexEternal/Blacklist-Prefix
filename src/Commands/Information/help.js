const { ButtonBuilder, EmbedBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

exports.help = {
    name: 'help',
    description: "Permet de connaître les commandes du bot."
};

exports.run = async (client, message) => {
    const userId = message.author.id;
    const prefix = client.config.clients.prefix;

    const commandsPath = path.join(__dirname, '../../Commands');
    if (!fs.existsSync(commandsPath)) {
        console.error(`Le chemin ${commandsPath} n'existe pas.`);
        return message.channel.send("Le chemin des commandes n'existe pas. Veuillez vérifier la configuration du bot.");
    }

    const commandFolders = fs.readdirSync(commandsPath);
    if (commandFolders.length === 0) {
        return message.channel.send("Aucun dossier de commande trouvé.");
    }

    let currentFolderIndex = 0;

    const generateEmbed = (folder) => {
        const folderPath = path.join(commandsPath, folder);
        const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

        const commandsList = commandFiles.map(file => {
            const command = require(path.join(folderPath, file));
            return `\`${prefix}${command.help.name}\`\n${command.help.description || "Aucune description pour le moment"}\n`;
        }).join('\n');

        return new EmbedBuilder()
            .setFooter({ text: `${client.config.clients.name}・Préfixe actuel : ${prefix}`, iconURL: client.config.clients.logo })
            .setColor(client.config.clients.embedColor)
            .setThumbnail(client.config.clients.thumbnail)
            .setTitle(`**${folder}**`)
            .setDescription(commandsList);
    };

    const generateButtons = () => {
        return new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('prev')
                    .setLabel('◀︎')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('▶︎')
                    .setStyle(ButtonStyle.Primary)
            );
    };

    const embed = generateEmbed(commandFolders[currentFolderIndex]);
    const buttons = generateButtons();

    const sentMessage = await message.channel.send({ embeds: [embed], components: [buttons] });

    const filter = i => ['prev', 'next'].includes(i.customId);

    const collector = sentMessage.createMessageComponentCollector({ filter, time: 600000 });

    collector.on('collect', async interaction => {
        if (interaction.user.id !== userId) {
            await interaction.reply({ content: `Vous ne pouvez pas utiliser ce message. Utilisez \`${prefix}help\`.`, ephemeral: true });
            return;
        }

        if (interaction.customId === 'prev') {
            currentFolderIndex = (currentFolderIndex === 0) ? commandFolders.length - 1 : currentFolderIndex - 1;
        } else if (interaction.customId === 'next') {
            currentFolderIndex = (currentFolderIndex === commandFolders.length - 1) ? 0 : currentFolderIndex + 1;
        }

        const updatedEmbed = generateEmbed(commandFolders[currentFolderIndex]);
        const updatedButtons = generateButtons();

        await interaction.update({ embeds: [updatedEmbed], components: [updatedButtons] });
    });

    collector.on('end', collected => {
        sentMessage.edit({ components: [] });
    });
};