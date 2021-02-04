module.exports = {
    name: "help",
    description: "Displays helpfull commands.",
    args: false,
    hidden: true,
    execute(message, args, client, db, db_commands){
        const Discord = require("discord.js");
        require("dotenv").config();
        const prefix = process.env.PREFIX;

        const embed = new Discord.MessageEmbed()
            .setAuthor(client.user.username, client.user.avatarURL())
            .setColor(0xff0000)
            .setTitle("It's dangerous to go alone! Take this.")
            .setTimestamp()
        client.commands.forEach((command) => {
            console.log(command.description)
            if(!command.hidden){
                embed.addFields({
                    name: `${prefix}${command.name}`,
                    value: command.description,
                    inline: false
                })
            }
        });
        
        message.channel.send(embed)
        return;
    }
}