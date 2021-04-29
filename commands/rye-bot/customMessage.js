module.exports = {
    name: "customMessage",
    description: "Prints a custom message or messages.",
    args: true,
    hidden: true,
    execute(message, args){
        console.log(args)
        for(let line of args){
            message.channel.send(line);
        }
    },
};