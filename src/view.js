const renderStatus = (path, value, i18nextLib) => {
  const feedbackEl = document.querySelector('.feedback');
  let localePath = '';

  if (path === 'error' && value !== null) {
    feedbackEl.classList.replace('text-success', 'text-danger');
    localePath = `error.${value}`;
    feedbackEl.textContent = i18nextLib(localePath);
  } else if (path === 'loading' && value === true) {
    feedbackEl.textContent = '';
  } else {
    feedbackEl.classList.replace('text-danger', 'text-success');
    feedbackEl.textContent = i18nextLib('load');
  }
};

const formEl = document.querySelector('.rss-form');
const disabledSubmitBtn = (status) => {
  const input = formEl.elements.url;
  const submitBtn = document.querySelector('.rss-form button');
  if (status === true) {
    submitBtn.setAttribute('disabled', true);
    input.disabled = true;
  } else {
    submitBtn.removeAttribute('disabled');
    input.disabled = false;
  }
};

const createContainer = (type, i18nextLib) => {
  const container = document.querySelector(`.${type}`);

  if (container.firstChild) {
    container.removeChild(container.firstChild);
  }
  const cardDiv = document.createElement('div');
  cardDiv.classList.add('card', 'border-0');
  container.prepend(cardDiv);

  const bodyDiv = document.createElement('div');
  bodyDiv.classList.add('card-body');
  cardDiv.prepend(bodyDiv);

  const header = document.createElement('h2');
  header.classList.add('card-title', 'h4');
  header.textContent = i18nextLib(`${type}Title`);
  bodyDiv.prepend(header);

  const ulEl = document.createElement('ul');
  ulEl.classList.add('list-group', 'border-0', 'rounded-0');
  cardDiv.append(ulEl);

  return container;
};

const renderFeeds = (value, i18nextLib) => {
  const feedContainer = createContainer('feeds', i18nextLib);
  const ulEl = feedContainer.querySelector('.list-group');
  value.forEach((feed) => {
    const { title, description } = feed;
    const liEl = document.createElement('li');
    liEl.classList.add('list-group-item', 'border-0', 'border-end-0');
    liEl.innerHTML = `<h3 class='h6 m-0'>${title}</h3><p class='m-0 small text-black-50'>${description}</p>`;
    ulEl.append(liEl);
  });
};

const renderPosts = (value, i18nextLib, visitedLinks = []) => {
  const postsContainer = createContainer('posts', i18nextLib);
  const ulEl = postsContainer.querySelector('.list-group');
  value.forEach((post) => {
    const { title, link, id } = post;
    const liEl = document.createElement('li');
    liEl.classList.add(
      'list-group-item',
      'd-flex',
      'justify-content-between',
      'alitgn=items-start',
      'border-0',
      'border-end-0',
    );

    const aEl = document.createElement('a');
    aEl.setAttribute('href', link);
    const classes = visitedLinks.has(String(id)) ? ['fw-normal', 'link-secondary'] : ['fw-bold'];
    aEl.classList.add(...classes);
    aEl.setAttribute('data-id', id);
    aEl.setAttribute('target', '_blank');
    aEl.setAttribute('rel', 'noopener noreferrer');
    aEl.textContent = title;

    const BtnEl = document.createElement('button');
    BtnEl.setAttribute('type', 'button');
    BtnEl.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    BtnEl.setAttribute('data-id', id);
    BtnEl.setAttribute('data-bs-toggle', 'modal');
    BtnEl.setAttribute('data-bs-target', '#exampleModal');

    BtnEl.textContent = i18nextLib('buttonView');

    liEl.append(aEl, BtnEl);
    ulEl.append(liEl);
  });
};

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

const render = (state, path, value, i18nextLib) => {
  const { posts, visitedLinks } = state;
  switch (path) {
    case 'error':
      renderStatus(path, value, i18nextLib);
      break;
    case 'loading':
      renderStatus(path, value, i18nextLib);
      disabledSubmitBtn(value);
      break;
    case 'feeds':
      renderStatus(path, value, i18nextLib);
      renderFeeds(value, i18nextLib);
      break;
    case 'posts':
      renderPosts(value, i18nextLib, visitedLinks);
      viewPosts(posts, visitedLinks);
      break;
    default:
      throw new Error(`${i18nextLib('unknowError')}: ${value}`);
  }
};

export default render;
