import onChange from 'on-change';
import * as yup from 'yup';
import i18n from 'i18next';
import axios from 'axios';
import { renderStatus, renderFeedsAndPosts } from './renders.js';
import ru from './locales/ru.js';

const checkValid = (url, links) => {
  const shchema = yup
    .string()
    .url('notValid')
    .notOneOf(links, 'alreadyExist');

  return shchema.validate(url);
};

const fetchRSS = (url) => {
  const parser = new DOMParser();
  return axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
    .then((response) => parser.parseFromString(response.data.contents, 'text/xml'))
    .then((xml) => {
      const rss = xml.querySelector('rss');
      if (!rss) {
        throw new Error('notIncludesRSS');
      }

      const titles = Array.from(xml.querySelectorAll('title')).map((item) => item.textContent);
      const descriptions = Array.from(xml.querySelectorAll('description')).map((item) => item.textContent);
      const links = Array.from(xml.querySelectorAll('link')).map((item) => item.textContent);

      const [feedLink, ...postLinks] = links;
      const [feedName, ...postsNames] = titles;
      const [feedDescription, ...postsDescriptions] = descriptions;

      const data = {};
      data.link = url;
      data.feed = [feedName, feedDescription, feedLink];
      data.posts = postsNames
        .map((title, index) => [title, postsDescriptions[index], postLinks[index]]);

      return data;
    });
};

const app = () => {
  const stateApp = {
    feed: [],
    posts: [],
    links: [],
    errors: '',
  };

  i18n.init({
    lng: 'ru',
    resources: {
      ru,
    },
  });

  const watchedState = onChange(stateApp, (path, value) => {
    if (path === 'errors') {
      renderStatus(path, value);
    } else {
      renderStatus(path, value);
      renderFeedsAndPosts(path, value);
    }
  });

  const updatePosts = (urls) => {
    setTimeout(() => {
      urls.forEach((url) => {
        console.log(url);
        fetchRSS(url)
          .then((data) => {
            const currentTitles = stateApp.posts.map((post) => post[0]);
            const update = data.posts.filter((post) => !currentTitles.includes(post[0]));
            watchedState.posts.unshift(...update);
          });
      });
      updatePosts(urls);
    }, 5 * 1000);
  };

  const formEl = document.querySelector('.rss-form');
  formEl.addEventListener('submit', (e) => {
    e.preventDefault();

    const promise = Promise.resolve(e);
    promise
      .then((event) => {
        const formData = new FormData(event.target);
        return formData.get('url');
      })
      .then((url) => checkValid(url, watchedState.links))
      .then((url) => fetchRSS(url))
      .then((data) => {
        const { feed, posts, link } = data;
        watchedState.errors = '';
        watchedState.feed.unshift(feed);
        watchedState.posts.unshift(...posts);
        watchedState.links.push(link);
        updatePosts(stateApp.links);
      })
      .catch((error) => {
        watchedState.errors = error.message;
      });
  });
};

export default app;
