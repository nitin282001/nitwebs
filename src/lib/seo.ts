export interface SEOMetadata {
  title?: string;
  metaTitle?: string;
  description?: string;
  metaDescription?: string;
  keywords?: string;
  metaKeywords?: string;
  image?: string;
  ogImage?: string;
  canonicalUrl?: string;
  robots?: string;
  googleVerification?: string;
  bingVerification?: string;
  googleAnalyticsId?: string;
  structuredData?: string;
  headerCode?: string;
  footerCode?: string;
}

function setOrCreateMeta(selector: string, attrName: string, attrVal: string, content: string) {
  let el = document.querySelector(selector) as HTMLMetaElement;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attrName, attrVal);
    document.getElementsByTagName("head")[0].appendChild(el);
  }
  el.content = content;
}

function injectHtmlWithScripts(containerId: string, parentNode: HTMLElement, rawHtml: string) {
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement("div");
    container.id = containerId;
    parentNode.appendChild(container);
  }
  container.innerHTML = "";
  if (!rawHtml || rawHtml.trim() === "") return;

  const temp = document.createElement("div");
  temp.innerHTML = rawHtml;

  Array.from(temp.childNodes).forEach((node) => {
    if (node.nodeName === "SCRIPT") {
      const origScript = node as HTMLScriptElement;
      const newScript = document.createElement("script");
      Array.from(origScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });
      newScript.innerHTML = origScript.innerHTML;
      container!.appendChild(newScript);
    } else {
      container!.appendChild(node.cloneNode(true));
    }
  });
}

export function updatePageSEO(seo: SEOMetadata) {
  if (!seo) return;

  const rawTitle = seo.metaTitle || seo.title;
  if (rawTitle) {
    const formattedTitle = rawTitle.includes("Nitwebs") ? rawTitle : `${rawTitle} | Nitwebs`;
    document.title = formattedTitle;
    setOrCreateMeta("meta[property='og:title']", "property", "og:title", formattedTitle);
    setOrCreateMeta("meta[name='twitter:title']", "name", "twitter:title", formattedTitle);
  }

  const rawDesc = seo.metaDescription || seo.description;
  if (rawDesc) {
    setOrCreateMeta("meta[name='description']", "name", "description", rawDesc);
    setOrCreateMeta("meta[property='og:description']", "property", "og:description", rawDesc);
    setOrCreateMeta("meta[name='twitter:description']", "name", "twitter:description", rawDesc);
  }

  const rawKeywords = seo.metaKeywords || seo.keywords;
  if (rawKeywords) {
    setOrCreateMeta("meta[name='keywords']", "name", "keywords", rawKeywords);
  }

  const rawImage = seo.ogImage || seo.image;
  if (rawImage) {
    setOrCreateMeta("meta[property='og:image']", "property", "og:image", rawImage);
    setOrCreateMeta("meta[name='twitter:image']", "name", "twitter:image", rawImage);
  }

  if (seo.robots) {
    setOrCreateMeta("meta[name='robots']", "name", "robots", seo.robots);
  }

  if (seo.googleVerification) {
    setOrCreateMeta("meta[name='google-site-verification']", "name", "google-site-verification", seo.googleVerification);
  }

  if (seo.bingVerification) {
    setOrCreateMeta("meta[name='msvalidate.01']", "name", "msvalidate.01", seo.bingVerification);
  }

  if (seo.canonicalUrl) {
    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.getElementsByTagName("head")[0].appendChild(canonical);
    }
    canonical.href = seo.canonicalUrl;
  }

  // Handle Google Analytics (GA4) Injection
  if (seo.googleAnalyticsId && seo.googleAnalyticsId.trim() !== "") {
    const gaId = seo.googleAnalyticsId.trim();
    if (!document.getElementById("ga-gtag-script")) {
      const script = document.createElement("script");
      script.id = "ga-gtag-script";
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.getElementsByTagName("head")[0].appendChild(script);

      const configScript = document.createElement("script");
      configScript.id = "ga-gtag-config";
      configScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${gaId}');
      `;
      document.getElementsByTagName("head")[0].appendChild(configScript);
    }
  }

  // Handle Dynamic JSON-LD Structured Data Injection
  if (seo.structuredData && seo.structuredData.trim() !== "") {
    let jsonLdScript = document.getElementById("dynamic-jsonld-schema") as HTMLScriptElement;
    if (!jsonLdScript) {
      jsonLdScript = document.createElement("script");
      jsonLdScript.id = "dynamic-jsonld-schema";
      jsonLdScript.type = "application/ld+json";
      document.getElementsByTagName("head")[0].appendChild(jsonLdScript);
    }
    try {
      const parsed = JSON.parse(seo.structuredData);
      jsonLdScript.textContent = JSON.stringify(parsed);
    } catch (e) {
      jsonLdScript.textContent = seo.structuredData;
    }
  }

  // Inject Header Custom Scripts & Code
  if (seo.headerCode !== undefined) {
    injectHtmlWithScripts("dynamic-custom-header-scripts", document.head, seo.headerCode);
  }

  // Inject Footer Custom Scripts & Code
  if (seo.footerCode !== undefined) {
    injectHtmlWithScripts("dynamic-custom-footer-scripts", document.body, seo.footerCode);
  }
}
