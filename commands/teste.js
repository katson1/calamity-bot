import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, InteractionCollector } from "discord.js";
import { getEmbed } from "../utils/embed.js";

export default {
    data: new SlashCommandBuilder()
        .setName("teste")
        .setDescription("Start a new match")
        .addStringOption(option =>
            option.setName('system')
                .setDescription('Select the match system')
                .setRequired(true)
                .addChoices(
                    { name: 'Best of 1', value: 'Bo1' },
                    { name: 'Best of 3', value: 'Bo3' },
                    { name: 'Best of 5', value: 'Bo5' },
                    { name: 'Best of 7', value: 'Bo7' }
                )
        )
        .addRoleOption(option =>
            option.setName('team_1')
                .setDescription('Select the first team of the match')
                .setRequired(true)
        )
        .addRoleOption(option =>
            option.setName('team_2')
                .setDescription('Select the second team of the match')
                .setRequired(true)
        ),

    async execute(interaction) {
        const team1Role = interaction.options.getRole('team_1');
        const team2Role = interaction.options.getRole('team_2');
        const system = interaction.options.getString('system');

        let team1Member = null;
        let team2Member = null;

        const joinButton = new ButtonBuilder()
            .setCustomId("join_match")
            .setLabel(`Join`)
            .setStyle(ButtonStyle.Success);

        const leaveButton = new ButtonBuilder()
            .setCustomId("leave_match")
            .setLabel("Leave")
            .setStyle(ButtonStyle.Secondary);

        const buttonsRow = new ActionRowBuilder().addComponents(joinButton, leaveButton);

        await interaction.reply({
            embeds: [embedMention(interaction.user), embedRegistration(team1Role, team1Member, team2Role, team2Member)],
            components: [buttonsRow],
            fetchReply: true
        });

        const filter = (i) => ['join_match', 'leave_match'].includes(i.customId);

        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

        collector.on('collect', async (i) => {
            const member = await interaction.guild.members.fetch(i.user.id);
        
            let errorMessage = '';
        
            if (i.customId === 'join_match') {
                if (member.roles.cache.has(team1Role.id)) {
                    if (team1Member) {
                        errorMessage = 'Team 1 already have a captain.';
                    } else {
                        team1Member = i.user;
                    }
                } else if (member.roles.cache.has(team2Role.id)) {
                    if (team2Member) {
                        errorMessage = 'Team 2 already have a captain.';
                    } else {
                        team2Member = i.user;
                    }
                } else {
                    errorMessage = 'You do not have the necessary role to participate!';
                }
            } else if (i.customId === 'leave_match') {
                if (team1Member && team1Member.id === i.user.id) {
                    team1Member = null;
                } else if (team2Member && team2Member.id === i.user.id) {
                    team2Member = null;
                } else {
                    errorMessage = 'You are not registered in any team.';
                }
            }
        
            if (errorMessage !== '') {
                await i.reply({ content: errorMessage, ephemeral: true });
            } else {
                await i.update({
                    embeds: [embedMention(interaction.user, system), embedRegistration(team1Role, team1Member, team2Role, team2Member)],
                    components: [buttonsRow]
                });
            }
        });
    }
}


const embedMention = (user, sistem) => {
    const embed = getEmbed();
    const userMention = `<@${user.id}>`;
    embed.description = `${userMention}, you have selected: **${sistem}**`;
    embed.footer = null;
    return embed;
}

const embedRegistration = (team1Role, team1Member, team2Role, team2Member) => {
    const embed = getEmbed();
    embed.title = 'Match Registration';
    embed.description = `Click join to represent your team.`;

    const team1Status = team1Member ? `<@&${team1Role.id}> (Joined by <@${team1Member.id}>)` : `<@&${team1Role.id}> (Waiting for member)`;
    const team2Status = team2Member ? `<@&${team2Role.id}> (Joined by <@${team2Member.id}>)` : `<@&${team2Role.id}> (Waiting for member)`;

    embed.fields.push(
        { name: 'Team 1', value: team1Status, inline: true },
        { name: 'Team 2', value: team2Status, inline: true }
    );

    return embed;
}
