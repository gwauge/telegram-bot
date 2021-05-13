import * as dotenv from 'dotenv';
dotenv.config(); // load environment variables

import nfetch from "node-fetch";
import TelegramBot from 'node-telegram-bot-api';
import cron from 'node-cron';

interface CryptoPayload {
	id: string,
	symbol: string,
	name: string,
	image: string,
	current_price: number,
	market_cap: number,
	market_cap_rank: number,
	fully_diluted_valuation: number,
	total_volume: number,
	high_24h: number,
	low_24h: number,
	price_change_24h: number,
	price_change_percentage_24h: number,
	market_cap_change_24h: number,
	market_cap_change_percentage_24h: number,
	circulating_supply: number,
	total_supply: number,
	max_supply: number,
	ath: number,
	ath_change_percentage: number,
	ath_date: string,
	atl: number,
	atl_change_percentage: number,
	atl_date: string,
	roi: string,
	last_updated: string
}

function api<T>(url: string): Promise<T> {
	return nfetch(url).then(res => {
		if (!res.ok) throw new Error(res.statusText);

		return res.json() as Promise<T>;
	})
}

function escapeMessage(msg: string): string {
	const escaped =  msg
		.replace("_", "\\_")
		.replace(".", "\\.")
		.replace("*", "\\*")
		.replace("[", "\\[")
		.replace("`", "\\`");
	
	console.log("escaped:", escaped);
	return escaped
}

const API_URL = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=eur&ids=dogecoin';
const TG_TOKEN: string = process.env["TELEGRAM_KEY"] || "";
const DOGE_BALANCE: number = parseFloat(process.env["DOGE_BALANCE"] || "0")
console.log("TG_TOKEN:", TG_TOKEN);

const bot = new TelegramBot(TG_TOKEN, {polling: true});
const CHAT_ID = 1355830378;

// schedule for 9am every day
cron.schedule("* * * * *", async () => {
	const data = await api<CryptoPayload[]>(API_URL)
	const crypto = data[0];
	
	bot.sendMessage(CHAT_ID, `
		Current _DOGE_ price: *${crypto.current_price.toFixed(4)}* €
		My assets are worth: *${(DOGE_BALANCE * crypto.current_price).toFixed(2)}* €
	`, {parse_mode: "Markdown"})
})

bot.on("message", (msg) => {
	const chatID = msg.chat.id;
	console.log(msg);

	bot.sendMessage(chatID, "you suck");
})