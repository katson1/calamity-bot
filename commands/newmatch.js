import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { getEmbed, getEmbedDev } from "../utils/embed.js";
import { MatchSetup } from '../models/MatchSetup.js';

export default {
    data: new SlashCommandBuilder()
        .setName("newmatch")
        .setDescription("Start a new match")
        .addStringOption(option =>
            option.setName('system')
                .setDescription('Select the match system')
                .setRequired(true)
                .addChoices(
                    { name: 'Best of 1', value: 'Bo1' },
                    { name: 'Best of 2', value: 'Bo2' },
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

        const matchSetup = new MatchSetup(team1Role, team2Role);
        matchSetup.startBanPhase();

        var games = [];

        var game = {
            mapPlayed: '',
            mapChooser: null,
            winner: null,
            fp: null
        }

        var bans = 0;
        var banCount = 0;
        var currentBanUser = '';
        var noCurrentBanUser = '';
        var pickingTeam = null;
        var team1Controller = {
            role: team1Role,
            user: null,
            mapsBanned: [],
            fp: false,
            map: false
        };

        var team2Controller = {
            role: team2Role,
            user: null,
            mapsBanned: [],
            fp: false,
            map: false
        };

        matchSetup.setMode(system);
        bans = matchSetup.bans;

        var team1Member = null;
        var team2Member = null;

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
            embeds: [embedMention(interaction.user, system), embedRegistration(team1Role, team1Member, team2Role, team2Member, 1, system, bans), getEmbedDev()],
            components: [buttonsRow],
            fetchReply: true
        });

        const filter = (i) => ['join_match', 'leave_match'].includes(i.customId);

        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 24000000 });

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

            if (team1Member && team2Member) {

                team1Controller.user = team1Member;
                team2Controller.user = team2Member;

                const chosenTeam = Math.random() < 0.5 ? team1Member : team2Member;

                const fpButton = new ButtonBuilder()
                    .setCustomId("fp")
                    .setLabel(`First Pick`)
                    .setStyle(ButtonStyle.Primary);

                const mapButton = new ButtonBuilder()
                    .setCustomId("map")
                    .setLabel("Map")
                    .setStyle(ButtonStyle.Success);

                const buttonsRowFPMap = new ActionRowBuilder().addComponents(fpButton, mapButton);

                const completionEmbed = getEmbed();
                completionEmbed.title = "Toss coin:";
                completionEmbed.description = `${chosenTeam} won the toss coin! ${chosenTeam}, please select:`;

                await i.update({
                    embeds: [embedMention(interaction.user, system), embedRegistration(team1Role, team1Member, team2Role, team2Member, 2, system, bans), completionEmbed, getEmbedDev()],
                    components: [buttonsRowFPMap]
                });

                const filter = (i) => ['join_match', 'leave_match', 'fp', 'map'].includes(i.customId);
                const collector = interaction.channel.createMessageComponentCollector({ filter, time: 24000000 });

                collector.on('collect', async (i) => {

                    if (i.user.id !== chosenTeam.id) {
                        await i.reply({
                            content: "You are not authorized to do this action at this time!",
                            ephemeral: true
                        });
                        return;
                    }

                    const member = await interaction.guild.members.fetch(i.user.id);
                    const fpmap = i.customId;

                    if (fpmap === 'fp') {
                        if (chosenTeam === team1Member) {
                            team1Controller.fp = true;
                            team2Controller.map = true;
                            currentBanUser = team2Controller.user;
                        } else {
                            team2Controller.fp = true;
                            team1Controller.map = true;
                            currentBanUser = team1Controller.user;
                        }
                    } else if (fpmap === 'map') {
                        if (chosenTeam === team1Member) {
                            team1Controller.map = true;
                            team2Controller.fp = true;
                            currentBanUser = team1Controller.user;
                        } else {
                            team2Controller.map = true;
                            team1Controller.fp = true;
                            currentBanUser = team2Controller.user;
                        }
                    }

                    const maps = [
                        "Alterac", "Battlefield", "Braxis", "Cursed", "Dragon",
                        "Garden", "Hanamura", "Infernal", "Sky",
                        "Tomb", "Towers", "Volskaya"
                    ];

                    var actionRows = generateActionRowsForMaps(maps, ButtonStyle.Danger);

                    await i.update({
                        embeds: [embedRegistration(team1Role, team1Member, team2Role, team2Member, 2, system, bans, team1Controller, team2Controller), createBansEmbed(currentBanUser), getEmbedDev()],
                        components: actionRows
                    });

                    const filter = (i) => i.isButton() && i.customId.match(/^[a-z]+(_[a-z]+)*$/);

                    const collectorBans = interaction.channel.createMessageComponentCollector({ filter, time: 24000000 });

                    collectorBans.on('collect', async (interaction) => {

                        if (matchSetup.banPhaseFlag) {

                            if (interaction.user.id !== currentBanUser.id) {
                                await interaction.reply({
                                    content: "You are not authorized to do this action at this time!",
                                    ephemeral: true
                                });
                                return;
                            }

                            let mapName = interaction.customId.replace(/_/g, ' ');
                            mapName = mapName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

                            actionRows = actionRows.map(row => {
                                const updatedComponents = row.components.map(button => {
                                    if (button.data.custom_id === interaction.customId) {
                                        const updatedButtonData = { ...button.data, disabled: true };
                                        return new ButtonBuilder(updatedButtonData);
                                    }
                                    return button;
                                });

                                return new ActionRowBuilder().addComponents(updatedComponents);
                            });

                            banCount = banCount + 1;
                            currentBanUser = (currentBanUser === team1Member) ? team2Member : team1Member;
                            noCurrentBanUser = (currentBanUser === team1Member) ? team2Member : team1Member;

                            const member = await interaction.guild.members.fetch(currentBanUser.id);
                            if (member.roles.cache.has(team2Controller.role.id)) {
                                team1Controller.mapsBanned.push(mapName);
                            } else if (member.roles.cache.has(team1Controller.role.id)) {
                                team2Controller.mapsBanned.push(mapName);
                            }

                            if (banCount >= bans) {
                                var availableMaps = updateAvailableMaps(maps, team1Controller, team2Controller);
                                var pickMapsRows = generateActionRowsForMaps(availableMaps, ButtonStyle.Success);
                                pickingTeam = team2Controller.map ? team2Member : team1Member;

                                matchSetup.startPickPhase();

                                await interaction.update({
                                    embeds: [embedRegistration(team1Role, team1Member, team2Role, team2Member, 2, system, bans, team1Controller, team2Controller), createPicksEmbed(pickingTeam), getEmbedDev()],
                                    components: pickMapsRows
                                });
                            } else {
                                await interaction.update({
                                    embeds: [createMapBanned(noCurrentBanUser, mapName), embedRegistration(team1Role, team1Member, team2Role, team2Member, 2, system, bans, team1Controller, team2Controller), createBansEmbed(currentBanUser), getEmbedDev()],
                                    components: actionRows
                                });
                            }
                        } else {
                            var availableMaps = updateAvailableMaps(maps, team1Controller, team2Controller);
                            var pickMapsRows = generateActionRowsForMaps(availableMaps, ButtonStyle.Success);
                            pickingTeam = team2Controller.map ? team2Member : team1Member;

                            await interaction.update({
                                embeds: [embedRegistration(team1Role, team1Member, team2Role, team2Member, 2, system, bans, team1Controller, team2Controller), createPicksEmbed(pickingTeam), getEmbedDev()],
                                components: pickMapsRows
                            });

                        }
                    });

                });

            } else {
                if (errorMessage !== '') {
                    await i.reply({ content: errorMessage, ephemeral: true });
                } else {
                    await i.update({
                        embeds: [embedMention(interaction.user, system), embedRegistration(team1Role, team1Member, team2Role, team2Member, 1, system, bans), getEmbedDev()],
                        components: [buttonsRow]
                    });
                }
            }
        });
    }
}


