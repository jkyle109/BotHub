module.exports = {
    name: "ac",
    description: "Adds a custom command.",
    args: true,
    hidden: false,
    execute(message, args, client, db){
        // const commandName = args.shift();
        // const regex = new RegExp(`${commandName} +`);
        // const commandMessage = message.content.slice(process.env.PREFIX.length).split(regex, 2)[1];
        // console.log(commandMessage, commandName)

        require("dotenv").config();
        const prefix = process.env.PREFIX;

        if(!(args.length>=2)){
            message.reply("Not enough arguments provided.");
            return;
        }
        
        const commandName = args.shift();
        let regex = new RegExp(commandName + " (.+)" )      // RegExp to split by first instance of a phrase
        const commandMessage = message.content.slice(process.env.PREFIX.length).split(regex)[1];
        console.log("???? " + commandName + " " + commandMessage)
        const query = `INSERT INTO custom_commands (command_name, command_message) VALUES ($$${commandName}$$, $$${commandMessage}$$)`;
        console.log(query)
        db.query(query, (err, res) => {
            if(err){
                throw err;
            }
            message.reply(`The command "${prefix}${commandName}" has been added.`);
        })
    }
}