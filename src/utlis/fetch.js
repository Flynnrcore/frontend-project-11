import axios from 'axios';
import parseRSS from './parse.js';

const fetchRSS = (url) => {
  const newUrl = new URL('https://allorigins.hexlet.app');
  newUrl.pathname = 'get';
  newUrl.search = `disableCache=true&url=${url}`;

  return axios.get(newUrl).then((response) => parseRSS(response));
};

export default fetchRSS;
