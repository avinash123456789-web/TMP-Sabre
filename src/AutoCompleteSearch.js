import React, { useState, useEffect } from "react";
import axios from "axios";
import _ from "lodash";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import FlightIcon from '@mui/icons-material/Flight';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import TramIcon from '@mui/icons-material/Tram';
const categories = ["CITY", "LOCATION", "AIR", "RAIL", "POI"];
const iconMapping = {
    AIR: <FlightIcon />,
    LOCATION: <LocationOnIcon />,
    RAIL: <TramIcon />,
  };
const AutocompleteSearch = () => {
  const [query, setQuery] = useState("");
  const [list, setList] = useState([]);
  const [debounceTimeout, setDebounceTimeout] = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (query.length === 0) {
      setList([]);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `http://34.219.107.247/hotel/autocomplete?query=${query}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization:
                "Bearer T1RLAQKt8dbhclzh1QxHdpO9ENXqYCtYgGvj5JZJDf/HQED8whCblUoi4F7BYsW/pWGN/zMOAADQlfeOD5jQfp3DTiLTDJgh7LKjGT3LGuzi1m6vI+ty4VHU7mxwAKE61TywKQLVWJLWnkuKiLV4/x2xCy2tQEDLi9cGZzd9knnHZJ1zqLvSffyXO/W6wSIK6bKnOjqBhyHe658TsHHaP6RjKAUQ1PHcIHhhxEi4hA1brqtEIyyoL2Sa7JUowP2CMNSvrVZdBLRRYAqIs/1BsGvV+jxwsIDa65jOhOsMSExe6+mXji8jhMGiKpnGyBj4F+pEXH4+5WXLxwYXYThjXtRcgHIuuAt1Bw**",
            },
          }
        );
        const processCategoryDocs = (docs) => {
          return _.map(docs, (doc) => ({
            type: doc.category,
            name: doc.name,
            full_name: `${doc.name}, ${doc.stateName || ""}`.trim(),
            country_code: doc.country,
            countryName : doc.countryName,
          }));
        };

        const responseData = _.chain(categories)
          .map(
            (category) =>
              response?.data?.data?.grouped?.[`category:${category}`]?.doclist
                .docs
          )
          .compact()
          .flatMap(processCategoryDocs)
          .value();
        setList(responseData);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
      setLoading(false);
    };

    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    const newDebounceTimeout = setTimeout(fetchData, 300);
    setDebounceTimeout(newDebounceTimeout);

    return () => {
      clearTimeout(newDebounceTimeout);
    };
  }, [query]);

  const handleInputChange = (event, value) => {
    setQuery(value);
  };
console.log(list)

  return (
    <Autocomplete
      freeSolo
      options={list}
      getOptionLabel={(option) => option.name}
      loading={loading}
      onInputChange={handleInputChange}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search"
          variant="outlined"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <li {...props}>
          <div className="suggestion-icon">
          {iconMapping[option.type] || "📍"}
          </div>
          <div className="suggestion-details">
            <div className="suggestion-name">{option?.name}</div>
            <div className="suggestion-location">{option.countryName}</div>
          </div>
        </li>
      )}
    />
  );
};

export default AutocompleteSearch;
