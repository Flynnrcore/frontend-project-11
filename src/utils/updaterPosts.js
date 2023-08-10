import fetchRSS from './fetch.js';
import parseRSS from './parse.js';
import uniqueId from './uniqueId.js';

const updaterPosts = (state) => {
  const { feeds, posts } = state;
  const promises = feeds.map(({ link }) => fetchRSS(link)
    .then(({ data }) => parseRSS(data.contents)));
  Promise.allSettled(promises)
    .then((result) => {
      result.forEach(({ status, value }) => {
        if (status === 'fulfilled') {
          const currentTitles = posts.map((post) => post.title);
          const update = value.posts
            .filter((post) => !currentTitles.includes(post.title))
            .map((post) => ({ ...post, id: uniqueId() }));
          posts.unshift(...update);
        }
      });
    })
    .finally(() => setTimeout(updaterPosts, 5000, state));
};

export default updaterPosts;
