import './styles/app.scss';
import './favicon.png';
import './robots.txt';

import HighMaps from 'highcharts/highmaps';
import HighCharts from 'highcharts';
import word from '@highcharts/map-collection/custom/world.geo.json';
import axios from 'axios';
import regions from '../constants/regions';
import Content from './templates/content.hbs';

class Store {
  constructor() {
    this.state = {};
  }

  getState() {
    return this.state;
  }

  isDataLoading(flag) {
    this.state.isDataLoading = flag;
    return this;
  }

  brentPrice(response) {
    const { series: [data] } = response;
    const { data: [brent] } = data;
    const [, price] = brent;
    this.state.brentPrice = price;
    return this;
  }

  wtiPrice(response) {
    const { series: [data] } = response;
    const { data: [wti] } = data;
    const [, price] = wti;
    this.state.wtiPrice = price;
    return this;
  }

  oilProduction(response) {
    const { series: [data] } = response;
    const { data: [production] } = data;
    const [, value] = production;
    const val = value / 1000.00;
    this.state.production = val.toFixed(2);
    return this;
  }

  oilConsumption(response) {
    const { series: [data] } = response;
    const { data: [consumption] } = data;
    const [, value] = consumption;
    const val = value / 1000.00;
    this.state.consumption = val.toFixed(2);
    return this;
  }

  oilProductionCountries(data) {
    this.state.oilProductionCountries = data;
    return this;
  }

  oilConsumptionCountries(data) {
    this.state.oilConsumptionCountries = data;
    this.state.topOilConsumption = data.slice(0, 3);
    return this;
  }

  productionChartData([response]) {
    const { data: points } = response;
    points.push(0);
    this.state.productionChartData = points.reverse();
    return this;
  }

  consumptionChartData([response]) {
    const { data: points } = response;
    points.push(0);
    this.state.consumptionChartData = points.reverse();
    return this;
  }

  mapChartData() {
    const data = regions.map((region) => {
      const [pdata = {}] = this.state.oilProductionCountries.filter((d) => d.code === region);
      const [cdata = {}] = this.state.oilConsumptionCountries.filter((d) => d.code === region);
      return {
        code: region,
        production: pdata.value,
        consumption: cdata.value,
        country: pdata.country
      };
    });
    return data;
  }
}

/**
 * Function render the map based on the prodcution
 * @param id
 */
const renderMapChart = (id, mapChartData) => {
  HighMaps.mapChart(id, {
    chart: {
      map: word,
      backgroundColor: '#1C1E43'
    },
    tooltip: {
      formatter() {
        return `${this.point.country}<br>
                Production: ${this.point.production}<br>
                Consumption: ${this.point.consumption}<br> thousand barrels per day`;
      }
    },
    credits: {
      enabled: false
    },
    plotOptions: {
      borderColor: '#ffffff'
    },
    mapNavigation: {
      enabled: false,
      enableDoubleClickZoomTo: false
    },
    title: {
      text: ''
    },
    legend: {
      enabled: false
    },

    colorAxis: {
      min: 1,
      max: 1000,
      type: 'logarithmic'
    },
    series: [{
      data: mapChartData,
      joinBy: ['iso-a3', 'code'],
      borderWidth: 1,
      states: {
        hover: {
          borderColor: 'black'
        }
      },
      tooltip: {
        valueSuffix: 'thousand barrels per day'
      }
    }]
  });
};

/**
 * Function to render the line chart
 * @param target
 * @returns {Chart}
 */
const renderLineChart = (target, state) => {
  let data = [];
  if (target === 'production') {
    data = state.productionChartData;
  } else if (target === 'consumption') {
    data = state.consumptionChartData;
  }

  return HighCharts.chart(target, {
    chart: {
      type: 'areaspline',
      backgroundColor: 'rgba(0,0,0,0)'
    },
    loading: {
      labelStyle: {
        color: 'white'
      },
      style: {
        backgroundColor: '#232554'
      }
    },
    title: {
      text: ''
    },
    legend: {
      enabled: false
    },
    credits: {
      enabled: false
    },
    xAxis: {
      visible: false
    },
    yAxis: {
      gridLineColor: 'rgba(89, 96, 157, 0.5)',
      labels: {
        enabled: false
      },
      title: {
        text: ''
      }
    },
    tooltip: {
      formatter() {
        return `${this.point.name} <br>
                ${new Intl.NumberFormat('en-US').format(this.point.y.toFixed())} thousand barrels per day`;
      }
    },
    plotOptions: {
      series: {
        fillColor: {
          linearGradient: [0, 0, 0, 300],
          stops: [
            [0, 'rgba(102, 199, 220, 0.5)'],
            [1, 'rgba(102, 199, 220, 0) 93.29%)']
          ]
        },
        marker: {
          enabled: false
        }
      }
    },
    series: [{
      data
    }]
  });
};

