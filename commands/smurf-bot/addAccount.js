module.exports = {
    name: "addacc",
    description:
        "Add Account: {username} {login} {password} {rank} [optional: {prestige}]",
    args: true,
    hidden: false,
    execute(message, args, client, db, crypt) {
        const { ranks } = require("../../factory.js");

        if (!(args.length == 5 || args.length == 4)) {
            message.reply("Invalid argument count.");
            return;
        }

        let username = args.shift();
        let login = args.shift();
        let password = args.shift();
        let code = crypt.encrypt(password);
        let rank = args.shift().toLowerCase();
        if (!ranks.includes(rank)) {
            message.reply("Invalid rank.");
            return;
        }

        let prestige = args.length == 1 ? args.shift() : 0;
        if (isNaN(prestige)) {
            message.reply("Invalid prestige value.");
            return;
        }
        try {
            let query = `SELECT * FROM smurf_accounts WHERE username = $$${username}$$`;
            console.log(query);
            db.query(query, (err, res) => {
                if (err) {
                    throw err;
                }
                if (res.rows.length != 0) {
                    // Check if account already exists
                    message.reply(
                        `There is already an account called "${username}".`
                    );
                } else {
                    let query = `INSERT INTO smurf_accounts (username, login,  password, rank, prestige) VALUES ($$${username}$$, $$${login}$$, $$${code}$$, $$${rank}$$, $$${prestige}$$)`;
                    console.log(query);
                    db.query(query, (err, res) => {
                        if (err) {
                            throw err;
                        }
                        message.reply(
                            `\nAccount added!\nUsername: ${username}\nLogin: ${login}\nPassword: ${password}\nRank: ${rank} ${
                                prestige == 0 ? "" : prestige
                            }`
                        );
                    });
                }
            });
        } catch (err) {
            console.log(err);
            message.reply(`Error adding account.`);
        }
        return;
    },
};
