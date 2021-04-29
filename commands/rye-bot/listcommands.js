module.exports = {
    name: "lc",
    description: "Lists all custom commands.",
    args: false,
    execute(message, args, client, db, db_commands){
        const Discord = require("discord.js");
        console.log(db_commands)
        let commandList = ""
        let count = 1
        for(command in db_commands){
            commandList = commandList + `${count}) ${command}\n`
            count += 1
        }
        const embed = new Discord.MessageEmbed()
            .setAuthor(client.user.username, client.user.avatarURL())
            .setColor(0xff0000)
            .addFields({
                name: "\u200bCurrent custom commands:",
                value: commandList,
                inline: true
            })
            .setTimestamp()
        message.channel.send(embed)
    }
}