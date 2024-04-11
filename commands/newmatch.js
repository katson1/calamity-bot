import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { getEmbed, getEmbedDev, getEmbedGamesFinished, createGamesEmbed, createPicksEmbed, createStaffEmbed, createBansEmbed, createMapBanned, createLoserDecisionEmbed, embedMention, newEmbedRegistration, createCancelEmbed } from "../utils/embed.js";
import { MatchSetup } from '../models/MatchSetup.js';
import { Game } from '../models/Game.js';
import { getBo7, getMaps, getRoles } from '../config/config.js';

export default {
    data: new SlashCommandBuilder()
        .setName("newmatch")
        .setDescription("Initiate a new match")
        .addStringOption(option =>
            option.setName('system')
                .setDescription('Select the match system')
                .setRequired(true)
                .addChoices(
                    { name: 'Best of 2', value: 'Bo2' },
                    { name: 'Best of 3', value: 'Bo3' },
                    { name: 'Best of 5', value: 'Bo5' },
                    { name: 'Best of 7', value: 'Bo7' }
                )
        )
        .addRoleOption(option =>
            option.setName('team_1')
                .setDescription('Choose the first team of the match')
                .setRequired(true)
        )
        .addRoleOption(option =>
            option.setName('team_2')
                .setDescription('Choose the second team of the match')
                .setRequired(true)
        ),

    async execute(interaction) {
        const team1Role = interaction.options.getRole('team_1');
        const team2Role = interaction.options.getRole('team_2');
        const system = interaction.options.getString('system');

        const matchSetup = new MatchSetup(team1Role, team2Role);
        matchSetup.startBanPhase();
        matchSetup.setMode(system);
        var bans = matchSetup.bans;
        var bo7 = await getBo7();

        var game = null
        game = new Game();

        var flag = true;

        const joinButton = new ButtonBuilder()
            .setCustomId("join_match")
            .setLabel(`Join`)
            .setStyle(ButtonStyle.Success);

        const leaveButton = new ButtonBuilder()
            .setCustomId("leave_match")
            .setLabel("Leave")
            .setStyle(ButtonStyle.Secondary);
            
        const cancelButton = new ButtonBuilder()
            .setCustomId("cancel_match")
            .setLabel("Cancel")
            .setStyle(ButtonStyle.Danger);

        const buttonsRow = new ActionRowBuilder().addComponents(joinButton, leaveButton, cancelButton);

        await interaction.reply({
            embeds: [embedMention(interaction.user, system), newEmbedRegistration(matchSetup, 1), getEmbedDev()],
            components: [buttonsRow],
            fetchReply: true
        });

        const filter = (i) => ['join_match', 'leave_match', 'cancel_match'].includes(i.customId);

        const collectorInicial = interaction.channel.createMessageComponentCollector({ filter, time: 24000000 });

        collectorInicial.on('collect', async (i) => {
            const member = await interaction.guild.members.fetch(i.user.id);

            let errorMessage = '';

            if (i.customId === 'cancel_match') {
                const memberAdmin = interaction.guild.members.cache.get(interaction.user.id);
                if (!memberAdmin.roles.cache.some(role => role.name.toLowerCase() === 'adm')) {
                    await i.reply({
                        content: "Only an administrator can cancel a match!",
                        ephemeral: true
                    });
                    return;
                }
                collectorInicial.stop();
                await i.update({
                    embeds: [createCancelEmbed()],
                    components: []
                });
                return;
            }

            if (i.customId === 'join_match') {
                if (member.roles.cache.has(team1Role.id)) {
                    if (matchSetup.team1Controller.user) {
                        errorMessage = 'Team 1 already has a captain!';
                    } else {
                        matchSetup.setUserToTeam(1, i.user);
                    }
                } else if (member.roles.cache.has(team2Role.id)) {
                    if (matchSetup.team2Controller.user) {
                        errorMessage = 'Team 2 already has a captain!';
                    } else {
                        matchSetup.setUserToTeam(2, i.user);
                    }
                } else {
                    errorMessage = 'You do not have the required role to participate!';
                }
            } else if (i.customId === 'leave_match') {
                if (matchSetup.team1Controller.user && matchSetup.team1Controller.user.id === i.user.id) {
                    matchSetup.setUserToTeam(1, null);
                } else if (matchSetup.team2Controller.user && matchSetup.team2Controller.user.id === i.user.id) {
                    matchSetup.setUserToTeam(2, null);
                } else {
                    errorMessage = 'You are not registered on any team.';
                }
            }

            if (matchSetup.team1Controller.user && matchSetup.team2Controller.user) {

                let chosenTeam = Math.random() < 0.5 ? matchSetup.team1Controller : matchSetup.team2Controller;

                if (matchSetup.isBo7 && bo7 == 'map') {
                    chosenTeam = matchSetup.team1Controller;
                }
                if (matchSetup.isBo7 && bo7 == 'game') {
                    const gameBo7 = new Game();
                    gameBo7.bo7(matchSetup.team1Controller.role);
                    matchSetup.team1Controller.wins = 1;
                    matchSetup.games.push(gameBo7);
                    chosenTeam = matchSetup.team2Controller;
                }

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
                completionEmbed.description = `${chosenTeam.role} won the toss coin! ${chosenTeam.user}, please select:`;

                await i.update({
                    embeds: [embedMention(interaction.user, matchSetup.mode), newEmbedRegistration(matchSetup, 2), completionEmbed, getEmbedDev()],
                    components: [buttonsRowFPMap]
                });

                collectorInicial.stop();
                const filter = (i) => ['join_match', 'leave_match', 'fp', 'map'].includes(i.customId);
                const collector = interaction.channel.createMessageComponentCollector({ filter, time: 24000000 });
                collector.on('collect', async (i) => {

                    if (i.user.id !== chosenTeam.user.id) {
                        await i.reply({
                            content: 'You are not authorized to perform this action at the moment.',
                            ephemeral: true
                        });
                        return;
                    }

                    const fpmap = i.customId;
                    matchSetup.setFirstPickAndMap(fpmap, chosenTeam.user);

                    const maps = await getMaps();

                    var actionRows = generateActionRowsForMaps(maps, ButtonStyle.Danger);

                    await i.update({
                        embeds: [newEmbedRegistration(matchSetup, 2), createBansEmbed(matchSetup.currentBanUser), getEmbedDev()],
                        components: actionRows
                    });

                    collector.stop();
                    const filter = (i) => i.isButton();
                    const collectorBans = interaction.channel.createMessageComponentCollector({ filter, time: 24000000 });
                    collectorBans.on('collect', async (interaction) => {

                        if (matchSetup.banPhaseFlag) {

                            if (interaction.user.id !== matchSetup.currentBanUser.id) {
                                await interaction.reply({
                                    content: 'You are not authorized to perform this action at the moment.',
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

                            matchSetup.banCount += 1;
                            matchSetup.currentBanUser = (matchSetup.currentBanUser === matchSetup.team1Controller.user) ? matchSetup.team2Controller.user : matchSetup.team1Controller.user;
                            matchSetup.noCurrentBanUser = (matchSetup.currentBanUser === matchSetup.team1Controller.user) ? matchSetup.team2Controller.user : matchSetup.team1Controller.user;

                            const member = await interaction.guild.members.fetch(matchSetup.currentBanUser.id);
                            if (member.roles.cache.has(matchSetup.team2Controller.role.id)) {
                                matchSetup.team1Controller.mapsBanned.push(mapName);
                            } else if (member.roles.cache.has(matchSetup.team1Controller.role.id)) {
                                matchSetup.team2Controller.mapsBanned.push(mapName);
                            }

                            if (matchSetup.banCount >= bans) {
                                var availableMaps = updateAvailableMaps(maps, matchSetup.team1Controller, matchSetup.team2Controller);
                                var pickMapsRows = generateActionRowsForMaps(availableMaps, ButtonStyle.Success);
                                matchSetup.pickingTeam = matchSetup.team2Controller.tosscoin_map ? matchSetup.team2Controller.user : matchSetup.team1Controller.user;
                                matchSetup.fpTeam = matchSetup.team2Controller.tosscoin_map ? matchSetup.team1Controller.role : matchSetup.team2Controller.role;

                                matchSetup.startPickPhase();

                                await interaction.update({
                                    embeds: [newEmbedRegistration(matchSetup, 2), createPicksEmbed(matchSetup.pickingTeam), getEmbedDev()],
                                    components: pickMapsRows
                                });
                            } else {
                                await interaction.update({
                                    embeds: [createMapBanned(matchSetup.noCurrentBanUser, mapName), newEmbedRegistration(matchSetup, 2), createBansEmbed(matchSetup.currentBanUser), getEmbedDev()],
                                    components: actionRows
                                });
                            }
                        } else {
                            if (game.progress == 3) {

                                let fpOrMap = interaction.customId;

                                if (interaction.user.id !== matchSetup.selecting.user.id) {
                                    await interaction.reply({
                                        content: 'You are not authorized to perform this action at the moment.',
                                        ephemeral: true
                                    });
                                    return;
                                }

                                game = new Game();

                                if (fpOrMap === 'fpgames') {
                                    matchSetup.fpTeam = matchSetup.selecting.role;
                                    matchSetup.pickingTeam = matchSetup.selecting.user == matchSetup.team1Controller.user ? matchSetup.team2Controller.user : matchSetup.team1Controller.user;
                                    game.fp = matchSetup.selecting.role;
                                } else if (fpOrMap === 'mapgames') {
                                    matchSetup.pickingTeam = matchSetup.selecting.user;
                                    matchSetup.fpTeam = matchSetup.selecting.user == matchSetup.team1Controller.user ? matchSetup.team2Controller.role : matchSetup.team1Controller.role;
                                    game.fp = matchSetup.fpTeam;
                                }

                                flag = false;

                                let availableMaps = updateAvailableMapsToPick(maps, matchSetup.team1Controller, matchSetup.team2Controller, matchSetup.games);
                                let pickMapsRows = generateActionRowsForMaps(availableMaps, ButtonStyle.Success);

                                await interaction.update({
                                    embeds: [newEmbedRegistration(matchSetup, 2), createGamesEmbed(matchSetup), createPicksEmbed(matchSetup.pickingTeam), getEmbedDev()],
                                    components: pickMapsRows
                                });
                            }

                            if (game.progress == 2) {
                                const member = interaction.guild.members.cache.get(interaction.user.id);
                                const allowedRoles = await getRoles();
                        
                                if (!member.roles.cache.some(role => allowedRoles.includes(role.name.toLowerCase()))) {
                                    await interaction.reply({
                                        content: "Only admins roles can set winners!",
                                        ephemeral: true
                                    });
                                    return;
                                }
                                let winner = interaction.customId;

                                if (matchSetup.team1Controller.role.name === winner) {
                                    winner = matchSetup.team1Controller.role;
                                    matchSetup.selecting = matchSetup.team2Controller;
                                    matchSetup.team1Controller.wins = matchSetup.team1Controller.wins + 1;
                                } else if (matchSetup.team2Controller.role.name === winner) {
                                    winner = matchSetup.team2Controller.role;
                                    matchSetup.selecting = matchSetup.team1Controller;
                                    matchSetup.team2Controller.wins = matchSetup.team2Controller.wins + 1;
                                }
                                
                                game.setWinner(winner);

                                if (matchSetup.team1Controller.wins == matchSetup.totalWinsToFinish || matchSetup.team2Controller.wins == matchSetup.totalWinsToFinish) {

                                    const finalWinner = matchSetup.team1Controller.wins > matchSetup.team2Controller.wins ? matchSetup.team1Controller : matchSetup.team2Controller;
                                    const gamesFinished = getEmbedGamesFinished();
                                    gamesFinished.description = `Winner:  ${finalWinner.role}`;

                                    await interaction.update({
                                        embeds: [newEmbedRegistration(matchSetup, 2), createGamesEmbed(matchSetup), gamesFinished, getEmbedDev()],
                                        components: []
                                    });
                                    collectorBans.stop();
                                } else {
                                    await interaction.update({
                                        embeds: [newEmbedRegistration(matchSetup, 2), createGamesEmbed(matchSetup), createLoserDecisionEmbed(matchSetup.selecting.user), getEmbedDev()],
                                        components: [getFpMapButton()]
                                    });
                                }
                            }

                            if(game.progress == 1 && flag) {
                                if (interaction.user.id !== matchSetup.pickingTeam.id) {
                                    await interaction.reply({
                                        content: 'You are not authorized to perform this action at the moment.',
                                        ephemeral: true
                                    });
                                    return;
                                }

                                let mapName = interaction.customId.replace(/_/g, ' ');
                                mapName = mapName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                                
                                game.setFpAndMapChooser(matchSetup.fpTeam, matchSetup.pickingTeam);
                                game.mapPlayed = mapName;
                                matchSetup.games.push(game);

                                matchSetup.pickingTeam = null;
                                matchSetup.fpTeam = null;

                                game.progress = 2;

                                await interaction.update({
                                    embeds: [newEmbedRegistration(matchSetup, 2), createGamesEmbed(matchSetup), createStaffEmbed(), getEmbedDev()],
                                    components: [getWinnersButtonRows(matchSetup)]
                                });
                            }

                            flag = true;

                        }
                    });
                });

            } else {
                if (errorMessage !== '') {
                    await i.reply({ content: errorMessage, ephemeral: true });
                } else {
                    await i.update({
                        embeds: [embedMention(interaction.user, system), newEmbedRegistration(matchSetup, 1), getEmbedDev()],
                        components: [buttonsRow]
                    });
                }
            }
        });
    }
}

function createMapButton(mapName, style) {
    return new ButtonBuilder()
        .setCustomId(mapName.toLowerCase())
        .setLabel(mapName)
        .setStyle(style);
}

function getWinnersButtonRows(matchSetup) {
    let winnersRow = new ActionRowBuilder();
    winnersRow.addComponents(createWinnersButton(matchSetup.team1Controller.role.name));
    winnersRow.addComponents(createWinnersButton(matchSetup.team2Controller.role.name));
    return winnersRow;
}

function createWinnersButton(buttonName) {
    return new ButtonBuilder()
        .setCustomId(buttonName)
        .setLabel(buttonName)
        .setStyle(ButtonStyle.Success);
}

function getFpMapButton() {
    const fpMapRow = new ActionRowBuilder();
    fpMapRow.addComponents(createFpMapButton('Map', 'mapgames'));
    fpMapRow.addComponents(createFpMapButton('First Pick', 'fpgames'));
    return fpMapRow;
}

function createFpMapButton(buttonName, id) {
    const style = id == 'fpgames' ? ButtonStyle.Success : ButtonStyle.Primary;
    return new ButtonBuilder()
        .setCustomId(id)
        .setLabel(buttonName)
        .setStyle(style);
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

function updateAvailableMapsToPick(maps, team1Controller, team2Controller, games) {
    let newArray = [];
    games.forEach((game) => {
        newArray.push(game.mapPlayed);
    });
    const bannedMaps = [...team1Controller.mapsBanned, ...team2Controller.mapsBanned, ...newArray];

    let availableMaps = maps.filter(map => !bannedMaps.includes(map));

    return availableMaps;
};