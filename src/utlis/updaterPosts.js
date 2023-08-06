import fetchRSS from './fetch.js';
import uniqueId from './uniqueId.js';

const updaterPosts = (state) => {
  const { feeds, posts } = state;
  const promises = feeds.map(({ link }) => fetchRSS(link));
  Promise.all(promises)
    .then((results) => {
      results.forEach((data) => {
        const currentTitles = posts.map((post) => post.title);
        const update = data.posts
          .filter((post) => !currentTitles.includes(post.title))
          .map((post) => ({ ...post, id: uniqueId() }));
        posts.unshift(...update);
      });
    })
    // eslint-disable-next-line no-unused-vars
    .catch((_error) => {})
    .finally(() => setTimeout(updaterPosts, 5000, state));
};

export default updaterPosts;
