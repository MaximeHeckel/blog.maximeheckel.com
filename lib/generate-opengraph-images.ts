const { createHash } = require('crypto');
const fs = require('fs');

type OgImageParams = Record<string, string | undefined>;

const OGImageDirectory = `./public/static/og`;
const defaultOGImage = `${OGImageDirectory}/main-og-image.png`;

const getOgImage = async (params: OgImageParams): Promise<string> => {
  const hash = createHash('md5').update(params.title).digest('hex');
  const imagePath = `${OGImageDirectory}/${hash}.png`;
  const publicPath = `/static/og/${hash}.png`;

  try {
    fs.statSync(imagePath);
    return publicPath;
  } catch (error) {
    return defaultOGImage;
  }
};

export default getOgImage;