const embedMention = (user, system) => {
    const embed = getEmbed();
    const userMention = `<@${user.id}>`;
    embed.description = `${userMention} have selected: **${system}**`;
    embed.footer = null;
    return embed;
}

const embedRegistration = (team1Role, team1Member, team2Role, team2Member, description, system, bans, team1Controller, team2Controller) => {
    const embed = getEmbed();
    embed.title = `Match: **${team1Role.name}** vs **${team2Role.name}**`;
    if (description == 1) {
        embed.description = `Captains, click \`join\` to represent your team.`;
    } else {
        embed.description = `Teams Ready:`;
    }

    const team1Status = team1Member ? `<@&${team1Role.id}> (captain: <@${team1Member.id}>)` : `<@&${team1Role.id}> (Waiting for member)`;
    const team2Status = team2Member ? `<@&${team2Role.id}> (captain: <@${team2Member.id}>)` : `<@&${team2Role.id}> (Waiting for member)`;

    embed.fields.push(
        { name: `\`${system}\` - bans: \`${bans}\``, value: ``, inline: false },
        { name: 'Team 1', value: team1Status, inline: true },
        { name: 'Team 2', value: team2Status, inline: true },
    );


    if (team1Controller || team2Controller) {
        embed.fields.push(
            { name: `\u200b`, value: ``, inline: false }
        );
        if (team1Controller.fp) {
            embed.fields.push(
                { name: `Toss coin:`, value: `First Pick: \`${team1Controller.role.name} (${team1Controller.user.globalName})\``, inline: false },
                { name: ``, value: `Map: \`${team2Controller.role.name} (${team2Controller.user.globalName})\``, inline: false }
            );
        }
        if (team2Controller.fp) {
            embed.fields.push(
                { name: `Toss coin:`, value: `First Pick: \`${team2Controller.role.name} (${team2Controller.user.globalName})\``, inline: false },
                { name: ``, value: `Map: \`${team1Controller.role.name} (${team1Controller.user.globalName})\``, inline: false }
            );
        }
        embed.fields.push({ name: `\u200b`, value: ``, inline: false })
    }

    if (team1Controller && team1Controller.mapsBanned.length > 0) {
        const mapsBannedString = team1Controller.mapsBanned.join(', ');
        embed.fields.push(
            { name: `${team1Controller.role.name} bans:`, value: `\`${mapsBannedString}\`` }
        );
    }

    if (team2Controller && team2Controller.mapsBanned.length > 0) {
        const mapsBannedString = team2Controller.mapsBanned.join(', ');
        embed.fields.push(
            { name: `${team2Controller.role.name} bans:`, value: `\`${mapsBannedString}\`` }
        );
        
    }

    return embed;
}

