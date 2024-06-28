const { readdirSync } = require("fs");

module.exports = (client) => {
    const eventFiles = readdirSync('./src/Events/').filter(f => f.endsWith('.js'));
    let allEventsLoaded = true;
    const successMessages = [];
    const errorMessages = [];

    for (const file of eventFiles) {
        try {
            const event = require(`../../../src/Events/${file}`);
            successMessages.push(`L'event ${file.split('.')[0]} est chargé avec succès !`);
            client.on(event.name, (...args) => event.execute(...args, client));
        } catch (err) {
            allEventsLoaded = false;
            errorMessages.push(`Erreur lors du chargement de l'event ${file.split('.')[0]}: ${err.message}`);
        }
    }

    const eventSubFolders = readdirSync('./src/Events/').filter(f => !f.endsWith('.js'));
    eventSubFolders.forEach(folder => {
        const eventFiles = readdirSync(`./src/Events/${folder}/`).filter(f => f.endsWith('.js'));
        for (const file of eventFiles) {
            try {
                const event = require(`../../../src/Events/${folder}/${file}`);
                successMessages.push(`L'event ${file.split('.')[0]} est chargé avec succès depuis ${folder}`);
                client.on(event.name, (...args) => event.execute(...args, client));
            } catch (err) {
                allEventsLoaded = false;
                errorMessages.push(`Erreur lors du chargement de l'event ${file.split('.')[0]} dans le dossier ${folder}: ${err.message}`);
            }
        }
    });

    if (allEventsLoaded) {
        console.log("Tous les events ont été correctement chargés.");
    } else {
        console.error("Il y a eu des problèmes lors du chargement des events:");
        errorMessages.forEach(msg => console.error(msg));
    }
};