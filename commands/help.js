import { SlashCommandBuilder } from "discord.js";
import { getEmbed, getEmbedDev } from "../utils/embed.js";

export default {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Help about commands!"),

    async execute(interaction) {
        const devEmbed = getEmbedDev();
        devEmbed.color = 0x2F4F4F;
        const helpEmbed = getEmbed();
        helpEmbed.color = 0x2F4F4F;
        helpEmbed.title = 'Commands:';
        helpEmbed.fields.push(
            {
                name: `**\`/newmatch\`**`,
                value: `Choose a game mode and assign two teams (Discord roles). The sequence in which teams are selected won't impact the game.`,
                inline: false,
            },
            {
                name: `**\`/help\`**`,
                value: `Display the command descriptions.`,
                inline: false,
            },
            {
                name: ``,
                value: ``,
                inline: false,  
            }
        );
        await interaction.reply({ embeds: [helpEmbed, devEmbed] });
    }
};
