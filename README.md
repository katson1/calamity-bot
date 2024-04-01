# 🤖 Calamity-bot
A bot who draft maps and bans for a Heroes Of The Storm [tournament](https://www.calamitygaming.com.br/heroes-of-the-storm). 


## ⌨️ Commands:

<details>
  <summary> /newmatch </summary>
  
  - Create a new match registration (bans and fp and map selection)
  
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
You need to have [node.js](https://nodejs.org/en) and [mongodb](https://www.mongodb.com/pt-br) installed.

Run this command in another terminal to start mongod:
  ```
mongod
  ```

<blockquote> 
<details>
  <summary> Click here if you're having problems with the command "mongod" (on Windows)</summary>
  <blockquote> 
   
    Reinstall MongoDB as usual and wait until Compass appears. If it doesn't, uninstall and reinstall. 
    Copy the installation path; we'll need it.
    Open a command prompt (cmd.exe) as an administrator.
    Type: cd C:\
    Then: md "\data\db"
    After that: "C:\Program Files\MongoDB\Server\4.2\bin\mongod.exe" --dbpath="c:\data\db"
    Press "CTRL+C" and close cmd.exe.
    Copy the installation path up to the "bin" folder, for example: C:\Program Files\MongoDB\Server\YOUR_MONGODB_VERSION\bin
    Go to system properties and add to the system environment variables (search on Google) in "PATH":
    Double-click on PATH in "System Environment Variables".
    Click on "New"
    Paste the copied path and click OK.
 </blockquote>
</details>
</blockquote>


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
MONGODB_CONNECT=mongodb://localhost:27017/yourDatabaseName
TOKEN=
CLIENT_ID=0123456789876543210
  ```

Now, on the **Bot** tab click on Reset Token and generate a new `Token`. (Do not share this token!)
Copy the `token` to the .env file:

The `.env` file should be like this example:
  ```.env
MONGODB_CONNECT=mongodb://localhost:27017/yourDatabaseName
TOKEN=EXAMPLE01234TOKEN
CLIENT_ID=0123456789876543210
  ```

**THIS IS A VERY IMPORTANT STEP:**

On the 'OAuth2' tab, on the session 'OAuth2 URL Generator' select `bot` and `applications.commands` then in the session 'BOT PERMISSIONS' select `Administrator` checkbox. 
This will generate the link to add the bot to a server. Paste it on a browser to add the bot to your server.

Now, run the command:
   ```js
npm start
  ```

The bot is now running, go to your server and enjoy it!
The bot can take up to 5 minutes to have the commands registered.

If you have any problems or improvements, you can contact me:

[<img src="https://img.shields.io/badge/-Gmail-FF0000?style=flat-square&labelColor=FF0000&logo=gmail&logoColor=white&link=" alt="Gmail"/></a>](mailto:katson.alves@ccc.ufcg.edu.br)
[<img src="https://img.shields.io/badge/-Linkedin-0e76a8?style=flat-square&logo=Linkedin&logoColor=white&link=" alt="LinkedIn"/></a>](https://www.linkedin.com/in/katsonmatheus/)

⭐ If you made it this far, consider giving this repository a star! ⭐
 
## Author:
- [Katson](https://github.com/katson1)
