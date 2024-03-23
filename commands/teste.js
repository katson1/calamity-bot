import { SlashCommandBuilder } from "discord.js";
import { getEmbed } from "../utils/embed.js";

export default {
    data: new SlashCommandBuilder()
    .setName("teste")
    .setDescription("Start a new match"),

        async execute(interaction) {

        console.log(interaction.user.User);

        const embed = getEmbed();
        embed.title = 'Attention';
        embed.fields.push(   
        {
            name: `The player is already added to the inhouse!`,
            value: `tamo testando`,
            inline: false,
        },
        {
            name: '\u200b',
            value: '\u200b',
            inline: false,
        });
        await interaction.reply({ embeds: [embed, embed2(interaction.user.globalName)]});    
    }
}

const embed2 = (teste) => {
    const embed = getEmbed();
    embed.title = 'Attention';
    embed.fields.push(   
    {
        name: `The ${teste} is already added to the inhouse!`,
        value: `tamo testando`,
        inline: false,
    },
    {
        name: '\u200b',
        value: '\u200b',
        inline: false,
    });

    return embed;
}
