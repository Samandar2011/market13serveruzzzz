// RADMIR MARKET — to'liq server
// Bu bitta fayl 2 ta ishni qiladi:
//  1) HTML sahifani (public/index.html) internetga chiqaradi
//  2) Mahsulotlar/buyurtmalar/bloklanganlar ro'yxatini data.json faylida doimiy saqlaydi
//  3) Telegram botini ishga tushiradi (buyurtmalarni adminga forward qiladi)

const express = require("express");
const fs = require("fs");
const path = require("path");
const TelegramBot = require("node-telegram-bot-api");

// ====== SOZLAMALAR ======
// Bularni to'g'ridan-to'g'ri shu yerga yozishingiz ham mumkin,
// lekin Railway/Render'da "Environment Variables" orqali berish xavfsizroq.
const BOT_TOKEN = process.env.BOT_TOKEN || "8731416629:AAG6J_4ryTEhy6yc_dTo28LoPLxSE2-vTG8";
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || 7602467398; // /myid orqali olib, shu yerga yozasiz
const PORT = process.env.PORT || 3000;
// =========================

const DATA_FILE = path.join(__dirname, "data.json");

const SEED_PRODUCTS = [
  { id:"fsb",  name:"FSB",         icon:"🛡️", price:700000, desc:"Davlat xavfsizlik tashkilotiga kirish xizmati.", cat:"xizmat", seller:"Radmir RP", tg:"uzbekovichh", pinned:true, blocked:false, createdAt:1 },
  { id:"mvd",  name:"MVD",         icon:"🚔", price:500000, desc:"Ichki ishlar tashkilotiga kirish xizmati.",       cat:"xizmat", seller:"Radmir RP", tg:"uzbekovichh", pinned:true, blocked:false, createdAt:2 },
  { id:"ritm", name:"TRK RITM",    icon:"📡", price:350000, desc:"Media tashkilotiga kirish xizmati.",              cat:"xizmat", seller:"Radmir RP", tg:"uzbekovichh", pinned:true, blocked:false, createdAt:3 },
  { id:"hosp", name:"Bo'lnitsa",   icon:"⚕️", price:300000, desc:"Tibbiyot tashkilotiga kirish xizmati.",           cat:"xizmat", seller:"Radmir RP", tg:"uzbekovichh", pinned:true, blocked:false, createdAt:4 },
  { id:"fsin", name:"FSIN",        icon:"🔑", price:500000, desc:"Jazoni ijro etish tashkilotiga kirish xizmati.",  cat:"xizmat", seller:"Radmir RP", tg:"uzbekovichh", pinned:true, blocked:false, createdAt:5 },
  { id:"gov",  name:"Pravitelstvo",icon:"🏛️", price:500000, desc:"Hukumat tashkilotiga kirish xizmati.",           cat:"xizmat", seller:"Radmir RP", tg:"uzbekovichh", pinned:true, blocked:false, createdAt:6 },
  { id:"army", name:"Armiya",      icon:"⭐", price:300000, desc:"Armiya tashkilotiga kirish xizmati.",             cat:"xizmat", seller:"Radmir RP", tg:"uzbekovichh", pinned:true, blocked:false, createdAt:7 },
];

// ---------- oddiy fayl-baza ----------
function loadData(){
  if (!fs.existsSync(DATA_FILE)){
    const initial = { products: SEED_PRODUCTS, orders: [], blocked: [] };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  try{
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  }catch(e){
    console.error("data.json o'qishda xatolik, qaytadan yaratildi", e);
    const initial = { products: SEED_PRODUCTS, orders: [], blocked: [] };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
}
function saveData(data){
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

let db = loadData();

// ---------- Express API ----------
const app = express();
app.use(express.json());
app.use(express.static(__dirname));

app.get("/api/products", (req, res) => res.json({ value: db.products }));
app.post("/api/products", (req, res) => {
  db.products = req.body.value || [];
  saveData(db);
  res.json({ ok: true });
});

app.get("/api/orders", (req, res) => res.json({ value: db.orders }));
app.post("/api/orders", (req, res) => {
  const prevCount = db.orders.length;
  db.orders = req.body.value || [];
  saveData(db);

  // Yangi buyurtma qo'shilgan bo'lsa, adminga Telegram orqali xabar yuboramiz
  if (db.orders.length > prevCount && ADMIN_CHAT_ID){
    const newOrder = db.orders[db.orders.length - 1];
    const text =
`🆕 YANGI BUYURTMA — RADMIR MARKET

Mahsulot: ${newOrder.productName || "-"}
Sotuvchi: ${newOrder.sellerName || "-"} ${newOrder.sellerTg ? "(@" + newOrder.sellerTg.replace(/^@/, "") + ")" : ""}
Xaridor: ${newOrder.buyerName || "-"} ${newOrder.buyerTg ? "(@" + newOrder.buyerTg.replace(/^@/, "") + ")" : ""}
Izoh: ${newOrder.note || "-"}`;
    bot.sendMessage(ADMIN_CHAT_ID, text).catch(console.error);
  }

  res.json({ ok: true });
});

app.get("/api/blocked", (req, res) => res.json({ value: db.blocked }));
app.post("/api/blocked", (req, res) => {
  db.blocked = req.body.value || [];
  saveData(db);
  res.json({ ok: true });
});

app.listen(PORT, () => console.log(`Server ${PORT}-portda ishlamoqda`));

// ---------- Telegram bot ----------
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

bot.onText(/\/myid/, (msg) => {
  bot.sendMessage(msg.chat.id, `Sizning chat ID'ingiz: ${msg.chat.id}\nShuni ADMIN_CHAT_ID ga yozib qo'ying.`);
});

bot.onText(/\/start/, (msg) => {
  // Bot o'zi joylashgan xosting manzilini WEBAPP_URL sifatida ishlatamiz.
  // Bu qiymatni environment variable orqali beriladi (masalan Railway domeni).
  const webAppUrl = process.env.WEBAPP_URL || `http://localhost:${PORT}`;
  bot.sendMessage(msg.chat.id, "RADMIR MARKET botiga xush kelibsiz! Bozorni ochish uchun tugmani bosing 👇", {
    reply_markup: {
      inline_keyboard: [[
        { text: "🛍️ Bozorni ochish", web_app: { url: webAppUrl } }
      ]]
    }
  });
});

console.log("Bot ishga tushdi...");
