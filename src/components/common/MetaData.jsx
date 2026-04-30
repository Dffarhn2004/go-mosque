import { Helmet } from 'react-helmet-async';

const BASE_URL = 'https://goqu.vercel.app';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.jpg`;
const SITE_NAME = 'GoQu';

const MetaData = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  jsonLd,
  noIndex = false,
}) => {
  const fullTitle = title
    ? `${title} | ${SITE_NAME}`
    : `${SITE_NAME} - Platform Donasi Masjid Transparan`;

  const metaDescription =
    description ||
    'Platform donasi digital untuk pembangunan dan renovasi masjid yang akuntabel dan transparan di seluruh Indonesia.';

  const metaKeywords =
    keywords ||
    'donasi masjid, wakaf, sedekah, pembangunan masjid, renovasi masjid, GoQu, donasi online, masjid Indonesia';

  const metaImage = image || DEFAULT_OG_IMAGE;
  const canonicalUrl = url ? `${BASE_URL}${url}` : BASE_URL;

  return (
    <Helmet>
      {/* Dasar */}
      <html lang="id" />
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={metaKeywords} />
      <meta name="author" content="GoQu" />
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="id_ID" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />

      {/* Theme */}
      <meta name="theme-color" content="#0C6839" />

      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};

export default MetaData;
