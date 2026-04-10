import { Helmet } from "react-helmet-async";
import useCompanyBranding from "../../hooks/useCompanyBranding";

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
  const { companyName } = useCompanyBranding();
  const resolvedTitle = `${companyName} - ${title}`;

  return (
    <Helmet>
      <title>{resolvedTitle}</title>
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      {author && <meta name="author" content={author} />}
      {canonical && <link rel="canonical" href={canonical} />}

      <meta property="og:title" content={resolvedTitle} />
      <meta property="og:site_name" content={companyName} />
      {description && <meta property="og:description" content={description} />}
      {image && <meta property="og:image" content={image} />}
      <meta property="og:type" content="website" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={resolvedTitle} />
      {description && <meta name="twitter:description" content={description} />}
      {image && <meta name="twitter:image" content={image} />}
    </Helmet>
  );
}

export default PageTitle;
