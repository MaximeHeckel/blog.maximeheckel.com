import { posts } from '../cache/data';

/**
 * TODO improve this implementation: use Levenshtein distance or any other search algorithm that
 * could make this more scalable in the future:
 * - support tags
 * - support partial string
 * - support sentences
 * - support typos (?)
 *
 * This is good for now
 */

export default (req, res) => {
  const results = req.query.q
    ? posts.filter((post) => {
        if (post.type === 'snippet') {
          return (
            post.title.toLowerCase().includes(req.query.q) ||
            req.query.q.includes(post.type)
          );
        }

        return (
          post.title.toLowerCase().includes(req.query.q) ||
          post.subtitle.toLowerCase().includes(req.query.q) ||
          post.keywords.includes(req.query.q)
        );
      })
    : [];
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ results }));
};
