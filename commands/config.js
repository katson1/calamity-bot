import { SlashCommandBuilder } from "discord.js";
import { getEmbed, getEmbedDev } from "../utils/embed.js";
import { modifyMap, modifyBo7, modifyRoles, getRoles, getBo7, getMaps } from "../config/config.js";

export default {
    data: new SlashCommandBuilder()
        .setName("config")
        .setDescription("Set or get bot configs.")
        .addStringOption(option =>
            option.setName('setting')
                .setDescription('Select the config setting')
                .setRequired(true)
                .addChoices(
                    { name: 'Maps', value: 'maps' },
                    { name: 'Bo7', value: 'bo7' },
                    { name: 'Roles', value: 'roles' },
                )
        )
        .addStringOption(option =>
            option.setName('value')
                .setDescription('Select the value setting')
        ),

    async execute(interaction) {
        const devEmbed = getEmbedDev();
        devEmbed.color = 0x2F4F4F;
        const configEmbed = getEmbed();
        configEmbed.color = 0x2F4F4F;
        configEmbed.title = 'Config';

        const setting = interaction.options.getString('setting');
        const value = interaction.options.getString('value');

        const member = interaction.guild.members.cache.get(interaction.user.id);
        const allowedRoles = await getRoles();

        if (!member.roles.cache.some(role => allowedRoles.includes(role.name.toLowerCase()))) {
            await interaction.reply({
                content: "Only admin roles can use /config!",
                ephemeral: true
            });
            return;
        }

        if (setting == 'maps' && value) {
            const mapList = value.split(' ')
            const mapQuotes = value.replace(/\s+/g, ', ')
            modifyMap(mapList);
            configEmbed.fields.push(
                {
                    name: `Maps updated!`,
                    value: mapQuotes,
                    inline: false,
                }
            );
        }
        
        if (setting == 'bo7' && value) {
            const newValueBo7 = value.trim().toLowerCase()
            modifyBo7(newValueBo7);
            configEmbed.fields.push(
                {
                    name: `Bo7 setting updated!`,
                    value: newValueBo7,
                    inline: false,
                }
            );
        }
        
        
        if (setting == 'roles' && value) {
            const rolesList = value.split(' ')
            const rolesQuotes = value.replace(/\s+/g, ', ')
            modifyRoles(rolesList);
            configEmbed.fields.push(
                {
                    name: `Roles updated!`,
                    value: rolesQuotes,
                    inline: false,
                }
            );
        }

        if (setting == 'maps' && !value) {
            const maps = await getMaps();
            configEmbed.fields.push(
                {
                    name: `Current maps:`,
                    value: maps.join(", "),
                    inline: false,
                }
            );
        }
        
        if (setting == 'bo7' && !value) {
            configEmbed.fields.push(
                {
                    name: `Current Bo7 setting:`,
                    value: await getBo7(),
                    inline: false,
                }
            );
        }

        if (setting == 'roles' && !value) {
            const roles = await getRoles();
            configEmbed.fields.push(
                {
                    name: `Current roles:`,
                    value: roles.join(", "),
                    inline: false,
                }
            );
        }

        await interaction.reply({ embeds: [configEmbed, devEmbed] });
    }
};