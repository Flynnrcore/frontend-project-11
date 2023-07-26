import axios from 'axios';
import parseRSS from './parse.js';

const fetchRSS = (url) => {
  const parser = new DOMParser();
  const newUrl = new URL(`https://allorigins.hexlet.app/get?disableCache=true&url=${url}`);
  return axios.get(newUrl)
    .then((response) => parser.parseFromString(response.data.contents, 'text/xml'))
    .then((xml) => parseRSS(xml));
};

export default fetchRSS;
