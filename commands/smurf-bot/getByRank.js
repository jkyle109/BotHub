module.exports = {
    name: "listbyrank",
    description: "List accounts by rank: [optional: {rank}]",
    args: false,
    hidden: false,
    execute(message, args, client, db, crypt) {
        const Discord = require("discord.js");
        const { ranks } = require("../../factory.js");
        let embed = new Discord.MessageEmbed()
            .setTitle("Current Accounts")
            .setColor(0xff0000)
            .setTimestamp();

        if (!(args.length == 1 || args.length == 0)) {
            message.reply("Invalid argument count.");
            return;
        }

        let rank = args.length == 1 ? args.shift().toLowerCase() : "";

        try {
            let query = `SELECT * FROM smurf_accounts WHERE lower(rank) LIKE $$%${rank}%$$;`;
            console.log(query);
            db.query(query, (err, res) => {
                if (err) {
                    throw err;
                }
                if (res.rows.length == 0) {
                    message.reply("There are no accounts that match criteria.");
                    return;
                }

                let accountList = [];
                for (r of ranks) {
                    accountList.push("");
                }

                for (let row of res.rows) {
                    let account = JSON.parse(JSON.stringify(row));
                    accountList[ranks.indexOf(account.rank)] += `Username: ${
                        account.username
                    }\nLogin: ${account.login}\nPassword: ${crypt.decrypt(
                        account.password
                    )}\nRank: ${account.rank} ${
                        account.prestige == 0 ? "" : account.prestige
                    }\n\n`;
                }
                for (r in ranks) {
                    if (accountList[r] != "") {
                        embed.addFields({
                            name: `${ranks[r].toUpperCase()}`,
                            value: accountList[r],
                            inline: false,
                        });
                    }
                }
                embed.setTimestamp();
                message.channel.send(embed);
            });
        } catch (err) {
            console.log(err);
            message.reply(`Error fetching accounts.`);
        }
        return;
    },
};
