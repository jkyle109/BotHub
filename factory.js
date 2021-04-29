module.exports = {
    genRand: (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    fromBot: (message) => {
        return message.author.bot;
    },

    isDm: (message) => {
        return message.channel.type == "dm";
    },

    startsWith: (message, sub) => {
        return message.content.toLowerCase().startsWith(sub);
    },

    endsWith: (message, sub) => {
        return message.content.toLowerCase().endsWith(sub);
    },

    contains: (message, sub) => {
        return message.content.toLowerCase().includes(sub);
    },

    parseArgs: (message, prefix) => {
        if (message.content.slice(prefix.length).length === 0) {
            return null;
        }
        return message.content.slice(prefix.length).split(/ +/);
    },

    ranks: [
        "radiant",
        "immortal",
        "diamond",
        "platinum",
        "gold",
        "silver",
        "bronze",
        "iron",
        "unranked",
        "unknown",
    ],
};
