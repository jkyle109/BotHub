module.exports = {
    name: "la",
    description: "List all accounts.",
    args: false,
    hidden: false,
    execute(message, args, client, db, crypt) {
        const Discord = require("discord.js");
        try {
            let query = "SELECT * FROM smurf_accounts ORDER BY username ASC;";
            console.log(query);
            db.query(query, (err, res) => {
                if (err) {
                    throw err;
                }

                if (res.rows.length == 0) {
                    message.reply("There are no accounts saved.");
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

                const embed = new Discord.MessageEmbed()
                    .setColor(0xff0000)
                    .addFields({
                        name: "\u200bCurrent accounts:",
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
