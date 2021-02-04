module.exports = {
    name: "dc",
    description: "Deletes a custom command.",
    args: true,
    hidden: false,
    execute(message, args, client, db, db_commands){
        require("dotenv").config();
        const prefix = process.env.PREFIX;

        if(!(args.length>=1)){
            message.reply("Not enough arguments provided.");
            return;
        }
        
        const commandName = args.shift();
        console.log(db_commands)

        if(!(commandName in db_commands)){  // Checks for database commands
            message.reply(`There is no custom command called "${commandName}".`);
            return;
        } else {
            const query = `DELETE FROM custom_commands WHERE command_name = $$${commandName}$$`;
            console.log(query)
            db.query(query, (err, res) => {
                if(err){
                    throw err;
                }
                message.reply(`The command "${prefix}${commandName}" has been removed.`);
            })
        }
    }
}