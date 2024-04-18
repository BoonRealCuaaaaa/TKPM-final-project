# Advertising Management System

This project is part of the Web Application Development Course at Ho Chi Minh City University of Science (HCMUS). It leverages the ExpressJS framework, offering a robust foundation for web application development in Node.js.

## Technologies and Tools 
- ExpressJS: Chosen for its efficiency and flexibility in web application development.
- MySQL Database: Utilized for its reliable data management capabilities.
- EJS (Embedded JavaScript templating): Employed to create dynamic and interactive user interfaces.
- MapBox: a powerful library for creating map in website
## Installation

Make sure you have installed NodeJS.

Project installation
```bash
npm install
```

For creating dummy data in database, use
```bash
npx sequelize db:create
npx sequelize db:migrate
npx sequelize db:seed:all
```
Note: You must provide username, password and database name in ./config/config.json, or you can change these config by terminal
```bash
(Get-Content "config/config.json") -replace '"username": ".*"', '"username": "{YOUR_MYSQL_USERNAME}"' | Set-Content "config/config.json"
(Get-Content "config/config.json") -replace '"password": ".*"', '"password": "{YOUR_MYSQL_PASSWORD}"' | Set-Content "config/config.json"
(Get-Content "config/config.json") -replace '"database": ".*"', '"database": "{DB_NAME_YOU_WILL_CREATE}"' | Set-Content "config/config.json"
```

## Functionality
You can read the requirement in here: [VIE](https://drive.google.com/file/d/1bl83dBL7rmoZjc-LxhwERuki9T-C1XtI/view?usp=sharing) 


## SubSystem
This is the repo for citizen system [repo](https://github.com/ntd1241/PTUDW-NguoiDan)
