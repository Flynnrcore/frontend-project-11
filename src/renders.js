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

export const renderFeedsAndPosts = (path, value) => {
  const feedContainer = document.querySelector('.feeds');
  const postsContrainer = document.querySelector('.posts');

  if (path === 'feed') {
    if (feedContainer.firstChild) {
      feedContainer.removeChild(feedContainer.firstChild);
    }
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
    feedCardDiv.append(listUlEl);

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
    const postCardDiv = document.createElement('div');
    postCardDiv.classList.add('card', 'border-0');

    const PostCardBodyDiv = document.createElement('div');
    PostCardBodyDiv.classList.add('card-body');
    postCardDiv.prepend(PostCardBodyDiv);

    const postHeader = document.createElement('h2');
    postHeader.classList.add('card-title', 'h4');
    postHeader.textContent = i18n.t('postsTitle');
    PostCardBodyDiv.prepend(postHeader);

    const PostListUlEl = document.createElement('ul');
    PostListUlEl.classList.add('list-group', 'border-0', 'rounded-0');
    postCardDiv.append(PostListUlEl);

    value.map((post, index) => {
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
      postLiEl.innerHTML = `<a href="${postLink}" class="fw-bold" data-id="${index}" target="_blank" rel="noopener noreferrer">${postTitle}</a>
      <button type="button" class="btn btn-outline-primary btn-sm" data-id="${index}" data-bs-toggle="modal" data-bs-target="#modal">${i18n.t('buttonView')}</button>`;
      return PostListUlEl.append(postLiEl);
    });
    postsContrainer.prepend(postCardDiv);
  }
};
