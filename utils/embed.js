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
        color: 0x000000,
        title: '',
        description: '',
        fields: [],
        footer: {
            text: `Developed by @katson (github.com/katson1)`,
        },
    };

    return embed;
}