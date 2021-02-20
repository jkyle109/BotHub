const Discord = require("discord.js");
require("dotenv").config();
const axios = require("axios");
const { genRand } = require("./factory.js");

const client = new Discord.Client();

const prefix = process.env.POKE_PREFIX;
const token = process.env.POKE_TOKEN;
const owner = process.env.BOT_OWNER;
const link = "https://pokeapi.co/api/v2/pokemon/";

const pg = require("pg");
const { join } = require("../../Sites/drabble/src/wordList.js");
const db = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

user_ids = {};

get_users = async () => {
    let query = "SELECT user_id FROM pokemon_leaderboard";
    console.log(query);
    return await new Promise((resolve, rej) =>
        db.query(query, (err, res) => {
            if (err) {
                rej(err);
            } else {
                user_ids = {};
                for (row of res.rows) {
                    user_ids[row.user_id] = row.user_id;
                }
                resolve(user_ids);
            }
        })
    );
};

add_user = async (id, pokedata) => {
    pokedata = JSON.stringify(pokedata);
    let query = `INSERT INTO pokemon_leaderboard ( user_id, poke_ids ) VALUES (${id}, '${pokedata}')`;
    console.log(query);
    return await new Promise((resolve, rej) =>
        db.query(query, (err, res) => {
            if (err) {
                rej(err);
            } else {
                resolve(res);
            }
        })
    );
};

get_user_poke = async (id) => {
    let query = `SELECT poke_ids FROM pokemon_leaderboard WHERE user_id=${id}`;
    console.log(query);
    return await new Promise((resolve, rej) =>
        db.query(query, (err, res) => {
            if (err) {
                rej(err);
            }
            resolve(res.rows[0].poke_ids);
        })
    );
};

update_user_poke = async (id, pokedata) => {
    pokedata = JSON.stringify(pokedata);
    let query = `UPDATE pokemon_leaderboard SET poke_ids='${pokedata}' WHERE user_id=${id}`;
    console.log(query);
    return await new Promise((resolve, rej) =>
        db.query(query, (err, res) => {
            if (err) {
                rej(err);
            } else {
                resolve(res);
            }
        })
    );
};

claim_poke = async (user, poke) => {
    await get_users();
    if (!(user in user_ids)) {
        let res = await add_user(user, { [poke.id]: 1 });
    } else {
        let user_pokes = await get_user_poke(user);
        if (poke.id in user_pokes) {
            user_pokes[poke.id] += 1;
        } else {
            user_pokes[poke.id] = 1;
        }
        await update_user_poke(user, user_pokes);
    }
};

wipe_user_poke = async (id) => {
    return await update_user_poke(id, {});
};

wipe_all_poke = async () => {
    let query = `UPDATE pokemon_leaderboard SET poke_ids='{}'`;
    console.log(query);
    return await new Promise((resolve, rej) =>
        db.query(query, (err, res) => {
            if (err) {
                rej(err);
            } else {
                resolve(res);
            }
        })
    );
};

make_embeds = (poke) => {
    const appear = {
        color: 0x3b4cca,
        title: `A wild ${poke.name} appared!`,
        url: "https://pokeapi.co/",
        description: "Catch it before it gets a way!",
        thumbnail: {
            url: poke.url,
        },
        footer: {
            text: "| \u200b \u200b Gotta Catch'em All!",
            icon_url:
                "https://upload.wikimedia.org/wikipedia/commons/3/39/Pokeball.PNG",
        },
    };

    const entry = {
        color: 0x3b4cca,
        title: `Nice, you caught ${poke.name}!`,
        url: "https://pokeapi.co/",
        description: `You added ${poke.name} to your Pokédex!`,
        thumbnail: {
            url: poke.url,
        },
        footer: {
            text: "| \u200b \u200b Gotta Catch'em All!",
            icon_url:
                "https://upload.wikimedia.org/wikipedia/commons/3/39/Pokeball.PNG",
        },
    };

    const too_slow = {
        color: 0x3b4cca,
        title: `Oh no, ${poke.name} got away!`,
        url: "https://pokeapi.co/",
        description: "Gotta be quicker that that!",
        thumbnail: {
            url:
                "https://ctcreation.com/wp-content/uploads/2018/06/1024px-Emoji_u1f4a8.svg1_.png",
        },
        footer: {
            text: "| \u200b \u200b Gotta Catch'em All!",
            icon_url:
                "https://upload.wikimedia.org/wikipedia/commons/3/39/Pokeball.PNG",
        },
    };
    return {
        appear: appear,
        entry: entry,
        too_slow: too_slow,
    };
};

client.on("ready", async () => {
    db.connect();

    client.user.setPresence({
        status: "dnd",
        activity: {
            name: "Pokémon",
            type: "WATCHING",
        },
    });

    const user = await client.users.fetch(owner);
    // user.send("Ready to catch em all!");
    console.log("Ready to catch em all!");
});

client.on("message", async (message) => {
    if (message.author.bot) {
        return;
    }

    let user = message.author.id;

    if (message.content.toLowerCase().includes("poke")) {
        let poke = await getPoke();

        const reactionEmoji = message.guild.emojis.cache.find(
            (emoji) => emoji.name === "ball"
        );
        const filter = (reaction) => {
            return reaction.emoji.name == reactionEmoji.name;
        };

        let embeds = make_embeds(poke);

        message.channel.send({ embed: embeds.appear }).then((sent) => {
            sent.react(reactionEmoji);
            sent.awaitReactions(filter, {
                max: 2,
                time: 5000,
                errors: ["time"],
            })
                .then(async () => {
                    sent.edit({ embed: embeds.entry });
                    await claim_poke(user, poke);
                })
                .catch(() => sent.edit({ embed: embeds.too_slow }));
        });
        return;
    }
    if (message.content == "wipe") {
        wipe_user_poke(user);
    }
    if (message.content == "wipe_all") {
        wipe_all_poke();
    }
});

fetchPokeData = async (num) => {
    let response = await axios.get(link + num);
    let pokemon = response.data;
    return pokemon;
};

getPoke = async (num = genRand(1, 151)) => {
    let pokemon = await fetchPokeData(genRand(1, 151));
    return {
        name: pokemon.name,
        id: pokemon.id,
        url: pokemon.sprites.front_default,
    };
};

client.login(token);
