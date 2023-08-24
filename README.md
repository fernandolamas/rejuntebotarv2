# rejuntebotarv2

A project made for the Team Fortress Classic Argentina community

**Purpose**

<p>
A small community from Team Fortress Classic Argentina were playing competitive games, in each of these games they must have a captain fighting to choose first, and then, choosing the whole team on each turn.

With this system, they wouldn't have to waste more time choosing players, maps, or server to be played.

This bot makes a queue from people who !adds on the discord channel, and once it filled to the maximum number, it chooses random players on each team (Team red and team blue)

It allows the players to vote for a list of random maps (which weren't played before)

Once finished voting, it provides a link to the current server where they will be playing.
</p>


**Resources**

The project was made using:
- Nodejs
- NPM packages 
- Json files to save the execution data.

This program also uses a MYSQL database, creation sql will be available soon


**Pre-requisites**

Please make sure you have the pre-requisited steps before doing the installation

1. Install Node JS v14 or latest

2. Install NPM if you didn't do it during the Nodejs install

3. Make sure you have Node JS and NPM working in your system enviroment (IE: You can access to Node, using "node" in your system terminal)


**Installation**

In order to have the discord bot installed and working, follow these steps

1. Clone or fork the repository at https://github.com/fernandolamas/rejuntebotarv2.git

2. Open your system terminal inside the project, where package.json is located

3. Type in your terminal "npm install"
   
4. Write a token for your discord bot in the file named token.json inside the config folder 

5. Try to run the project from a terminal using the command "node ." without quotes

6. If any json is missing, you can use the examples provided in the project to create your own files with the right credentials, ie: discord token credentials
