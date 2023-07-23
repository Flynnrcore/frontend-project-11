import onChange from 'on-change';
import * as yup from 'yup';
import i18n from 'i18next';
import axios from 'axios';
import { renderStatus, renderFeedsAndPosts } from './renders.js';
import ru from './locales/ru.js';

const checkValid = (url, links) => {
  const shchema = yup
    .string()
    .required('notEmpty')
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

const modalTitle = document.querySelector('.modal-title');
const modalBody = document.querySelector('.modal-body');
const modalBtn = document.querySelector('.modal-footer > .full-article');

const renderModal = (element, post, visitedLinks) => {
  const link = element.querySelector('a');
  const btn = element.querySelector('button');
  const [postTitle, postDescribe, postLink] = post;

  const clickLink = (el) => {
    el.classList.remove('fw-bold');
    el.classList.add('fw-normal', 'link-secondary');
  };

  link.addEventListener('click', (e) => {
    clickLink(link);
    const { id } = e.target.dataset;
    visitedLinks.push(id);
  });

  btn.addEventListener('click', (e) => {
    const { id } = e.target.dataset;
    visitedLinks.push(id);
    modalBtn.setAttribute('href', postLink);
    modalTitle.textContent = postTitle;
    modalBody.textContent = postDescribe;
  });
};

const app = () => {
  const stateApp = {
    feed: [],
    posts: [],
    links: [],
    visitedLinks: [],
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
      renderFeedsAndPosts(path, value, renderModal, stateApp.visitedLinks);
    }
  });

  let uniqueID = 1;

  const updatePosts = (url) => {
    setTimeout(() => {
      fetchRSS(url)
        .then((data) => {
          const currentTitles = stateApp.posts.map((post) => post[0]);
          const update = data.posts
            .filter((post) => !currentTitles.includes(post[0]))
            .map((post) => {
              uniqueID += 1;
              return [...post, uniqueID];
            });
          watchedState.posts.unshift(...update);
        })
        // eslint-disable-next-line no-unused-vars
        .catch((_error) => {
        });
      updatePosts(url);
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
        const postsWithID = posts.map((post) => {
          uniqueID += 1;
          return [...post, uniqueID];
        });

        watchedState.errors = '';
        watchedState.feed.unshift(feed);
        watchedState.posts.unshift(...postsWithID);
        watchedState.links.push(link);

        updatePosts(link, watchedState);
      })
      .catch((error) => {
        watchedState.errors = error.message;
      });
  });
};

export default app;
