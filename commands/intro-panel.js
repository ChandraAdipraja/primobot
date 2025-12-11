const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("intro-panel")
    .setDescription("Kirim panel intro + tombol template (buat staff)."),

  async execute(interaction) {
    // Optional: batasi cuma admin / mod
    if (!interaction.memberPermissions.has("ManageGuild")) {
      return interaction.reply({
        content: "❌ Kamu tidak punya izin untuk menjalankan command ini.",
        ephemeral: true,
      });
    }

    const introText = [
      "🌿 **Introduce Yourself**",
      "",
      "Biar kita bisa kenal kamu, silakan tulis sedikit tentang dirimu di channel ini.",
      "Kalau bingung mau mulai dari mana, klik tombol di bawah untuk mendapatkan template intro ✨",
    ].join("\n");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("intro_template_button") // ID unik button
        .setLabel("📋 Get Intro Template")
        .setStyle(ButtonStyle.Primary)
    );

    await interaction.reply({
      content: introText,
      components: [row],
    });
  },
};
