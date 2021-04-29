module.exports = {
    name: "help",
    description: "Help command for smurf-bot",
    args: false,
    hidden: false,
    execute(message, args, client, db, crypt) {
        const Discord = require("discord.js");
        require("dotenv").config();
        const prefix = process.env.SMURF_PREFIX;

        const embed = new Discord.MessageEmbed()
            .setAuthor(client.user.username, client.user.avatarURL())
            .setColor(0xff0000)
            .setTitle("It's dangerous to go alone. Take this!")
            .setTimestamp();
        client.commands.forEach((command) => {
            if (!command.hidden) {
                embed.addFields({
                    name: `${prefix}${command.name}`,
                    value: command.description,
                    inline: false,
                });
            }
        });
        message.channel.send(embed);
        return;
    },
};
