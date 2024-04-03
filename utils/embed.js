export const getEmbed = () => {
    
    const embed = {
        color: 0x000000,
        title: '',
        description: '',
        fields: [],
    };

    return embed;
}

export const getEmbedDev = () => {
    
    const embed = {
        color: 0x2F4F4F,
        title: '',
        description: '',
        fields: [],
        footer: {
            text: `Developed by @katson (github.com/katson1)`,
        },
    };

    return embed;
}

export const getEmbedGamesFinished = () => {
    
    const embed = {
        color: 0x000000,
        title: 'Games finished!',
        description: '',
        fields: [],
        footer: {
            text: ``,
        },
    };

    return embed;
}

export const createGamesEmbed = (matchSetup) => {
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

export const createPicksEmbed = (currentPickUser) => {
    const pickEmbed = getEmbed();
    pickEmbed.title = "Map pick:";
    pickEmbed.description = `${currentPickUser}, please select a map to play:`;
    return pickEmbed;
}

export const createStaffEmbed = () => {
    const staffEmbed = getEmbed();
    staffEmbed.title = '';
    staffEmbed.description = `Administrators, please designate the winner:`;
    return staffEmbed;
}

export const createBansEmbed = (currentBanUser) => {
    const bansEmbed = getEmbed();
    bansEmbed.title = "Map bans";
    bansEmbed.description = `${currentBanUser}, please select a map to ban:`;
    return bansEmbed;
}

export const createMapBanned = (currentBanUser, banned) => {
    const bansEmbed = getEmbed();
    bansEmbed.description = `${currentBanUser}, has banned: **${banned}**`;
    return bansEmbed;
}

export const createLoserDecisionEmbed = (currentPickUser) => {
    const pickEmbed = getEmbed();
    pickEmbed.title = "Loser decision:";
    pickEmbed.description = `${currentPickUser}, please select:`;
    return pickEmbed;
}

export const embedMention = (user, system) => {
    const embed = getEmbed();
    const userMention = `<@${user.id}>`;
    embed.description = `${userMention} have selected: **${system}**`;
    embed.footer = null;
    return embed;
}

export const newEmbedRegistration = (matchSetup, description) => {
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