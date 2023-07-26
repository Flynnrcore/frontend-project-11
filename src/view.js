import i18n from 'i18next';

export const renderStatus = (path, value) => {
  const feedbackEl = document.querySelector('.feedback');
  let localePath = '';

  if (path === 'error' && value !== null) {
    feedbackEl.classList.replace('text-success', 'text-danger');
    localePath = `error.${value}`;
    feedbackEl.textContent = i18n.t(localePath);
  } else if (path === 'loading' && value === true) {
    feedbackEl.textContent = '';
  } else {
    feedbackEl.classList.replace('text-danger', 'text-success');
    feedbackEl.textContent = i18n.t('load');
  }
};

export const disabledSubmitBtn = (status, form) => {
  const input = form.elements.url;
  const submitBtn = document.querySelector('.rss-form button');
  if (status === true) {
    submitBtn.setAttribute('disabled', true);
    input.disabled = true;
  } else {
    submitBtn.removeAttribute('disabled');
    input.disabled = false;
  }
};

const createContainer = (type) => {
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
  header.textContent = i18n.t(`${type}Title`);
  bodyDiv.prepend(header);

  const ulEl = document.createElement('ul');
  ulEl.classList.add('list-group', 'border-0', 'rounded-0');
  cardDiv.append(ulEl);

  return container;
};

export const renderFeeds = (value) => {
  const feedContainer = createContainer('feeds');
  const ulEl = feedContainer.querySelector('.list-group');
  value.forEach((feed) => {
    const { title, description } = feed;
    const liEl = document.createElement('li');
    liEl.classList.add('list-group-item', 'border-0', 'border-end-0');
    liEl.innerHTML = `<h3 class='h6 m-0'>${title}</h3><p class='m-0 small text-black-50'>${description}</p>`;
    ulEl.append(liEl);
  });
};

export const renderPosts = (value, visitedLinks = []) => {
  const postsContainer = createContainer('posts');
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

    BtnEl.textContent = i18n.t('buttonView');

    liEl.append(aEl, BtnEl);
    ulEl.append(liEl);
  });
};
