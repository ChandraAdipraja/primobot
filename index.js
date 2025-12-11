require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Client, Collection, GatewayIntentBits, Events } = require("discord.js");

// Load ENV
const token = process.env.DISCORD_TOKEN;

// Init Client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();

// Load commands dari folder ./commands
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(
      `[WARNING] Command di ${filePath} tidak punya "data" atau "execute".`
    );
  }
}

// Helper: path file JSON
const dbPath = path.join(__dirname, "data", "idgame.json");

// Helper: baca database
function readDB() {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, "[]", "utf8");
  }
  const raw = fs.readFileSync(dbPath, "utf8");
  return JSON.parse(raw);
}

// Helper: tulis database
function writeDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf8");
}

// Helper: simpan ID game (userId + game)
function saveIdGame({ userId, game, imageUrl }) {
  const db = readDB();

  // Cek ada data lama userId + game → replace
  const existingIndex = db.findIndex(
    (item) => item.userId === userId && item.game === game
  );

  const record = {
    userId,
    game,
    imageUrl,
    timestamp: new Date().toISOString(),
  };

  if (existingIndex !== -1) {
    db[existingIndex] = record;
  } else {
    db.push(record);
  }

  writeDB(db);
  return record;
}

// Helper: ambil ID game
function findIdGame(userId, game) {
  const db = readDB();
  return (
    db.find((item) => item.userId === userId && item.game === game) || null
  );
}

// Biar helper bisa dipakai di command
client.saveIdGame = saveIdGame;
client.findIdGame = findIdGame;

// Event ready
client.once(Events.ClientReady, (c) => {
  console.log(`✅ Logged in sebagai ${c.user.tag}`);
});

// Event handler untuk slash command
client.on(Events.InteractionCreate, async (interaction) => {
  // 1) Slash command handler
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);

    if (!command) {
      console.error(`Command ${interaction.commandName} tidak ditemukan.`);
      return;
    }

    try {
      await command.execute(interaction, client);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "❌ Terjadi error ketika menjalankan command ini.",
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: "❌ Terjadi error ketika menjalankan command ini.",
          ephemeral: true,
        });
      }
    }
    return;
  }

  // 2) Button handler
  if (interaction.isButton()) {
    if (interaction.customId === "intro_template_button") {
      const template = [
        "Here's your intro template, you can copy and edit it:",
        "",
        "```txt",
        "Name / Nickname:",
        "Age (opsional):",
        "From:",
        "Games I play:",
        "How I found this server:",
        "Fun fact about me:",
        "```",
      ].join("\n");

      await interaction.reply({
        content: template,
        ephemeral: true, // ⚡ cuma yang klik tombol yang bisa lihat
      });
    }
  }
});

// Login
client.login(token);
