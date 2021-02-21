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
const db = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

user_ids = {};

// Gets the users in the database
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

// Adds a user into a the data base and returns the response
add_user = async (id) => {
    // pokedata = JSON.stringify(pokedata);
    let query = `INSERT INTO pokemon_leaderboard ( user_id, poke_ids ) VALUES (${id}, '{}')`;
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

// Gets the pokemon that a user has caught
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

// Updates a user's caught pokemon
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

// Checks if the user is in the database
known_user = async (id) => {
    await get_users();
    if (id in user_ids) {
        return true;
    } else {
        return false;
    }
};

// Adds a pokemon to the users list then saves it to the database
claim_poke = async (user, poke) => {
    await get_users();
    if (!(await known_user(user))) {
        await add_user(user);
    }
    let user_pokes = await get_user_poke(user);
    if (poke.id in user_pokes) {
        user_pokes[poke.id].count += 1;
    } else {
        user_pokes[poke.id] = {
            name: poke.name,
            id: poke.id,
            url: poke.url,
            count: 1,
        };
    }
    await update_user_poke(user, user_pokes);
};

// Clear user pokemon data
wipe_user_poke = async (id) => {
    return await update_user_poke(id, {});
};

// Clear all pokemon data
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

// Makes embeds for the 3 states of pokemon interaction
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
        description: `added ${poke.name} to their Pokédex!`,
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

make_no_poke = (message) => {
    return {
        color: 0x3b4cca,
        title: "Oh no! Looks like you don't have any pokemon.",
        url: "https://pokeapi.co/",
        description: `${message.author}, type '${prefix}poke' to start catching pokémon!`,
        thumbnail: {
            url:
                "https://www.serebii.net/pokemonmasters/syncpairs/icons/professoroak.png",
        },
        footer: {
            text: "| \u200b \u200b Gotta Catch'em All!",
            icon_url:
                "https://upload.wikimedia.org/wikipedia/commons/3/39/Pokeball.PNG",
        },
    };
};

make_list_page = (user, user_pokes, page, p_count, page_number) => {
    let page_data = format_page_data(page, user_pokes);
    let res = {
        color: 0x3b4cca,
        title: "Pokédex",
        url: "https://pokeapi.co/",
        description: `${user}'s, Pokédex!`,
        thumbnail: {
            url:
                "https://www.serebii.net/pokemonmasters/syncpairs/icons/professoroak.png",
        },
        fields: [
            {
                name: "Dex No.",
                value: page_data.id,
                inline: true,
            },
            {
                name: "Name",
                value: page_data.name,
                inline: true,
            },
            {
                name: "Count",
                value: page_data.count,
                inline: true,
            },
        ],
        footer: {
            text: `| Page # ${
                page_number + 1
            } of ${p_count} | \u200b \u200b Gotta Catch'em All!`,
            icon_url:
                "https://upload.wikimedia.org/wikipedia/commons/3/39/Pokeball.PNG",
        },
    };
    return res;
};

format_page_data = (page, user_pokes) => {
    res_id = "```\n";
    res_name = "```\n";
    res_count = "```\n";
    for (id in page) {
        let poke = user_pokes[page[id]];
        res_id += `\n# ${poke.id}`;
        res_name += `\n${poke.name}`;
        res_count += `\n ${poke.count}`;
    }
    return {
        id: res_id + "\n\n```",
        name: res_name + "\n\n```",
        count: res_count + "\n\n```",
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
    // user.send("```\nReady\tto\ncatch\t\tem all!```");
    console.log("Ready to catch em all!");
});

client.on("message", async (message) => {
    if (message.author.bot) {
        return;
    }

    let user = message.author.id;

    if (message.content.toLowerCase().startsWith(`${prefix}poke`)) {
        let poke = await getPoke();

        const reactionEmoji = message.guild.emojis.cache.find(
            (emoji) => emoji.name === "ball"
        );
        const filter = (reaction) => {
            return reaction.emoji.name == reactionEmoji.name;
        };

        let embeds = make_embeds(poke);

        message.channel.send({ embed: embeds.appear }).then(async (sent) => {
            await sent.react(reactionEmoji);
            sent.awaitReactions(filter, {
                max: 1,
                time: 5000,
                errors: ["time"],
            })
                .then(async (col) => {
                    claim_user = col.first().users.cache.last();
                    embeds.entry.description = `${claim_user} ${embeds.entry.description}`;
                    // TODO: Make this more accurate and check to see of the user has encounter this pokemon before!
                    sent.edit({ embed: embeds.entry });
                    await claim_poke(user, poke);
                })
                .catch(() => sent.edit({ embed: embeds.too_slow }));
        });
        return;
    }
    if (message.content.toLowerCase().startsWith(`${prefix}list`)) {
        user = message.author.id;
        if (!(await known_user(user))) {
            message.channel.send({ embed: make_no_poke(message) });
            return;
        } else {
            let user_pokes = await get_user_poke(user);
            if (Object.keys(user_pokes).length === 0) {
                message.channel.send({ embed: make_no_poke(message) });
                return;
            }
            let poke_array = Object.keys(user_pokes);
            let pages = chunk_array(poke_array, 10);

            embed_pages = pages.map((page, i) => {
                return make_list_page(
                    message.author,
                    user_pokes,
                    page,
                    pages.length,
                    i
                );
            });

            let page_number = 0;
            const left = "◀";
            const right = "▶";
            const filter = (reaction, user) => {
                return (
                    [left, right].includes(reaction.emoji.name) &&
                    user.id === message.author.id
                );
            };

            message.channel
                .send({ embed: embed_pages[page_number] })
                .then(async (sent) => {
                    await sent.react(left);
                    await sent.react(right);
                    const page_col = sent.createReactionCollector(filter);
                    page_col.on("collect", async (reaction) => {
                        await reaction.users.remove(message.author.id);
                        let emoji = reaction.emoji.name;
                        if (emoji == left) {
                            if (page_number == 0) return;
                            page_number--;
                            sent.edit({ embed: embed_pages[page_number] });
                        } else {
                            if (page_number == embed_pages.length - 1) return;
                            page_number++;
                            sent.edit({ embed: embed_pages[page_number] });
                        }
                    });
                    sent.awaitReactions(filter, {
                        max: 1,
                        errors: ["time"],
                    });
                });
            console.log(pages);
        }
        // Figure out spliting the
    }
    if (
        message.content.toLowerCase().startsWith(`${prefix}wipe`) &&
        message.author.id == owner
    ) {
        wipe_user_poke(user);
    }
    if (
        message.content.toLowerCase().startsWith(`${prefix}wipe_all`) &&
        message.author.id == owner
    ) {
        wipe_all_poke();
    }
});

fetchPokeData = async (num) => {
    let response = await axios.get(link + num);
    let pokemon = response.data;
    return pokemon;
};

getPoke = async () => {
    let pokemon = await fetchPokeData(genRand(1, 151));
    return {
        name: pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1),
        id: pokemon.id,
        url: pokemon.sprites.front_default,
    };
};

chunk_array = (items, size) => {
    return new Array(Math.ceil(items.length / size))
        .fill()
        .map((_) => items.splice(0, size));
};

client.login(token);
