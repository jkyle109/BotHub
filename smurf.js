const Discord = require("discord.js");
const Cryptr = require("cryptr");
const fs = require("fs");
const f = require("./factory.js");

// env vars
require("dotenv").config();

const prefix = process.env.SMURF_PREFIX;
const token = process.env.SMURF_TOKEN;
const ownerID = process.env.BOT_OWNER;
const db_url = process.env.DATABASE_URL;
const crypt_key = process.env.SMURF_CRYPT;

const crypt = new Cryptr(crypt_key);

const client = new Discord.Client(); // Create new client instance.
const commandsPath = "./commands/smurf-bot"; // Set path to dynamic command directory

const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith("js")); // Filter files so that it only loads js file names

// dynamic commands setup
client.commands = new Discord.Collection(); // Create a collection for commands
for (file of commandFiles) {
    try {
        const command = require(`${commandsPath}/${file}`);
        client.commands.set(command.name, command); // add commands
    } catch (err) {
        console.log(err);
    }
}

// db setup
const pg = require("pg");
const db = new pg.Client({
    connectionString: db_url,
    ssl: {
        rejectUnauthorized: false,
    },
});

// On start setup
client.on("ready", async () => {
    db.connect().then(() => console.log("db ready"));
    client.user.setPresence({
        status: "dnd",
        activity: {
            name: "VALORANT",
            type: "PLAYING",
        },
    });
    const owner = await client.users.fetch(ownerID);
    owner.send("Smurf bot booted!");
    console.log("Smurf bot booted!");
});

// Listen for new messages
client.on("message", async (message) => {
    if (f.fromBot(message)) return; // return if bot
    if (!f.startsWith(message, prefix)) return; // return if no prefix

    const args = f.parseArgs(message, prefix); // parse args
    if (args == [] || args == null) return; // return if no command

    const calledCommand = args.shift(); // get command name
    if (client.commands.has(calledCommand)) {
        let command = client.commands.get(calledCommand); // get command
        command.execute(message, args, client, db, crypt); // execute command
    }
});

client.login(token);
