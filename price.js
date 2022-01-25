const { default: axios } = require("axios");
const Discord = require("discord.js");
const helpers = require("./lib/helpers");
require("dotenv").config();

const client = new Discord.Client();
const helper = require("./lib/helpers");
const prefix = process.env.PRICE_PREFIX;
const owner = process.env.BOT_OWNER;
const token = process.env.PRICE_TOKEN;
getSaleData = async ({ message, companyData, singleView }) => {
	try {
		if (companyData.name == "uniqlo") {
			message.reply("I'm not parsing that shit fucking site shut up");
			return;
		}
		if (helpers.isInvalidQuery(companyData)) {
			message.reply("No sales active");
			return;
		}
		const res = await axios.get(companyData.queryUrl);

		if (!res) {
			message.reply(
				"No data I forget why this error check here but ima leave it lol.."
			);
			return;
		}
		const readableData = helper.cleanProductView(res.data, companyData);

		let pages = helpers.chunkArray(readableData, singleView ? 1 : 10);
		let embed_pages = pages.map((page, i) => {
			if (page[0].name) {
				return {
					color: 0x3b4cca,
					title: `Clothing for ${companyData.name}`,
					description: "Current Sales",
					thumbnail: {
						url: companyData.imgUrl,
					},
					fields:
						pages.length > 0
							? page
							: { name: "No data", value: "FUCK NO SALE" },
					image: {
						url: singleView ? page[0].imgUrl : "",
					},
					footer: {
						text: `Page ${i + 1} / ${pages.length}`,
					},
				};
			}
		});

		// Bless Jon for pagination
		message.reply({ embed: embed_pages[0] }).then(async (sent) => {
			await helpers.pagination.handlePage(sent, message, embed_pages);
		});
	} catch (err) {
		console.log(err);
		message.channel.send("THE PRICES ARE CORRUPTING ME");
	}
};

client.on("ready", async () => {
	client.user.setPresence({
		status: "online",
		activity: {
			name: "coupons...",
			type: "WATCHING",
		},
	});
	const user = await client.users.fetch(owner);
	user.send("I'm Ready!");
	console.log("I'm Ready!");
});

// Message Event
client.on("message", (message) => {
	if (message.author.bot) {
		return;
	}
	if (message.content.toLowerCase().startsWith(prefix + "sales")) {
		const companyData = helper.findCompany(message.content.toLowerCase());
		if (companyData) {
			getSaleData({ message, companyData });
			return;
		} else {
			message.reply("Store Unknown. Sorry!");
			return;
		}
	} else if (message.content.toLowerCase().startsWith(prefix + "sale")) {
		const companyData = helper.findCompany(message.content.toLowerCase());
		if (companyData) {
			const singleView = true;
			getSaleData({ message, companyData, singleView });
		} else {
			message.reply("Store Unknown. Sorry!");
			return;
		}
		return;
	}
});

client.login(token);
