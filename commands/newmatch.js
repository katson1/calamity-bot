import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { getEmbed, getEmbedDev, getEmbedGamesFinished } from "../utils/embed.js";
import { MatchSetup } from '../models/MatchSetup.js';
import { Game } from '../models/Game.js';

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
        var game = null
        game = new Game();
        matchSetup.setMode(system);
        var bans = matchSetup.bans;
        var flag = true;

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
            embeds: [embedMention(interaction.user, system), newEmbedRegistration(matchSetup, 1), getEmbedDev()],
            components: [buttonsRow],
            fetchReply: true
        });

        const filter = (i) => ['join_match', 'leave_match'].includes(i.customId);

        const collectorInicial = interaction.channel.createMessageComponentCollector({ filter, time: 24000000 });

        collectorInicial.on('collect', async (i) => {
            const member = await interaction.guild.members.fetch(i.user.id);

            let errorMessage = '';

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
                
                const chosenTeam = Math.random() < 0.5 ? matchSetup.team1Controller : matchSetup.team2Controller;

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

                    const member = await interaction.guild.members.fetch(i.user.id);
                    const fpmap = i.customId;

                    matchSetup.setFirstPickAndMap(fpmap, chosenTeam.user);

                    newEmbedRegistration(matchSetup, 2);

                    const maps = [
                        "Alterac", "Battlefield", "Braxis", "Cursed", "Dragon",
                        "Garden", "Hanamura", "Infernal", "Sky",
                        "Tomb", "Towers", "Volskaya"
                    ];

                    var actionRows = generateActionRowsForMaps(maps, ButtonStyle.Danger);

                    await i.update({
                        embeds: [newEmbedRegistration(matchSetup, 2), createBansEmbed(matchSetup.currentBanUser), getEmbedDev()],
                        components: actionRows
                    });

                    collector.stop();
                    const filter = (i) => i.isButton();
                    const collectorBans = interaction.channel.createMessageComponentCollector({ filter, time: 24000000 });
                    collectorBans.on('collect', async (interaction) => {

                        if (matchSetup.isBo7) {
                            console.log(isBo7);
                        }

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
                                if (fpOrMap === 'fpgames') {
                                    matchSetup.fpTeam = matchSetup.selecting.role;
                                    matchSetup.pickingTeam = matchSetup.selecting.user == matchSetup.team1Controller.user ? matchSetup.team2Controller.user : matchSetup.team1Controller.user;
                                    game.fp = matchSetup.selecting.role;
                                } else if (fpOrMap === 'mapgames') {
                                    matchSetup.pickingTeam = matchSetup.selecting.user;
                                    matchSetup.fpTeam = matchSetup.selecting.user == matchSetup.team1Controller.user ? matchSetup.team2Controller.role : matchSetup.team1Controller.role;
                                    game.fp = matchSetup.fpTeam;
                                }
                                

                                game = new Game();
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
                                if (!member.roles.cache.some(role => role.name.toLowerCase() === 'adm')) {
                                    await interaction.reply({
                                        content: "Only an administrator can designate a winner!",
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
                                        embeds: [newEmbedRegistration(matchSetup, 2), createGamesEmbed(matchSetup), getEmbedGamesFinished(), getEmbedDev()],
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


const embedMention = (user, system) => {
    const embed = getEmbed();
    const userMention = `<@${user.id}>`;
    embed.description = `${userMention} have selected: **${system}**`;
    embed.footer = null;
    return embed;
}

function createMapButton(mapName, style) {
    return new ButtonBuilder()
        .setCustomId(mapName.toLowerCase())
        .setLabel(mapName)
        .setStyle(style);
}

function createWinnersButton(buttonName) {
    return new ButtonBuilder()
        .setCustomId(buttonName)
        .setLabel(buttonName)
        .setStyle(ButtonStyle.Success);
}

function getFpMapButton(){
    let fpMapRow = new ActionRowBuilder();
    fpMapRow.addComponents(createFpMapButton('Map', 'mapgames'));
    fpMapRow.addComponents(createFpMapButton('First Pick', 'fpgames'));
    return fpMapRow;
}

function createFpMapButton(buttonName, id) {
    if(id == 'fpgames'){
        return new ButtonBuilder()
        .setCustomId(id)
        .setLabel(buttonName)
        .setStyle(ButtonStyle.Success);
    }
    return new ButtonBuilder()
        .setCustomId(id)
        .setLabel(buttonName)
        .setStyle(ButtonStyle.Primary);
}

function getWinnersButtonRows(matchSetup) {
    let winnersRow = new ActionRowBuilder();
    winnersRow.addComponents(createWinnersButton(matchSetup.team1Controller.role.name));
    winnersRow.addComponents(createWinnersButton(matchSetup.team2Controller.role.name));
    return winnersRow;
}


function createStaffEmbed() {
    const staffEmbed = getEmbed();
    staffEmbed.title = '';
    staffEmbed.description = `Administrators, please designate the winner:`;
    return staffEmbed;
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


function createLoserDecisionEmbed(currentPickUser) {
    const pickEmbed = getEmbed();
    pickEmbed.title = "Loser decision:";
    pickEmbed.description = `${currentPickUser}, please select:`;
    return pickEmbed;
}

function createPicksEmbed(currentPickUser) {
    const pickEmbed = getEmbed();
    pickEmbed.title = "Map pick:";
    pickEmbed.description = `${currentPickUser}, please select a map to play:`;
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

function updateAvailableMapsToPick(maps, team1Controller, team2Controller, games) {
    let newArray = [];
    games.forEach((game) => {
        newArray.push(game.mapPlayed);
    });
    const bannedMaps = [...team1Controller.mapsBanned, ...team2Controller.mapsBanned, ...newArray];

    let availableMaps = maps.filter(map => !bannedMaps.includes(map));

    return availableMaps;
};

const newEmbedRegistration = (matchSetup, description) => {
    const embed = getEmbed();
    embed.title = `Match: **${matchSetup.team1Controller.role.name}** vs **${matchSetup.team2Controller.role.name}**`;
    if (description == 1) {
        embed.description = `Captains, click \`join\` to represent your team.`;
    } else {
        embed.description = `Teams ready!`;
    }

    const team1Status = matchSetup.team1Controller.user ? `<@&${matchSetup.team1Controller.role.id}> (captain: <@${matchSetup.team1Controller.user.id}>)` : `<@&${matchSetup.team1Controller.role.id}> (Waiting for captain)`;
    const team2Status = matchSetup.team2Controller.user ? `<@&${matchSetup.team2Controller.role.id}> (captain: <@${matchSetup.team2Controller.user.id}>)` : `<@&${matchSetup.team2Controller.role.id}> (Waiting for captain)`;

    embed.fields.push(
        { name: `\`${matchSetup.mode}\` - bans: \`${matchSetup.bans}\``, value: ``, inline: false },
        { name: 'Team 1', value: team1Status, inline: true },
        { name: 'Team 2', value: team2Status, inline: true },
    );

    if (matchSetup.team1Controller.tosscoin_fp || matchSetup.team2Controller.tosscoin_fp) {
        let firstPickTeam = matchSetup.getTeamFp();
        let mapPickTeam = matchSetup.getTeamMap();
        embed.fields.push(
            { name: `\u200b`, value: ``, inline: false },
            { name: `Toss coin:`, value: `**First Pick:** \`${firstPickTeam.role.name} (${firstPickTeam.user.globalName})\``, inline: false },
            { name: ``, value: `**Map:** \`${mapPickTeam.role.name} (${mapPickTeam.user.globalName})\``, inline: false },
            { name: `\u200b`, value: ``, inline: false }
        );
    }

    if (matchSetup.team1Controller.mapsBanned.length > 0) {
        const mapsBannedString = matchSetup.team1Controller.mapsBanned.join(', ');
        embed.fields.push(
            { name: `${matchSetup.team1Controller.role.name} bans:`, value: `\`${mapsBannedString}\``, inline: true  }
        );
    }

    if (matchSetup.team2Controller.mapsBanned.length > 0) {
        const mapsBannedString = matchSetup.team2Controller.mapsBanned.join(', ');
        embed.fields.push(
            { name: `${matchSetup.team2Controller.role.name} bans:`, value: `\`${mapsBannedString}\``, inline: true  }
        );
        
    }

    return embed;
}

function createGamesEmbed(matchSetup) {
    const gamesEmbed = getEmbed();
    gamesEmbed.title = `Games:`;
    gamesEmbed.description = `${matchSetup.mode}: \`${matchSetup.team1Controller.wins} - ${matchSetup.team2Controller.wins}\``;
    
    matchSetup.games.forEach((game, index) => {
        gamesEmbed.fields.push(
            { name: `\u200b`, value: ``, inline: false  },
            { name: `Game \`${index+1}\`:`, value: ``, inline: false  }
        );
        if(game.progress == 1 || game.progress == 2){
            gamesEmbed.fields.push(
                { name: ``, value: `**Map:** \`${game.mapPlayed}\``, inline: false  },
                { name: ``, value: `**First Pick:** \`${game.fp.name}\``, inline: false  }
            );
        } else {
            gamesEmbed.fields.push(
                { name: ``, value: `**Map:** \`${game.mapPlayed}\``, inline: false  },
                { name: ``, value: `**First Pick:** \`${game.fp.name}\``, inline: false  },
                { name: ``, value: `**Winner:** ${game.winner}`, inline: false  },
            );
        }
    });

    return gamesEmbed;
}

