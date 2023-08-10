import axios from 'axios';

const fetchRSS = (url) => {
  const newUrl = new URL('https://allorigins.hexlet.app');
  newUrl.pathname = 'get';
  newUrl.search = `disableCache=true&url=${url}`;

  return axios.get(newUrl);
};

export default fetchRSS;
