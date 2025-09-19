import { useEffect } from "react";

const SEO = ({ title, description, keywords, ogImage, canonicalUrl }) => {
  useEffect(() => {
    // Update document title
    if (title) {
      document.title = `${title} | Chordara - AI Music Generator`;
    }

    // Update meta description
    if (description) {
      updateMetaTag("description", description);
    }

    // Update meta keywords
    if (keywords) {
      updateMetaTag("keywords", keywords);
    }

    // Update Open Graph tags
    if (title) {
      updateMetaTag("og:title", title, "property");
      updateMetaTag("twitter:title", title, "name");
    }

    if (description) {
      updateMetaTag("og:description", description, "property");
      updateMetaTag("twitter:description", description, "name");
    }

    if (ogImage) {
      updateMetaTag("og:image", ogImage, "property");
      updateMetaTag("twitter:image", ogImage, "name");
    }

    // Update canonical URL
    if (canonicalUrl) {
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.rel = "canonical";
        document.head.appendChild(canonical);
      }
      canonical.href = canonicalUrl;
    }

    // Update og:url
    if (canonicalUrl) {
      updateMetaTag("og:url", canonicalUrl, "property");
      updateMetaTag("twitter:url", canonicalUrl, "name");
    }
  }, [title, description, keywords, ogImage, canonicalUrl]);

  const updateMetaTag = (name, content, attribute = "name") => {
    let meta = document.querySelector(`meta[${attribute}="${name}"]`);
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute(attribute, name);
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", content);
  };

  return null; // This component doesn't render anything
};

export default SEO;
