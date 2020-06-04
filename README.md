# Dashboard
A modern dashboard for world oil production and consumption

## How to run the dashaboard
1. Open the terminal
2. Navigate to the root of the folder where you have downloaded code

## Run production build locally
```
1. npm install
3. create .env inside rout of project and add following content
API_KEY=c10de4f134f66672b5c80ff6c0eda8c4
BASE_URL=https://api.eia.gov
PORT=3000
TIMEOUT=5000
APP_URL=localhost:3000
2. npm start
```

## How to change the API
```
1. Navigate constants folder
2. Open api.js,which has the following content
    API_ENDPOINT: {
        brentPrice: '/series?series_id=PET.RBRTE.D',
        wtiPrice: '/series?series_id=PET.RWTC.D',
        worldOilProduction: '/series?series_id=INTL.53-1-#countryCode#-TBPD.A', // #countryCode# will be replaced
        worldOilConsumption: '/series?series_id=INTL.5-2-#countryCode#-TBPD.A',
        oilProductionByCountry: '/geoset?geoset_id=INTL.53-1-TBPD.A',
        oilConsumptionByCountry: '/geoset?geoset_id=INTL.5-2-TBPD.A'
    }
3. Update the required API, (key is the UI mapping)
4. Restart the server
```
### Project Structure
#### server.js
Express server act as a proxy between ``api.eia.gov`` and ui also it serves the static content
#### build
Build folder contains the webpack configuration files.
#### frontend
Frontend code contains the UI code. All the UI markups stored inside template folder. Style has been defined inside `styles` folder.
#### backend
Backend folder contains the code related to backend
