import fetchRSS from './fetch.js';
import uniqueId from './uniqueId.js';

const updaterPosts = (state) => {
  const { feeds, posts } = state;
  feeds.forEach(({ link }) => {
    fetchRSS(link)
      .then((data) => {
        const currentTitles = posts.map((post) => post.title);
        const update = data.posts
          .filter((post) => !currentTitles.includes(post.title))
          .map((post) => ({ ...post, id: uniqueId() }));
        posts.unshift(...update);
      })
    // eslint-disable-next-line no-unused-vars
      .catch((_error) => {
      });
  });
  setTimeout(updaterPosts, 5000, state);
};

export default updaterPosts;
