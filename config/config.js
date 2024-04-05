import { promises as fs } from 'fs';

const configPath = './config/config.json';

async function readConfig() {
    try {
        const data = await fs.readFile(configPath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading the config file:', err);
        return null;
    }
}

async function modifyMap(newList) {
    try {
        const config = await readConfig();
        config.maps = newList;
        await fs.writeFile(configPath, JSON.stringify(config, null, 2));
        console.log('List successfully modified!');
    } catch (err) {
        console.error('Error modifying the list:', err);
    }
}

async function modifyBo7(newRule) {
    try {
        const config = await readConfig();
        config.bo7 = newRule;
        await fs.writeFile(configPath, JSON.stringify(config, null, 2));
        console.log('List successfully modified!');
    } catch (err) {
        console.error('Error modifying the list:', err);
    }
}

async function modifyRoles(newList) {
    try {
        if (newList.length == 0) {
            newList.push('adm');
        }
        const config = await readConfig();
        config.roles = newList;
        await fs.writeFile(configPath, JSON.stringify(config, null, 2));
        console.log('List successfully modified!');
    } catch (err) {
        console.error('Error modifying the list:', err);
    }
}

async function getMaps() {
    try {
        const config = await readConfig();
        return config.maps;
    } catch (err) {
        console.error('Error getting the list:', err);
        return [];
    }
}

async function getBo7() {
    try {
        const config = await readConfig();
        return config.bo7;
    } catch (err) {
        console.error('Error getting the list:', err);
        return [];
    }
}

async function getRoles() {
    try {
        const config = await readConfig();
        return config.roles;
    } catch (err) {
        console.error('Error getting the list:', err);
        return [];
    }
}

export { getMaps, getBo7, getRoles, modifyMap, modifyBo7, modifyRoles };