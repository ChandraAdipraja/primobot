const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("share-id-game")
    .setDescription("Simpan screenshot ID game kamu")
    .addStringOption((option) =>
      option
        .setName("game")
        .setDescription("Pilih game")
        .setRequired(true)
        .addChoices(
          { name: "Roblox", value: "roblox" },
          { name: "Mobile Legends", value: "mlbb" },
          { name: "Valorant", value: "valorant" },
          { name: "Genshin Impact", value: "genshin" },
          { name: "Lainnya", value: "other" }
        )
    )
    .addAttachmentOption((option) =>
      option
        .setName("screenshot")
        .setDescription("Upload screenshot ID game")
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const game = interaction.options.getString("game");
    const attachment = interaction.options.getAttachment("screenshot");

    if (!attachment.contentType?.startsWith("image/")) {
      return interaction.reply({
        content: "❌ File yang kamu kirim bukan gambar.",
        ephemeral: true,
      });
    }

    // Simpan ke "database"
    const record = client.saveIdGame({
      userId: interaction.user.id,
      game,
      imageUrl: attachment.url,
    });

    await interaction.reply({
      content: `✅ ID game kamu untuk **${game}** sudah disimpan.\n(Disimpan pada: ${new Date(
        record.timestamp
      ).toLocaleString()})`,
      ephemeral: true, // cuma user yang lihat
    });
  },
};
