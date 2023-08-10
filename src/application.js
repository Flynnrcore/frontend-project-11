import onChange from 'on-change';
import * as yup from 'yup';
import i18n from 'i18next';
import ru from './locales/ru.js';
import fetchRSS from './utils/fetch.js';
import parseRSS from './utils/parse.js';
import updaterPosts from './utils/updaterPosts.js';
import uniqueId from './utils/uniqueId.js';
import render from './view.js';

const app = () => {
  const stateApp = {
    feeds: [],
    posts: [],
    visitedLinks: new Set(),
    error: null,
    loading: false,
  };

  const elements = {
    statusBar: document.querySelector('.feedback'),
    form: document.querySelector('.rss-form'),
    formSubmitBtn: document.querySelector('.rss-form button'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
    modal: {
      title: document.querySelector('.modal-title'),
      body: document.querySelector('.modal-body'),
      btn: document.querySelector('.modal-footer > .full-article'),
    },
  };

  const schema = (feeds) => yup
    .string()
    .required('notEmpty')
    .url('notValid')
    .notOneOf(feeds.map((feed) => feed.link), 'alreadyExist');

  i18n.init({
    lng: 'ru',
    resources: {
      ru,
    },
  }).then((translate) => {
    const watchedState = onChange(stateApp, (path, value) => {
      render(elements, stateApp, path, value, translate);
    });

    elements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const url = formData.get('url');
      watchedState.loading = true;

      schema(stateApp.feeds).validate(url)
        .then(() => fetchRSS(url))
        .then(({ data }) => parseRSS(data.contents))
        .then(({ feed, posts }) => {
          const postsWithId = posts.map((post) => ({ ...post, id: uniqueId() }));

          watchedState.error = null;
          watchedState.feeds.unshift({ ...feed, link: url });
          watchedState.posts.unshift(...postsWithId);
          watchedState.loading = false;
        })
        .catch((error) => {
          watchedState.loading = false;
          watchedState.error = error.message;
        });
    });

    elements.posts.addEventListener('click', ({ target }) => {
      if (target.tagName === 'A' || target.tagName === 'BUTTON') {
        const { id } = target.dataset;
        watchedState.visitedLinks.add(id);
      }
    });

    updaterPosts(watchedState);
  });
};

export default app;
