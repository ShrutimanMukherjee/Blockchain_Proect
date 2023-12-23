# Energy Trading Platform using Ethereum Blockchain

## Members
- Chetan Patil
- Aditya Narayane
- Vedang Ranmale
- Shrutiman Mukherjee

Log In Page
![image](https://github.com/ShrutimanMukherjee/Blockchain_Proect/assets/88941689/f966c112-ce47-4696-be87-fe840f6749c9)

Dashboard with all the available facilities
- Make request for enery
- Make offer against a request for a particular price
- Simulate Consumption
- View best offer for your request and choose to accept it
![image](https://github.com/ShrutimanMukherjee/Blockchain_Proect/assets/88941689/1c43f501-8a7d-4be7-a828-6d79d3fced38)

![image](https://github.com/ShrutimanMukherjee/Blockchain_Proect/assets/88941689/5153015c-ed41-495f-9f78-5b1608dc2010)

Executing the Project
- clone the project
- terminal &rarr; `npm install` (sudo `npm install` in case of permission error)
- ensure following packages
  - ganache-cli [Installed globally i.e. `npm i -g ganache-cli` ]
  - body-parser: 1.20.2
  - express: 4.18.2
  - pug: 3.0.2
  - web3: 1.2.6 
    [!NOTE]
    The version for web3 mut be 1.2.6 only, newer versions exhibit errors at execution
- 2 terminals are needed
  - terminal1 &rarr; `ganache-cli -l 9999999 -g 1000`
  - terminal2 &rarr; navigate to project root `node server.js`
