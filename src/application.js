import onChange from 'on-change';
import * as yup from 'yup';
import i18n from 'i18next';
import ru from './locales/ru.js';
import fetchRSS from './utlis/fetch.js';
import updaterPosts from './utlis/updaterPosts.js';
import uniqueId from './utlis/uniqueId.js';
import render from './view.js';

const app = () => {
  const stateApp = {
    feeds: [],
    posts: [],
    visitedLinks: new Set(),
    error: null,
    loading: false,
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
      render(stateApp, path, value, translate);
    });

    const formEl = document.querySelector('.rss-form');
    formEl.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const url = formData.get('url');
      watchedState.loading = true;

      schema(stateApp.feeds).validate(url)
        .then(() => fetchRSS(url))
        .then(({ feed, posts }) => {
          const postsWithId = posts.map((post) => ({ ...post, id: uniqueId() }));

          watchedState.error = null;
          watchedState.feeds.unshift({ ...feed, link: url });
          watchedState.posts.unshift(...postsWithId);
          watchedState.loading = false;

          formEl.reset();
        })
        .catch((error) => {
          watchedState.loading = false;
          watchedState.error = error.message;
        });
    });

    updaterPosts(watchedState);
  });
};

export default app;
