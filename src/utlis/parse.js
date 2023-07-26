const parseRSS = (html) => {
  const rss = html.querySelector('rss');
  if (!rss) {
    throw new Error('notIncludesRSS');
  }

  const titles = Array.from(html.querySelectorAll('title')).map((item) => item.textContent);
  const descriptions = Array.from(html.querySelectorAll('description')).map((item) => item.textContent);
  const links = Array.from(html.querySelectorAll('link')).map((item) => item.textContent);

  const [feedLink, ...postLinks] = links;
  const [feedName, ...postsNames] = titles;
  const [feedDescription, ...postsDescriptions] = descriptions;

  const data = {};
  data.feed = {
    title: feedName,
    description: feedDescription,
    link: feedLink,
  };

  data.posts = postsNames.map((title, index) => ({
    title,
    description: postsDescriptions[index],
    link: postLinks[index],
  }));

  return data;
};

export default parseRSS;
