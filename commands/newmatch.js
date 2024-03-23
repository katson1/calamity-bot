import { SlashCommandBuilder } from "discord.js";
import { getEmbed } from "../utils/embed.js";

export default {
    data: new SlashCommandBuilder()
    .setName("newmatch")
    .setDescription("Start a new match"),

        async execute(interaction) {

        const embed = getEmbed();
        embed.title = 'Attention';
        embed.fields.push(
        {
            name: `The player is already added to the inhouse!`,
            value: `tamo testando`,
            inline: false,
        });
        //await interaction.reply({ content: `<@${interaction.user.id}> teste`, embeds: [embed]});
        await interaction.reply({ embeds: [embed, embed2(interaction.user)]});
    }
}

const embed2 = (user) => {
    const embed = getEmbed();
    const userMention = `<@${user.id}>`;
    embed.description = `${userMention}, you have selected .`;
    embed.footer = null;
    return embed;
}
