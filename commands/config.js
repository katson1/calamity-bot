import { SlashCommandBuilder } from "discord.js";
import { getEmbed, getEmbedDev } from "../utils/embed.js";

export default {
    data: new SlashCommandBuilder()
        .setName("config")
        .setDescription("Set or get bot configs.")
        .addStringOption(option =>
            option.setName('setting')
                .setDescription('Select the config setting')
                .setRequired(true)
                .addChoices(
                    { name: 'Maps', value: 'maps' },
                    { name: 'Bo7', value: 'bo7' },
                )
        ),

    async execute(interaction) {
        const devEmbed = getEmbedDev();
        devEmbed.color = 0x2F4F4F;
        const configEmbed = getEmbed();
        configEmbed.color = 0x2F4F4F;
        configEmbed.title = 'Config';
        configEmbed.fields.push(
            {
                name: ``,
                value: ``,
                inline: false,  
            }
        );
        await interaction.reply({ embeds: [configEmbed, devEmbed] });
    }
};
