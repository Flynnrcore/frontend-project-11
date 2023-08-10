const renderStatus = (elements, path, value, i18nextLib) => {
  const { statusBar } = elements;
  let localePath = '';

  if (path === 'error' && value !== null) {
    statusBar.classList.replace('text-success', 'text-danger');
    localePath = `error.${value}`;
    statusBar.textContent = i18nextLib(localePath);
  } else if (path === 'loading' && value === true) {
    statusBar.textContent = '';
  } else {
    statusBar.classList.replace('text-danger', 'text-success');
    statusBar.textContent = i18nextLib('load');
  }
};

const disabledSubmitBtn = (elements, status) => {
  const { form, formSubmitBtn } = elements;
  const input = form.elements.url;
  if (status === true) {
    formSubmitBtn.setAttribute('disabled', true);
    input.disabled = true;
  } else {
    formSubmitBtn.removeAttribute('disabled');
    input.disabled = false;
  }
};

const createContainer = (elements, type, i18nextLib) => {
  const { feeds, posts } = elements;
  const container = type === 'feeds' ? feeds : posts;

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

const renderFeeds = (elements, value, i18nextLib) => {
  const feedContainer = createContainer(elements, 'feeds', i18nextLib);
  const ulEl = feedContainer.querySelector('.list-group');
  value.forEach((feed) => {
    const { title, description } = feed;
    const liEl = document.createElement('li');
    liEl.classList.add('list-group-item', 'border-0', 'border-end-0');
    liEl.innerHTML = `<h3 class='h6 m-0'>${title}</h3><p class='m-0 small text-black-50'>${description}</p>`;
    ulEl.append(liEl);
  });
};

const renderPosts = (elements, value, i18nextLib, visitedLinks = []) => {
  const postsContainer = createContainer(elements, 'posts', i18nextLib);
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

    const btnEl = document.createElement('button');
    btnEl.setAttribute('type', 'button');
    btnEl.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    btnEl.setAttribute('data-id', id);
    btnEl.setAttribute('data-bs-toggle', 'modal');
    btnEl.setAttribute('data-bs-target', '#exampleModal');

    btnEl.textContent = i18nextLib('buttonView');

    liEl.append(aEl, btnEl);
    ulEl.append(liEl);
  });
};

const viewPosts = (elements, setId, statePosts) => {
  const arr = [...setId];
  const linkID = arr[arr.length - 1];
  const currentLink = document.querySelector(`a[data-id="${linkID}"]`);
  currentLink.classList.remove('fw-bold');
  currentLink.classList.add('fw-normal', 'link-secondary');

  const currentPost = statePosts.find((post) => post.id === Number(linkID));
  const { modal } = elements;
  const { title, description, link } = currentPost;

  modal.btn.setAttribute('href', link);
  modal.title.textContent = title;
  modal.body.textContent = description;
};

const render = (elements, state, path, value, i18nextLib) => {
  const { posts, visitedLinks } = state;
  switch (path) {
    case 'error':
      renderStatus(elements, path, value, i18nextLib);
      break;
    case 'loading':
      renderStatus(elements, path, value, i18nextLib);
      disabledSubmitBtn(elements, value);
      break;
    case 'feeds':
      renderStatus(elements, path, value, i18nextLib);
      renderFeeds(elements, value, i18nextLib);
      elements.form.reset();
      break;
    case 'posts':
      renderPosts(elements, value, i18nextLib, visitedLinks);
      break;
    case 'visitedLinks':
      viewPosts(elements, value, posts);
      break;
    default:
      throw new Error(`${i18nextLib('unknowError')}: ${value}`);
  }
};

export default render;
