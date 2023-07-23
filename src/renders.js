import i18n from 'i18next';

export const renderStatus = (path, value) => {
  const feedbackEl = document.querySelector('.feedback');
  let localePath = '';

  if (path === 'errors' && value !== '') {
    feedbackEl.classList.replace('text-success', 'text-danger');
    localePath = `errors.${value}`;
    feedbackEl.textContent = i18n.t(localePath);
  } else {
    feedbackEl.classList.replace('text-danger', 'text-success');
    feedbackEl.textContent = i18n.t('load');
  }
};

export const disabledSubmitBtn = (status) => {
  const submitBtn = document.querySelector('.rss-form button');
  if (status === true) {
    submitBtn.setAttribute('disabled', true);
  } else {
    submitBtn.removeAttribute('disabled');
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
    const [feedtitle, feedDescribe] = feed;
    const liEl = document.createElement('li');
    liEl.classList.add('list-group-item', 'border-0', 'border-end-0');
    liEl.innerHTML = `<h3 class='h6 m-0'>${feedtitle}</h3><p class='m-0 small text-black-50'>${feedDescribe}</p>`;
    ulEl.append(liEl);
  });
};

export const renderPosts = (value, visitedLinks = []) => {
  const postsContainer = createContainer('posts');
  const ulEl = postsContainer.querySelector('.list-group');
  value.forEach((post) => {
    const [postTitle, , postLink, index] = post;
    const liEl = document.createElement('li');
    liEl.classList.add(
      'list-group-item',
      'd-flex',
      'justify-content-between',
      'alitgn=items-start',
      'border-0',
      'border-end-0',
    );
    const classes = visitedLinks.includes(String(index)) ? 'fw-normal link-secondary ' : 'fw-bold';

    liEl.innerHTML = `<a href="${postLink}" class="${classes}" data-id="${index}" target="_blank" rel="noopener noreferrer">${postTitle}</a>
    <button type="button" class="btn btn-outline-primary btn-sm" data-id="${index}" data-bs-toggle="modal" data-bs-target="#exampleModal">${i18n.t('buttonView')}</button>`;
    ulEl.append(liEl);
  });
};
