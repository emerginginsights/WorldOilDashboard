module.exports = {
  API_ENDPOINT: {
    brentPrice: '/series?series_id=PET.RBRTE.D',
    wtiPrice: '/series?series_id=PET.RWTC.D',
    worldOilProduction: '/series?series_id=INTL.53-1-#countryCode#-TBPD.A', // #countryCode# will be replaced
    worldOilConsumption: '/series?series_id=INTL.5-2-#countryCode#-TBPD.A',
    oilProductionByCountry: '/geoset?geoset_id=INTL.53-1-TBPD.A',
    oilConsumptionByCountry: '/geoset?geoset_id=INTL.5-2-TBPD.A'
  }
};
