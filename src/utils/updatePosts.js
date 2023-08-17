import fetchRSS from './fetch.js';
import parseRSS from './parse.js';
import uniqueId from './uniqueId.js';

const updatePosts = (state) => {
  const { feeds, posts } = state;
  const promises = feeds.map(({ link }) => fetchRSS(link)
    .then(({ data }) => {
      const updateData = parseRSS(data.contents);
      const currentTitles = posts.map((post) => post.title);
      const update = updateData.posts
        .filter((post) => !currentTitles.includes(post.title))
        .map((post) => ({ ...post, id: uniqueId() }));
      posts.unshift(...update);
    }));

  Promise.allSettled(promises).finally(() => setTimeout(updatePosts, 5000, state));
};

export default updatePosts;
