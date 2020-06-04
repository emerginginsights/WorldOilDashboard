/* eslint no-console: 0 */
require('dotenv').config(); // read .env files

const {
  getWTIPrice,
  getBrentPrice,
  getWorldOilProduction,
  getWorldOilConsumption,
  getWorldOilProductionByCountry,
  getWorldOilConsumptionByCountry
} = require('./backend/services/eia-rest-service');

const express = require('express');
const port = process.env.PORT || 3000;
const cors = require('cors')
const cron = require("node-cron");
const cache = require("memory-cache");

// configure cache middleware
const memCache = new cache.Cache();
const cacheMiddleware = () => {
  return (req, res) => {
    const key =  '__eia__' + req.originalUrl || req.url
    const cacheContent = memCache.get(key);
    if (cacheContent) {
      res.setHeader('Content-Type', 'application/json');
      res.send(cacheContent);
    }
  };
};

const errorHandler = (err, req, res) => {
  if (err.data) {
    res.status(500).send({ title: 'Server responded with an error', message: err.data.error });
  }
};

//Start the express server
const app = express();

app.use(cors())

// Serve the static content from dist folder
app.use(express.static(__dirname + '/dist'));

/**
 * Fetching the wti price
 */
app.get('/api/wti/price', cacheMiddleware());

/**
 * Fetching brent price
 */
app.get('/api/brent/price', cacheMiddleware());

/**
 *  World oil production
 */
app.get('/api/oil/production', cacheMiddleware());

/**
 * World oil consumption
 */
app.get('/api/oil/consumption', cacheMiddleware());

app.get('/api/oil/production/all', cacheMiddleware());

app.get('/api/oil/consumption/all', cacheMiddleware());

app.get('/api/:code/production', async (req, res) => {
  try {
    const { series } = await getWorldOilProduction(req.params.code, 25);
    res.setHeader('Content-Type', 'application/json');
    res.send(series);
  } catch (error) {
    errorHandler(error, req, res);
  }
});

app.get('/api/:code/consumption', async (req, res) => {
  try {
    const { series } = await getWorldOilConsumption(req.params.code, 25);
    res.setHeader('Content-Type', 'application/json');
    res.send(series);
  } catch (error) {
    errorHandler(error, req, res);
  }
});

const processData = (goeset, sort) => {
  let results = []
  for (const property in goeset) {
    const { series_id, region, name, data } = goeset[property];
    const value = new Intl.NumberFormat('en-US').format(data[0][1].toFixed());
    const country = name.split(',')[1];
    results.push({ series_id, code: region, rawVal: data[0][1], value: value < 0 ? 0 : value, country });
  }
  if(sort) {
    results = results.sort((value1, value2) => value2.rawVal - value1.rawVal);
  }
  return results;
}

/**
 * Preload required data to display
 * @returns {Promise<void>}
 */
const loadData = async () => {
  const [wtiResponse, brentResponse, production, consumption, productionAll, consumptionAll] = await Promise.all([
    getWTIPrice(),
    getBrentPrice(),
    getWorldOilProduction(),
    getWorldOilConsumption(),
    getWorldOilProductionByCountry(),
    getWorldOilConsumptionByCountry()
  ]);
  await memCache.put('__eia__/api/brent/price', brentResponse);
  await memCache.put('__eia__/api/wti/price', wtiResponse);
  await memCache.put('__eia__/api/oil/production', production);
  await memCache.put('__eia__/api/oil/consumption', consumption);
  await memCache.put('__eia__/api/oil/production/all', processData(productionAll.geoset.series));
  await memCache.put('__eia__/api/oil/consumption/all', processData(consumptionAll.geoset.series, true));
}

/**
 * Refreshing the in memory cache every 3 hours
 */
cron.schedule("0 */3 * * *",  async function() {
  console.info('Refreshing the cache started');
  try {
    await loadData();
  } catch(error) {
    console.error('Error while updating the cache', error)
  }
  console.info('Refreshing the cache completed');
});

(async () => {
  await loadData();
  app.listen(process.env.PORT || 3000, '0.0.0.0', function onStart(err) {
    if (err) {
      console.log(err);
    }
    console.info('==> 🌎 Listening on port %s. Open up http://0.0.0.0:%s/ in your browser.', port, port);
  });
})();