/**
 * Handler for tab click
 * @param event
 * @param productionChart
 * @param consumptionChart
 * @param tabs
 */
const tabClickHandler = (event, productionChart, consumptionChart, tabs) => {
  const { target } = event;
  const { id } = target.dataset;
  const contents = document.getElementsByClassName('chart-content');
  // eslint-disable-next-line no-restricted-syntax
  for (const content of contents) {
    content.classList.add('hide');
  }
  document.getElementById(id).classList.remove('hide');
  // Fit chart to content
  if (id === 'consumption') {
    consumptionChart.reflow();
  } else {
    productionChart.reflow();
  }
  // eslint-disable-next-line no-restricted-syntax
  for (const aTab of tabs) {
    aTab.className = 'tab inactive';
  }
  target.className = 'tab active';
};

/**
 * Init method
 */
window.addEventListener('load', () => {
  const contentSection = document.querySelector('#content');
  const store = new Store();
  // Axios client make api request
  const api = axios.create({
    baseURL: '/api',
    timeout: 20000,
    headers: { 'Access-Control-Allow-Origin': '*' }
  });
  store.isDataLoading(true);
  contentSection.innerHTML = Content({ state: store.getState() });
  (async () => {
    const [
      wtiResponse,
      brentResponse,
      production,
      consumption,
      productionAll,
      consumptionAll,
      productionByCountry,
      consumptionByCountry
    ] = await Promise.all([
      api.get('/wti/price'),
      api.get('/brent/price'),
      api.get('/oil/production'),
      api.get('/oil/consumption'),
      api.get('/oil/production/all'),
      api.get('/oil/consumption/all'),
      api.get('/AFG/production'),
      api.get('/AFG/consumption')
    ]);
    store
      .isDataLoading(false)
      .wtiPrice(wtiResponse.data)
      .brentPrice(brentResponse.data)
      .oilConsumption(consumption.data)
      .oilProduction(production.data)
      .oilProductionCountries(productionAll.data)
      .productionChartData(productionByCountry.data)
      .consumptionChartData(consumptionByCountry.data)
      .oilConsumptionCountries(consumptionAll.data);
    contentSection.innerHTML = Content({ state: store.getState() });
    ['world-map-desktop', 'world-map-mobile'].forEach((id) => renderMapChart(id, store.mapChartData()));
    const productionChart = renderLineChart('production', store.getState());
    const consumptionChart = renderLineChart('consumption', store.getState());
    consumptionChart.reflow(); // Reflow the chart to fit to content
    const tabs = document.querySelectorAll('.tab');
    // eslint-disable-next-line no-restricted-syntax
    for (const tab of tabs) {
      tab.addEventListener('click', (event) => {
        tabClickHandler(event, productionChart, consumptionChart, tabs);
      });
    }
    const elements = document.querySelectorAll('.production-country');
    // eslint-disable-next-line no-restricted-syntax
    for (const element of elements) {
      element.addEventListener('click', async ({ target }) => {
        productionChart.showLoading();
        consumptionChart.showLoading();
        const [prod, cons] = await Promise.all([api.get(`/${target.dataset.id}/production`), api.get(`/${target.dataset.id}/consumption`)]);
        store.consumptionChartData(cons.data);
        store.productionChartData(prod.data);
        productionChart.series[0].setData(store.getState().productionChartData, true);
        consumptionChart.series[0].setData(store.getState().consumptionChartData, true);
        consumptionChart.hideLoading();
        productionChart.hideLoading();
      });
    }
  })();
});
