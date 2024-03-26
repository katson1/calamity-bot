import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, InteractionCollector } from "discord.js";
import { getEmbed, getEmbedDev } from "../utils/embed.js";



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

        var bans = 0;
        var firstPick = '';
        var mapPick = '';
        var banCount = 0;

        switch (system) {
            case 'Bo1':
                bans = 4;
                break;
            case 'Bo2':
                bans = 4;
            case 'Bo3':
                bans = 4;
                break;
            case 'Bo5':
                bans = 2;
                break;
            case 'Bo7':
                bans = 2;
                break;
            default:
                console.log(`?`);
        }

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

            if (team1Member && team2Member) {
                const chosenTeam = Math.random() < 0.5 ? team1Member : team2Member;
                const notChosenTeam = chosenTeam === team1Member ? team2Member : team1Member;

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
                completionEmbed.description = `Toss coin: ${chosenTeam.globalName} won. ${chosenTeam.globalName}, please select:`;

                await i.update({
                    embeds: [embedMention(interaction.user, system), embedRegistration(team1Role, team1Member, team2Role, team2Member, 2, system, bans), completionEmbed, getEmbedDev()],
                    components: [buttonsRowFPMap]
                });

                const filter = (i) => ['join_match', 'leave_match', 'fp', 'map'].includes(i.customId);
                const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

                collector.on('collect', async (i) => {
                    const member = await interaction.guild.members.fetch(i.user.id);
                    const fpmap = i.customId;

                    firstPick = (fpmap === 'fp') ? chosenTeam.globalName : notChosenTeam.globalName;
                    mapPick = (fpmap === 'map') ? chosenTeam.globalName : notChosenTeam.globalName;

                    const bansEmbed = getEmbed();
                    bansEmbed.title = "Map bans";
                    bansEmbed.description = `Please select a map to ban:`;

                    const maps = [
                        "Alterac Pass", "Battlefield of Eternity", "Braxis Holdout", "Cursed Hollow", "Dragon Shire", 
                        "Garden of Terror", "Hanamura Temple", "Infernal Shrines", "Sky Temple", 
                        "Tomb of the Spider Queen", "Towers of Doom", "Volskaya Foundry"
                    ];

                    let actionRows = [];
                    let row = new ActionRowBuilder();
                    
                    maps.forEach((mapName, index) => {
                        const button = createMapButton(mapName);
                        
                        if (index % 4 === 0 && index !== 0) {
                            actionRows.push(row);
                            row = new ActionRowBuilder();
                        }
                        row.addComponents(button);
                    });
                    
                    if (row.components.length > 0) {
                        actionRows.push(row);
                    }

                    await i.update({
                        embeds: [
                            embedRegistration(team1Role, team1Member, team2Role, team2Member, 2, system, bans, firstPick, mapPick), 
                            bansEmbed, 
                            getEmbedDev()
                        ],
                        components: actionRows
                    });

                    const filter = (i) => i.isButton() && i.customId.match(/^[a-z]+(_[a-z]+)*$/);

                    const collectorBans = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

                    collectorBans.on('collect', async (interaction) => {
                        const mapName = interaction.customId.replace(/_/g, ' ');

                        actionRows = actionRows.map(row => {
                            const updatedComponents = row.components.map(button => {
                                if(button.data.custom_id === interaction.customId) {
                                    const updatedButtonData = { ...button.data, disabled: true };
                                    return new ButtonBuilder(updatedButtonData);
                                }
                                return button;
                            });
                    
                            return new ActionRowBuilder().addComponents(updatedComponents);
                        });

                        if (banCount >= bans) {
                            console.log("map pick");
                        }

                        await interaction.update({
                        content: `You selected ${mapName}.`, // Example confirmation message
                        components: actionRows // Optionally clear the buttons after selection
                        });

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

const embedRegistration = (team1Role, team1Member, team2Role, team2Member, description, system, bans, fp, map) => {
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


    if(fp && map){
        embed.fields.push(
            { name: `\u200b`, value: `\`First Pick\`: ${fp}`, inline: false },
            { name: ``, value: `\`Map\`: ${map}`, inline: false }
        );
    }


    return embed;
}

function createMapButton(mapName) {
    return new ButtonBuilder()
        .setCustomId(mapName.toLowerCase().replace(/\s+/g, '_'))
        .setLabel(mapName)
        .setStyle(ButtonStyle.Danger);
}