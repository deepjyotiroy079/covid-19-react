import { FormControl, Select, MenuItem, Card, CardContent } from '@material-ui/core';
import React, { useState, useEffect } from 'react';
import './App.css';
import InfoBox from './components/InfoBox';
import Map from './components/Map';
import Table from './components/Table';
import LineGraph from './components/LineGraph';
import 'leaflet/dist/leaflet.css';
import numeral from "numeral";
import { sortData, prettyPrintStat } from './utils';
// import { Map } from 'react-leaflet';

function App() {

  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState('worldwide');
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [casesType, setCasesType] = useState("cases");
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapCountries, setMapCountries] = useState([]);
  const [mapZoom, setMapZoom] = useState(3);

  useEffect(() => {
    fetch('http://disease.sh/v3/covid-19/all')
          .then((response) => response.json())
          .then((data) => {
            setCountryInfo(data)
          })
  }, [])
  // http://disease.sh/v3/covid-19/countries/

  useEffect(() => {
    // create async function
    const getCountriesData = async () => {
      await fetch('https://disease.sh/v3/covid-19/countries')
                  .then((response) => response.json())
                  .then((data) => {
                    const countries = data.map((country) => ({
                      name: country.country,
                      value: country.countryInfo.iso2,
                    }));
                    
                    const sortedData = sortData(data);
                    setTableData(sortedData);
                    setMapCountries(data);
                    setCountries(countries);
                  });
    };

    getCountriesData();
  }, []);

  // console.log("actual data -> ",data);
  console.log("Map countries ->", mapCountries);

  const onCountryChange = async (event) => {
    const code = event.target.value;
    setCountry(code);

    const url = code === "worldwide" ? `http://disease.sh/v3/covid-19/all`:`http://disease.sh/v3/covid-19/countries/${code}`;
    console.log(code);
    await fetch(url)
                .then(response => response.json())
                .then((data) => {
                  setCountry(code);
                  setCountryInfo(data);
                  setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
                  setMapZoom(4);
                });
  };

  // console.log(countryInfo);

  return (
    <div className="app">
      <div className="app_left">
        <div className="app_header">
          <h1>Covid-19 tracker</h1>
          <FormControl className="app_dropdown">
            <Select variant="outlined" value={country} onChange={onCountryChange}>
              {/* Loop through all the countries */}
              <MenuItem value="worldwide">worldwide</MenuItem>
              {countries.map((country) => (
                <MenuItem value={country.value}>{country.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <div className="app_stats">
          {/* INFO BOXES */}
          <InfoBox
            onClick={(e) => setCasesType("cases")}
            title="Coronavirus Cases"
            isRed
            active={casesType === "cases"}
            cases={prettyPrintStat(countryInfo.todayCases)}
            total={numeral(countryInfo.cases).format("0.0a")}
          />
          <InfoBox
            onClick={(e) => setCasesType("recovered")}
            title="Recovered"
            active={casesType === "recovered"}
            cases={prettyPrintStat(countryInfo.todayRecovered)}
            total={numeral(countryInfo.recovered).format("0.0a")}
          />
          <InfoBox
            onClick={(e) => setCasesType("deaths")}
            title="Deaths"
            isRed
            active={casesType === "deaths"}
            cases={prettyPrintStat(countryInfo.todayDeaths)}
            total={numeral(countryInfo.deaths).format("0.0a")}
          />
        </div>

        {/* MAP */}
        <Map
          countries={mapCountries}
          casesType={casesType}
          center={mapCenter}
          zoom={mapZoom}
        />
        
      </div>

      <Card className="app_right">
          <CardContent className="">
            <div className="app__information">
              <h3>Live Cases by Country</h3>
              <Table countries={tableData} />
              <h3>Worldwide new {casesType}</h3>
              <LineGraph casesType={casesType} />
            </div>
          </CardContent>
      </Card>
    </div>
  );
}

export default App;
