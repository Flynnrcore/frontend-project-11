import onChange from 'on-change';
import * as yup from 'yup';
import i18n from 'i18next';
import axios from 'axios';
import ru from './locales/ru.js';

const checkValid = (url, links) => {
  const RSSshchema = yup
    .string()
    .url('notValid')
    .notOneOf(links, 'alreadyExist');

  return RSSshchema
    .validate(url)
    .then(() => 'load');
};

const fetchRSS = (url) => {
  const parser = new DOMParser();
  return axios.get(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(url)}`)
    .then((response) => parser.parseFromString(response.data.contents, 'text/xml'))
    .then((xml) => {
      const titles = Array.from(xml.querySelectorAll('title')).map((item) => item.textContent);
      const descriptions = Array.from(xml.querySelectorAll('description')).map((item) => item.textContent);
      const links = Array.from(xml.querySelectorAll('link')).map((item) => item.textContent);

      const [feedLink, ...postLinks] = links;
      const [feedName, ...postsNames] = titles;
      const [feedDescription, ...postsDescriptions] = descriptions;

      const data = {};
      data.feed = [feedName, feedDescription, feedLink];
      data.posts = postsNames
        .map((title, index) => [title, postsDescriptions[index], postLinks[index]]);

      return data;
    });
};

let uniqId = 0;

const renderFeedsAndPosts = (path, value) => {
  const feedContainer = document.querySelector('.feeds');
  const postsContrainer = document.querySelector('.posts');
  if (path === 'feed') {
    const feedCardDiv = document.createElement('div');
    feedCardDiv.classList.add('card', 'border-0');

    const feedBodyDiv = document.createElement('div');
    feedBodyDiv.classList.add('card-body');
    feedCardDiv.prepend(feedBodyDiv);

    const feedHeader = document.createElement('h2');
    feedHeader.classList.add('card-title', 'h4');
    feedHeader.textContent = i18n.t('feedTitle');
    feedBodyDiv.prepend(feedHeader);

    const listUlEl = document.createElement('ul');
    listUlEl.classList.add('list-group', 'border-0', 'rounded-0');
    feedBodyDiv.append(listUlEl);

    if (feedContainer.firstChild) {
      feedContainer.removeChild(feedContainer.firstChild);
    }

    value.forEach((feed) => {
      const [feedtitle, feedDescribe] = feed;
      const listLiclassEl = document.createElement('li');
      listLiclassEl.classList.add('list-group-item', 'border-0', 'border-end-0');
      listLiclassEl.innerHTML = `<h3 class='h6 m-0'>${feedtitle}</h3><p class='m-0 small text-black-50'>${feedDescribe}</p>`;
      listUlEl.prepend(listLiclassEl);
    });
    feedContainer.prepend(feedCardDiv);
  }
  if (path === 'posts') {
    if (postsContrainer.firstChild) {
      postsContrainer.removeChild(postsContrainer.firstChild);
    }
    const cardDivPost = document.createElement('div');
    cardDivPost.classList.add('card', 'border-0');

    const cardBodyDivPost = document.createElement('div');
    cardBodyDivPost.classList.add('card-body');
    cardDivPost.prepend(cardBodyDivPost);

    const feedHeaderPost = document.createElement('h2');
    feedHeaderPost.classList.add('card-title', 'h4');
    feedHeaderPost.textContent = i18n.t('postsTitle');
    cardBodyDivPost.prepend(feedHeaderPost);

    const listUlElPost = document.createElement('ul');
    listUlElPost.classList.add('list-group', 'border-0', 'rounded-0');
    cardBodyDivPost.append(listUlElPost);

    value.forEach((post) => {
      uniqId += 1;
      const [postTitle, , postLink] = post;
      const postLiEl = document.createElement('li');
      postLiEl.classList.add(
        'list-group-item',
        'd-flex',
        'justify-content-between',
        'alitgn=items-start',
        'border-0',
        'border-end-0',
      );
      postLiEl.innerHTML = `<a href="${postLink}" class="fw-bold" data-id="${uniqId}" target="_blank" rel="noopener noreferrer">${postTitle}</a>
      <button type="button" class="btn btn-outline-primary btn-sm" data-id="${uniqId}" data-bs-toggle="modal" data-bs-target="#modal">${i18n.t('buttonView')}</button>`;
      listUlElPost.append(postLiEl);
    });
    postsContrainer.prepend(cardDivPost);
  }
};

const app = () => {
  const stateOfForm = {
    feed: [],
    posts: [],
    links: [],
    errors: '',
    status: 'unload',
  };

  i18n.init({
    lng: 'ru',
    resources: {
      ru,
    },
  });

  const renderStatus = (path, value) => {
    const feedbackEl = document.querySelector('.feedback');
    let localePath = '';

    if (path === 'errors' && value !== '') {
      feedbackEl.classList.replace('text-success', 'text-danger');
      localePath = `errors.${stateOfForm.errors}`;
      feedbackEl.textContent = i18n.t(localePath);
    } else if (value === 'load') {
      feedbackEl.classList.replace('text-danger', 'text-success');
      localePath = `status.${stateOfForm.status}`;
      feedbackEl.textContent = i18n.t(localePath);
    }
  };

  const watchedState = onChange(stateOfForm, (path, value) => {
    if (path === 'errors') {
      renderStatus(path, value);
    } else {
      renderStatus(path, value);
      renderFeedsAndPosts(path, value);
    }
  });

  const formEl = document.querySelector('.rss-form');
  formEl.addEventListener('submit', (e) => {
    e.preventDefault();

    const promise = Promise.resolve(e);
    promise
      .then((event) => {
        const formData = new FormData(event.target);
        return formData.get('url');
      })
      .then((url) => checkValid(url, watchedState.links)
        .then((status) => {
          watchedState.status = status;
          watchedState.errors = '';
          watchedState.links.push(url);
          return url;
        }))
      .then((url) => fetchRSS(url, watchedState))
      .then((data) => {
        const { feed, posts } = data;
        watchedState.feed.unshift(feed);
        watchedState.posts.unshift(...posts);
      })
      .catch((error) => {
        watchedState.errors = error.message;
      });
  });
};

export default app;
