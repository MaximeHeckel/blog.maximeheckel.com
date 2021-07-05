import lunr from 'lunr';
import search from '../../cache/search.json';

const searchEndpoint = (req, res) => {
  const index = lunr.Index.load(search.index);
  const store = search.store;

  const refs = index.search(req.query.q);
  const results = refs.map(({ ref }) => store[ref]);

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ results }));
};

export default searchEndpoint;
