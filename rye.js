const fs = require("fs");
const Discord = require("discord.js");
const { genRand } = require("./factory.js");

require("dotenv").config();

const client = new Discord.Client();
client.commands = new Discord.Collection();
const commandsPath = "./commands/rye-bot";
const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js")); // Reads command folder for commands files

const prefix = process.env.PREFIX;
const token = process.env.TOKEN;
const ownerID = process.env.BOT_OWNER;
const anon = process.env.ANON;

const kyleVids = [
    process.env.KYLE_VID1,
    process.env.KYLE_VID2,
    process.env.KYLE_VID3,
];
const igor = process.env.IGOR;
const santa = process.env.SANTA;

for (const file of commandFiles) {
    const command = require(`${commandsPath}/${file}`); //Imports the command modules
    client.commands.set(command.name, command);
}

// db setup
const pg = require("pg");
const db = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

let db_commands = {};

function load_db_commands() {
    db.query("SELECT * FROM custom_commands;", (err, res) => {
        if (err) {
            throw err;
        }

        db_commands = {};

        for (let row of res.rows) {
            let command = JSON.parse(JSON.stringify(row));
            db_commands[command.command_name] = command;
        }
    });
}

client.on("ready", async () => {
    db.connect();
    load_db_commands();
    client.user.setPresence({
        status: "dnd",
        activity: {
            name: "anime...",
            type: "WATCHING",
        },
    });
    const user = await client.users.fetch(ownerID);
    user.send("Ready!");
    console.log("Ready!");
});

client.on("message", (message) => {
    // console.log(db_commands)
    // console.log(client.commands)
    if (message.author.bot) {
        return;
    }

    if (message.channel.type == "dm") {
        // if(() => {
        //     const imageTypes = ["png","jpg","jpeg","gif"]
        //     for(let type in imageTypes) {
        //         if(message.content.toLowerCase().startsWith("http") && message.content.toLowerCase().endsWith(type)){
        //             return true
        //         }
        //     }
        //     return false
        // }){
        //     try{
        //         client.channels.cache.get(anon).send({files: [message.content]})
        //     }
        //     catch(e){
        //         message.reply("Invalid image link")
        //     }
        // }
        // else {
        const embed = new Discord.MessageEmbed()
            .setAuthor(
                "Santa (OBAMA)",
                "https://66.media.tumblr.com/a2cac90586272720ca729c4fed330eb2/tumblr_oq81bxB5v11w4ydpno1_400.jpg"
            )
            .setColor(0xff0000)
            .setDescription(message.content);

        client.channels.cache.get(santa).send(embed);
        // client.users.cache.get(ownerID).send(embed)
        // }
        
        return;
    }

    if (
        message.content.toLowerCase().includes("lowerky") ||
        message.content.toLowerCase().includes("lowerkey") ||
        message.content.toLowerCase().includes("low key")
    ) {
        message.delete();
    }

    if (message.author.tag == "Sodene#8026") {
        if (genRand(1, 400) <= 1) {
            message.reply("How are you so handsome?", { files: [igor] });
            return;
        }
    }

    if (message.author.tag == "kylus#2238") {
        // if(message.content.toLowerCase().includes("not behind")){
        //     message.reply("You're behind bro!")
        //     return;
        // }
        if (message.content.toLowerCase().includes("behind")) {
            message.reply("You're not behind!");
            return;
        }
    } else {
        if (message.content.toLowerCase().includes("behind")) {
            if (genRand(1, 100) < 30) {
                if (genRand(1, 100) < 25) {
                    let pick = kyleVids[genRand(0, kyleVids.length - 1)];
                    message.reply({ files: [pick] });
                    return;
                }
                message.reply(
                    "You might be behind, lol <:pepeLaugh:668310019703439381>"
                );
                return;
            } else {
                message.reply("You're not behind <:EZ:756353626032570448>");
                return;
            }
        }
    }

    if (
        message.channel.type != "dm" &&
        message.content
            .toLowerCase()
            .includes(message.guild.roles.everyone.toString())
    ) {
        message.channel.send("<:AngryPing:755244083953270905>");
        const embed = new Discord.MessageEmbed()
            .setAuthor(message.author.username)
            .setTitle(
                "From: " + message.guild.name + "\nIn: #" + message.channel.name
            )
            .setColor(0xff6000)
            .setDescription(message.content)
            .setTimestamp();
        client.users.cache.get(ownerID).send(embed);
        return;
    }

    if (
        !message.content.startsWith(prefix) ||
        message.author.bot ||
        message.content.slice(prefix.length).length === 0
    ) {
        return;
    }
    const args = message.content.slice(prefix.length).split(/ +/);
    const commandName = args.shift();

    console.log(commandName);

    let command;
    load_db_commands();
    // TODO: Make this into a function that loops so we can add aliases
    if (!client.commands.has(commandName)) {
        // Checks for client commands
        if (!(commandName in db_commands)) {
            // Checks for database commands
            return;
        } else {
            args[0] = db_commands[commandName].command_message;
            command = client.commands.get("customMessage");
        }
    } else {
        command = client.commands.get(commandName);
    }

    if (command.args && !args.length) {
        // Command requires args but user did not provide any
        message.reply("There were no arguments provided.");
        return;
    }

    try {
        command.execute(message, args, client, db, db_commands); // Executes command
        load_db_commands();
    } catch (error) {
        console.log(error);
        message.reply("Error with this command.");
    }
});

client.login(token);
