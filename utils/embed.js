const createEmbed = ({ color = 0x000000, title = '', description = '', footerText = '' } = {}) => {
    const embed = {
        color,
        title,
        description,
        fields: [],
    };

    if (footerText) {
        embed.footer = { text: footerText };
    }

    return embed;
};

export const getEmbed = () => { return createEmbed(); };

export const getEmbedDev = () => {
    return createEmbed({
        color: 0x2F4F4F,
        footerText: 'Developed by @katson (github.com/katson1)'
    });
};

export const getEmbedGamesFinished = () => {
    return createEmbed({
        title: 'Games finished!',
    });
};


export const createGamesEmbed = (matchSetup) => {
    const gamesEmbed = createEmbed({
        title: `Games:`,
        description: `${matchSetup.mode}: \`${matchSetup.team1Controller.wins} - ${matchSetup.team2Controller.wins}\``,
    });
    
    matchSetup.games.forEach((game, index) => {
        gamesEmbed.fields.push(
            { name: `\u200b`, value: ``, inline: false },
            { name: `Game \`${index + 1}\`:`, value: ``, inline: false }
        );
        if (game.progress == 1 || game.progress == 2) {
            gamesEmbed.fields.push(
                { name: ``, value: `**Map:** \`${game.mapPlayed}\``, inline: false },
                { name: ``, value: `**First Pick:** \`${game.fp.name}\``, inline: false }
            );
        } else {
            if(game.fp){
                gamesEmbed.fields.push(
                    { name: ``, value: `**Map:** \`${game.mapPlayed}\``, inline: false },
                    { name: ``, value: `**First Pick:** \`${game.fp.name}\``, inline: false },
                    { name: ``, value: `**Winner:** ${game.winner}`, inline: false },
                );
            } else {
                gamesEmbed.fields.push(
                    { name: `Upper Finals Winner`, value: ``, inline: false },
                    { name: ``, value: `**Team 1:** ${game.winner}`, inline: false },
                );
            }
        }
    });

    return gamesEmbed;
}

export const createPicksEmbed = (currentPickUser) => {
    return createEmbed({
        title: "Map pick:",
        description: `${currentPickUser}, please select a map to play:`,
    });
}

export const createCancelEmbed = () => {
    return createEmbed({
        title: "Oops... match canceled",
    });
}

export const createStaffEmbed = () => {
    return createEmbed({
        description: 'Administrators, please designate the winner:',
    });
}

export const createBansEmbed = (currentBanUser) => {
    return createEmbed({
        title: "Map bans",
        description: `${currentBanUser}, please select a map to ban:`,
    });
}

export const createMapBanned = (currentBanUser, banned) => {
    return createEmbed({
        description: `${currentBanUser}, has banned: **${banned}**`,
    });
}
export const createLoserDecisionEmbed = (currentPickUser) => {
    return createEmbed({
        title: "Loser decision:",
        description: `${currentPickUser}, please select:`,
    });
}

export const embedMention = (user, system) => {
    const userMention = `<@${user.id}>`;
    return createEmbed({
        description: `${userMention} have selected: **${system}**`,
    });
}

export const newEmbedRegistration = (matchSetup, description) => {
    let embedDescription = description === 1
        ? `Captains, click \`join\` to represent your team.`
        : `Teams ready!`;

    const embed = createEmbed({
        title: `Match: **${matchSetup.team1Controller.role.name}** vs **${matchSetup.team2Controller.role.name}**`,
        description: embedDescription,
    });

    const team1Status = matchSetup.team1Controller.user
        ? `<@&${matchSetup.team1Controller.role.id}> (captain: <@${matchSetup.team1Controller.user.id}>)`
        : `<@&${matchSetup.team1Controller.role.id}> (Waiting for captain)`;
    const team2Status = matchSetup.team2Controller.user
        ? `<@&${matchSetup.team2Controller.role.id}> (captain: <@${matchSetup.team2Controller.user.id}>)`
        : `<@&${matchSetup.team2Controller.role.id}> (Waiting for captain)`;

    embed.fields.push(
        { name: `\`${matchSetup.mode}\` - bans: \`${matchSetup.bans}\``, value: ` `, inline: false },
        { name: 'Team 1', value: team1Status, inline: true },
        { name: 'Team 2', value: team2Status, inline: true },
    );

    if (matchSetup.team1Controller.tosscoin_fp || matchSetup.team2Controller.tosscoin_fp) {
        let firstPickTeam = matchSetup.getTeamFp();
        let mapPickTeam = matchSetup.getTeamMap();
        embed.fields.push(
            { name: `\u200b`, value: ` `, inline: false },
            { name: `Toss coin:`, value: `**First Pick:** \`${firstPickTeam.role.name} (${firstPickTeam.user.globalName})\``, inline: false },
            { name: ` `, value: `**Map:** \`${mapPickTeam.role.name} (${mapPickTeam.user.globalName})\``, inline: false },
            { name: `\u200b`, value: ` `, inline: false }
        );
    }

    if (matchSetup.team1Controller.mapsBanned.length > 0) {
        const mapsBannedString = matchSetup.team1Controller.mapsBanned.join(', ');
        embed.fields.push(
            { name: `${matchSetup.team1Controller.role.name} bans:`, value: `\`${mapsBannedString}\``, inline: true }
        );
    }

    if (matchSetup.team2Controller.mapsBanned.length > 0) {
        const mapsBannedString = matchSetup.team2Controller.mapsBanned.join(', ');
        embed.fields.push(
            { name: `${matchSetup.team2Controller.role.name} bans:`, value: `\`${mapsBannedString}\``, inline: true }
        );
    }

    return embed;
}