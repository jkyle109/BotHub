module.exports = {
    name: "ping",
    description: "Replies with pong.",
    args: false,
    hdden: false,
    execute(message, args, client) {
        console.log(client.ws.ping);
        message.channel.send(`${client.ws.ping}ms later....pong.`);
    },
};
