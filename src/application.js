import onChange from 'on-change';
import * as yup from 'yup';
import i18n from 'i18next';
import ru from './locales/ru.js';
import fetchRSS from './utlis/fetch.js';
import updaterPosts from './utlis/updaterPosts.js';
import uniqueId from './utlis/uniqueId.js';
import {
  renderStatus,
  disabledSubmitBtn,
  renderFeeds,
  renderPosts,
} from './view.js';

const modalTitle = document.querySelector('.modal-title');
const modalBody = document.querySelector('.modal-body');
const modalBtn = document.querySelector('.modal-footer > .full-article');

const viewPosts = (postsList, visitedLinks) => {
  const posts = document.querySelector('.posts');

  const clickLink = (el) => {
    el.classList.remove('fw-bold');
    el.classList.add('fw-normal', 'link-secondary');
  };

  posts.addEventListener('click', (event) => {
    const eventElName = event.target.tagName;

    if (eventElName === 'A') {
      clickLink(event);
      const { id } = event.target.dataset;
      visitedLinks.add(id);
    }
    if (eventElName === 'BUTTON') {
      const { id } = event.target.dataset;
      visitedLinks.add(id);
      const currentLink = document.querySelector(`a[data-id="${id}"]`);
      clickLink(currentLink);

      const [currentPost] = postsList.filter((post) => post.id === Number(id));
      const { title, description, link } = currentPost;
      modalBtn.setAttribute('href', link);
      modalTitle.textContent = title;
      modalBody.textContent = description;
    }
  });
};

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
  });

  const formEl = document.querySelector('.rss-form');

  const watchedState = onChange(stateApp, (path, value) => {
    switch (path) {
      case 'error':
        renderStatus(path, value);
        break;
      case 'loading':
        renderStatus(path, value);
        disabledSubmitBtn(value, formEl);
        break;
      case 'feeds':
        renderStatus(path, value);
        renderFeeds(value);
        break;
      case 'posts':
        renderPosts(value, stateApp.visitedLinks);
        viewPosts(stateApp.posts, stateApp.visitedLinks);
        break;
      default:
        throw new Error(`${i18n.t('unknowError')}: ${value}`);
    }
  });

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
};

export default app;
