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
                name: `**/newmatch**`,
                value: `Select a game mode and assign two teams (Discord roles). If the selected game mode is \`bo7\`, designate the \`Upper Finals Winner\` as \`team_1\`.`,
                inline: false,
            },
            {
                name: `**/config**`,
                value: `This command allows you to configure or retrieve settings for the bot.

                To set map preferences, use the setting command followed by the desired maps enclosed in spaces. For example: Sky Alterac Cursed. Each map should be listed separately. Note that maps must be specified by a single name;
                
                Additionally, you can modify the format of the Bo7 system for tournaments. If your tournament utilizes the Upper Finals configuration, you can adjust the advantage given to the winning team.
                
                Using the setting Bo7 command, you can specify:
                
                **map:** Automatically sets the toss coin winner to team_1.
                **game:** Sets the first game win to team_1.`,
                inline: false,
            },
            {
                name: `**/help**`,
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