const ReferenceData = require("./Companies.json");
/** Cleans up requested site data into respective schema array
 * @param {Array} productData
 * @returns Mapped data
 */
function cleanProductData(productData, company) {
	let groupData;
	if (company.name === "hm") {
		groupData = formatHMRequest(productData);
	} else if (company.name === "zara") {
		groupData = formatZaraRequest(productData);
	} else if (company.name === "uniqlo") {
		groupData = formatUniqloRequest(productData);
	}
	return groupData;
}

// Zara
function convertZaraPrice(price) {
	const priceLength = Math.ceil(Math.log10(price + 1));
	return Math.floor(price / 10 ** Math.floor(priceLength / 2));
}
function convertZaraImage(defaultMedia) {
	const imagePrefix = "https://static.zara.net/photos//";

	if (defaultMedia) {
		const url = `${imagePrefix}${defaultMedia.path}/w/451/${defaultMedia.name}.jpg?ts=${defaultMedia.timestamp}`;
		return url;
	}
	return;
}
function formatZaraRequest(productData) {
	return productData.productGroups[0].elements[0].commercialComponents.map(
		(product) => {
			const mediaImage = !!product.xmedia ? product.xmedia[0] : null;

			const imageUrl = convertZaraImage(mediaImage);
			return {
				name: product.name,
				value: `~~$${convertZaraPrice(
					product.oldPrice
				)}.00~~ - $${convertZaraPrice(product.price)}.00`,
				imgUrl: imageUrl,
			};
		}
	);
}

// H & M
function formatHMRequest(productData) {
	return productData.products.map((product) => {
		return {
			name: product.title,
			url: product.link,
			imgUrl: `https:${product.image[0].src}`,
			value: `~~${product.price}~~ - ${product.redPrice}`,
			swatches: product.swatches,
			noStock: product.outOfStockText ? true : false,
			description: `Click here ${product.link}`,
		};
	});
}
function getCompanyData(company) {
	const formatMessage = company.split(" ");
	const storeId = formatMessage[1];
	const optionalGender = formatMessage[2];
	const companyData = ReferenceData.companies.find(
		(store) => store.name == storeId
	);
	// Check for optional gender parameter otherwise default to male.
	// Ethic Choice: Male default because I made the script, dont sue me please.
	if (companyData) {
		const formatCompanyData = {
			...companyData,
			queryUrl:
				companyData.queryUrl[optionalGender] || companyData.queryUrl.men,
		};
		return formatCompanyData;
	}
	return null
}

function invalidData(company) {
	return !company.name || !company.queryUrl ? true : false;
}

function chunk_array(items, size) {
	return new Array(Math.ceil(items.length / size))
		.fill()
		.map((_) => items.splice(0, size));
}

async function handlePageChange(sent, message, embed_pages) {
	const left = "◀";
	const right = "▶";
	let page_number = 0;
	const filter = (reaction, user) => {
		return (
			[left, right].includes(reaction.emoji.name) &&
			user.id === message.author.id
		);
	};
	// Begin execution
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
}

module.exports = {
	cleanProductView: cleanProductData,
	findCompany: getCompanyData,
	isInvalidQuery: invalidData,
	chunkArray: chunk_array,
	pagination: {
		handlePage: handlePageChange,
	},
};
