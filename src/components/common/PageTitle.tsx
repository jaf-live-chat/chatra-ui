import { Helmet } from "react-helmet-async";

interface PageTitleProps {
  title: string;
  description?: string;
  image?: string;
  canonical?: string;
  keywords?: string;
  author?: string;
}

export function PageTitle({
  title,
  description,
  image,
  canonical,
  keywords,
  author,
}: PageTitleProps) {
  return (
    <Helmet>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      {author && <meta name="author" content={author} />}
      {canonical && <link rel="canonical" href={canonical} />}

      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
      {image && <meta property="og:image" content={image} />}
      <meta property="og:type" content="website" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      {description && <meta name="twitter:description" content={description} />}
      {image && <meta name="twitter:image" content={image} />}
    </Helmet>
  );
}

export default PageTitle;
