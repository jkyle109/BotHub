module.exports = {
    name: "remacc",
    description: "Remove Account: {username}",
    args: true,
    hidden: false,
    execute(message, args, client, db, crypt) {
        if (!(args.length == 1)) {
            message.reply("Invalid argument count.");
            return;
        }

        let username = args.shift().toLowerCase();

        try {
            let query = `SELECT * FROM smurf_accounts WHERE lower(username) = $$${username.toLowerCase()}$$`;
            console.log(query);
            db.query(query, (err, res) => {
                if (err) {
                    throw err;
                }
                if (res.rows.length == 0) {
                    // Check if account already exists
                    message.reply(`There is no account called "${username}".`);
                } else {
                    let query = `DELETE FROM smurf_accounts WHERE lower(username) = $$${username.toLowerCase()}$$`;
                    console.log(query);
                    db.query(query, (err, res) => {
                        if (err) {
                            throw err;
                        }
                        message.reply(`Account "${username}" was removed.`);
                    });
                }
            });
        } catch (err) {
            console.log(err);
            message.reply(`Error removing account.`);
        }
        return;
    },
};
