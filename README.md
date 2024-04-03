# 🤖 Calamity-bot
A bot who draft maps and bans for a Heroes Of The Storm [tournament](https://www.calamitygaming.com.br/heroes-of-the-storm). 


## ⌨️ Commands:

<details>
  <summary> /newmatch </summary>
  
  - Create a new match registration (bans, fist picks and map selection).
  
    * options:

        > The sequence in which teams are selected won't impact the game.
        
        - system - Select a match system ex.: (Bo3, Bo5).
        - team1 - Select the first team role from discord server.
        - team2 - Select the second team role from discord server.
        
</details>

<details>
  <summary> /help </summary>
  
  - Display the command descriptions.
</details>


## 📦 How to use:
You need to have [node.js](https://nodejs.org/en).

Clone the project and enter the project folder.

Install required packages into the project:
  ```bash
npm install
  ```

Now copy the .env.example file to **.env** file to the project:
  ```.bash
copy .env.example .env
  ```

Now, you need to create a bot in the [discord developer portal](https://discord.com/developers/applications).
Click on New Applcation and give it a cool name.
On the **General Information** tab copy the APPLICATION ID and past on the CLIENT_ID variable on .env file, live this example: 

  ```.env
TOKEN=
CLIENT_ID=0123456789876543210
  ```

Now, on the **Bot** tab, click on "Reset Token" to generate a new `Token`. Remember, it's crucial not to share this token with anyone else.
Copy the `token` to the .env file:

The `.env` file should be like this example:
  ```.env
TOKEN=EXAMPLE01234TOKEN
CLIENT_ID=0123456789876543210
  ```

**THIS IS A VERY IMPORTANT STEP:**

On the 'OAuth2' tab, under the 'OAuth2 URL Generator' session, select bot and **applications.commands**. Then, in the 'BOT PERMISSIONS' section, check the **Administrator** checkbox. This will generate the link to add the bot to a server. Simply paste the generated link into your browser to add the bot to your server.

Now, run the command:
   ```js
npm start
  ```

Once it's running, you can add the bot to multiple servers, and it will work seamlessly on all of them.
The bot is now up and running! Head over to your server and enjoy it!
The bot may take up to 5 minutes to register the commands.

If you encounter any issues or have suggestions for improvements, feel free to contact me at any time:

[<img src="https://img.shields.io/badge/-Gmail-FF0000?style=flat-square&labelColor=FF0000&logo=gmail&logoColor=white&link=" alt="Gmail"/></a>](mailto:katson.alves@ccc.ufcg.edu.br)
[<img src="https://img.shields.io/badge/-Linkedin-0e76a8?style=flat-square&logo=Linkedin&logoColor=white&link=" alt="LinkedIn"/></a>](https://www.linkedin.com/in/katsonmatheus/)

⭐ If you've made it this far, please consider giving this repository a star! ⭐
 
## Author:
- [Katson](https://github.com/katson1)
