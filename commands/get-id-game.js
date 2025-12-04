const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("get-id-game")
    .setDescription("Lihat screenshot ID game milik user")
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
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("User yang ingin dicek (default: kamu sendiri)")
        .setRequired(false)
    ),

  async execute(interaction, client) {
    const game = interaction.options.getString("game");
    const user = interaction.options.getUser("user") || interaction.user;

    const record = client.findIdGame(user.id, game);

    if (!record) {
      return interaction.reply({
        content: `❌ Tidak ada ID game **${game}** yang tersimpan untuk ${user}.`,
        ephemeral: true,
      });
    }

    await interaction.reply({
      content: `🎮 ID game **${game}** untuk ${user}:`,
      embeds: [
        {
          title: `Screenshot ID Game (${game})`,
          image: { url: record.imageUrl },
          footer: {
            text: `Disimpan pada ${new Date(
              record.timestamp
            ).toLocaleString()}`,
          },
        },
      ],
    });
  },
};
