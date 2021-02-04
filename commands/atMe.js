module.exports = {
    name: "atMe",
    description: "Replies by mentioning the user.",
    args: false,
    hidden: false,
    execute(message){
        const authorId = message.author.id;
        message.channel.send(`<@${authorId}> You called?`);
    }
}