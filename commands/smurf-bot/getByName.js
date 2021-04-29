module.exports = {
    name: "listbyname",
    description: "List accounts by username: {username}",
    args: false,
    hidden: false,
    execute(message, args, client, db, crypt) {
        const Discord = require("discord.js");
        let embed = new Discord.MessageEmbed()
            .setColor(0xff0000)
            .setTimestamp();

        if (!(args.length == 1)) {
            message.reply("Invalid argument count.");
            return;
        }

        let username = args.shift().toLowerCase();

        try {
            let query = `SELECT * FROM smurf_accounts WHERE lower(username) LIKE $$%${username}%$$`;
            console.log(query);
            db.query(query, (err, res) => {
                if (err) {
                    throw err;
                }

                if (res.rows.length == 0) {
                    message.reply("There are no accounts that match criteria.");
                    return;
                }

                let accountList = "";
                for (let row of res.rows) {
                    let account = JSON.parse(JSON.stringify(row));
                    accountList += `Username: ${account.username}\nLogin: ${
                        account.login
                    }\nPassword: ${crypt.decrypt(account.password)}\nRank: ${
                        account.rank
                    } ${account.prestige == 0 ? "" : account.prestige}\n\n`;
                }

                embed
                    .addFields({
                        name: `\u200bAccounts containing "${username}":`,
                        value: accountList,
                        inline: true,
                    })
                    .setTimestamp();
                message.channel.send(embed);
            });
        } catch (err) {
            console.log(err);
            message.reply(`Error fetching accounts.`);
        }
        return;
    },
};
