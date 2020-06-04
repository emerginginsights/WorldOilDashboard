require('dotenv').config();
const { API_ENDPOINT } = require('../../constants/api');
const regions = require('../../constants/regions');
const axios = require('axios');

const api = axios.create({
  baseURL: process.env.BASE_URL,
  timeout: parseFloat(process.env.TIMEOUT) || 5000
});

/**
 * Get request for making the rest call to EIA gov opendata api
 * @param url
 * @returns {Promise<*>}
 */
const get = async (url, num = 1) => {
 console.info('Sending the request to EIA -' + `${url}&api_key=${process.env.API_KEY}`);
  const response = await api.get(`${url}&api_key=${process.env.API_KEY}&num=${num}`);
  const { data } = response;
  if (!data.error) {
    console.info('Response received from the EIA');
    return data;
  }
  throw new Error(response);
};

module.exports = {
  getWTIPrice: () => get(API_ENDPOINT.wtiPrice),
  getBrentPrice: () => get(API_ENDPOINT.brentPrice),
  getWorldOilProduction: (code = 'WORL', num = 1) => get(API_ENDPOINT.worldOilProduction.replace('#countryCode#', code), num),
  getWorldOilConsumption: (code = 'WORL', num = 1) => get(API_ENDPOINT.worldOilConsumption.replace('#countryCode#', code), num),
  getWorldOilProductionByCountry: () => get(`${API_ENDPOINT.oilProductionByCountry}&regions=${regions.join(';')}`),
  getWorldOilConsumptionByCountry: () => get(`${API_ENDPOINT.oilConsumptionByCountry}&regions=${regions.join(';')}`)
};
