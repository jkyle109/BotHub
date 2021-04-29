module.exports = {
    name: "ss",
    description: "Sets bot status to argument: stream, anime, music, chill.",
    args: true,
    hidden: false,
    execute(message, args, client){
        
        commandName = args[0]
        if(commandName == "stream"){
            client.user.setPresence({
                status: 'online',
                activity: {
                    name: 'Watching Kylus1',
                    type: "STREAMING",
                    url: 'https://www.twitch.tv/kylus1'
                }
            })
            message.channel.send(`Switching to ${commandName} mode! <:pepoHappy:639217941430272031>`)
        }
    
        if(commandName == "anime"){
            client.user.setPresence({
                status: 'dnd',
                activity: {
                    name: "anime...",
                    type: "WATCHING",
                }
            })
            message.channel.send(`Switching to ${commandName} mode! <:pepoHappy:639217941430272031>`)
        }
    
        if(commandName == "music"){
            client.user.setPresence({
                status: 'dnd',
                activity: {
                    name: "weeb music...",
                    type: "LISTENING",
                }
            })
            message.channel.send(`Switching to ${commandName} mode! <:pepoHappy:639217941430272031>`)
        }
    
        if(commandName == "chill"){
            client.user.setPresence({
                status: 'online',
                activity: {
                    name: "Chill",
                    type: "CUSTOM_STATUS",
                }
            })
            message.channel.send(`Switching to ${commandName} mode! <:pepoHappy:639217941430272031>`)
        }
    },
};