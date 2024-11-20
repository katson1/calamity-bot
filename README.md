# 🤖 Calamity-bot
A Discord bot that drafts maps and bans for a game (Heroes of the Storm) [tournament](https://www.calamitygaming.com.br/heroes-of-the-storm). 

![](https://github.com/katson1/calamity-bot/blob/master/utils/assets/preview.gif)

## ⌨️ Commands:

<details>
  <summary> /newmatch </summary>
  
  - Create a new match registration (bans, fist picks and map).
  
    * options:

        > The sequence in which teams are selected only impact the game when is selected a bo7 system, the team_1 will recieve the advantage setted on /config command.
        
        - system - Select a match system ex.: (Bo3, Bo5).
        - team1 - Select the first team role from discord server.
        - team2 - Select the second team role from discord server.
        
</details>

<details>
  <summary> /help </summary>
  
  - Display the commands descriptions.
</details>

<details>
  <summary> /config </summary>
  
  - This command allows you to configure or retrieve settings for the bot.

    To view the current settings, select the `setting` you wish to inspect, and leave the `value` option blank.

    **Map setting instruction:**
    To set map preferences, use the setting command followed by the desired maps enclosed in spaces. For example: Sky Alterac Cursed. Each map should be listed separately. Note that maps must be specified by a single name.
    
    **Roles setting instruction:**
    To set admin roles, use the setting command followed by the desired roles enclosed in spaces. For example: admin adm staff. Note that roles must be specified by a single name. (The role named 'adm' serves as the bot's default setting).
    
    **Bo7 setting instruction:**
    Modify the format of the Bo7 system for tournaments. If your tournament utilizes the Upper Finals Winner configuration, you can adjust the advantage given to the winning team.
    
    Using the setting Bo7 command, you can specify:
    
      - **map:** Automatically sets the toss coin winner to **team_1**. (default)
      - **game:** Sets the first game win to **team_1**.
      - **none:** Remove bo7 configuration.
</details>

## 📦 How to use:
You need to have [node.js](https://nodejs.org/en) installed and a [Discord](https://discord.com/) account.

Clone the project and enter the project folder.

Install required packages into the project:
  ```bash
npm install
  ```

Copy the .env.example file to **.env** file on the project:
  ```.bash
cp .env.example .env
  ```

Now, you need to create a bot in the [discord developer portal](https://discord.com/developers/applications).
Click on **New Application** and give it a cool name.
On the **General Information** tab copy the APPLICATION ID and past on the CLIENT_ID variable on .env file, like this example: 

  ```.env
TOKEN=
CLIENT_ID=0123456789876543210
  ```

Now, at the **Bot** tab, click on "Reset Token" to generate a new `token`. 
Copy the `token` to the .env file:
> Remember, it's crucial not to share this token with anyone else.

The `.env` file should be like this example:
  ```.env
TOKEN=EXAMPLE01234TOKEN
CLIENT_ID=0123456789876543210
  ```

**THIS IS A VERY IMPORTANT STEP:**

On the '**OAuth2**' tab, under the '**OAuth2 URL Generator**' session, select **bot** and **applications.commands**. Then, in the 'BOT PERMISSIONS' section, check the **Administrator** checkbox. This will generate the link to add the bot to a server. Simply paste the generated link into your browser to add the bot to your server.

Now, run the command:
   ```js
npm start
  ```

The bot is now up and running! Head over to your server and enjoy it!

Notice: The bot may take up to 5 minutes to register the commands.


## Author:
<div align="left">
  <div>
    Katson Matheus
    <a href="https://github.com/katson1">
      <img src="https://skillicons.dev/icons?i=github" alt="html" height="15" />
    </a>
    <a href="https://discordapp.com/users/210789016675549184">
      <img src="https://skillicons.dev/icons?i=discord" alt="html" height="15"/>
    </a>
    <a href="mailto:katson.alves@ccc.ufcg.edu.br">
      <img src="https://skillicons.dev/icons?i=gmail" alt="html" height="15"/>
    </a>
  </div>
</div>