function createMapButton(mapName, style) {
    return new ButtonBuilder()
        .setCustomId(mapName.toLowerCase())
        .setLabel(mapName)
        .setStyle(style);
}

function createBansEmbed(currentBanUser) {
    const bansEmbed = getEmbed();
    bansEmbed.title = "Map bans";
    bansEmbed.description = `${currentBanUser}, please select a map to ban:`;
    return bansEmbed;
}

function createMapBanned(currentBanUser, banned) {
    const bansEmbed = getEmbed();
    bansEmbed.description = `${currentBanUser}, has banned: **${banned}**`;
    return bansEmbed;
}


function createPicksEmbed(currentPickUser) {
    const pickEmbed = getEmbed();
    pickEmbed.title = "Map pick:";
    pickEmbed.description = `${currentPickUser}, please select a map to pick:`;
    return pickEmbed;
}

function generateActionRowsForMaps(maps, style) {
    let actionRows = [];
    let row = new ActionRowBuilder();

    maps.forEach((mapName, index) => {
        const button = createMapButton(mapName, style);

        if (index % 4 === 0 && index !== 0) {
            actionRows.push(row);
            row = new ActionRowBuilder();
        }
        row.addComponents(button);
    });

    if (row.components.length > 0) {
        actionRows.push(row);
    }

    return actionRows;
}

function updateAvailableMaps(maps, team1Controller, team2Controller) {
    const bannedMaps = [...team1Controller.mapsBanned, ...team2Controller.mapsBanned];

    let availableMaps = maps.filter(map => !bannedMaps.includes(map));

    return availableMaps;
};