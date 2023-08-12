import fetchRSS from './fetch.js';
import parseRSS from './parse.js';
import uniqueId from './uniqueId.js';

const updatePosts = (state) => {
  const { feeds, posts } = state;
  if (feeds.length === 0) {
    setTimeout(updatePosts, 5000, state);
    return;
  }

  feeds.map(({ link }) => fetchRSS(link)
    .then(({ data }) => {
      const updateData = parseRSS(data.contents);
      const currentTitles = posts.map((post) => post.title);
      const update = updateData.posts
        .filter((post) => !currentTitles.includes(post.title))
        .map((post) => ({ ...post, id: uniqueId() }));
      posts.unshift(...update);
    })
    .finally(() => setTimeout(updatePosts, 5000, state)));
};

export default updatePosts;
