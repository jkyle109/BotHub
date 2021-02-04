module.exports = {
    name: "ping",
    description: "Replies with pong.",
    args: false,
    hdden: false,
    execute(message){
        message.channel.send("pong.");
    },
};