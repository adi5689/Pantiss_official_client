import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_URL = "https://www.pantiss.org";
const SITE_NAME = "Pantiss Foundation";
const DEFAULT_DESCRIPTION =
  "Pantiss Foundation works with mining-affected communities through livelihoods, skill development, social development, research, partnerships, and responsible transition programmes.";
const DEFAULT_KEYWORDS =
  "Pantiss Foundation, mining community development NGO, mining affected communities, livelihood programmes, skill development NGO India, CSR implementation partner, social development organisation";
const DEFAULT_IMAGE = SITE_URL + "/logo.png";

const routeMeta = {
  "/admin/jobs": { title: "Jobs Workspace | Pantiss Foundation", description: "Manage career opportunities." },
  "/admin/tenders": { title: "Tenders Workspace | Pantiss Foundation", description: "Manage procurement notices." },
  "/admin/impact": { title: "Impact Workspace | Pantiss Foundation", description: "Manage publications and impact stories." },
  "/admin/team": {
    title: "Team Workspace | Pantiss Foundation",
    description: "Manage the Pantiss team directory.",
  },
  "/": {
    title: "Pantiss Foundation | Mining Community Development NGO in India",
    description:
      "Pantiss Foundation is a development organisation working with mining-affected communities through livelihood programmes, skill development, CSR partnerships, research, and social impact initiatives.",
    keywords:
      "Pantiss Foundation, mining community development NGO India, NGO for mining affected communities, CSR implementation partner India, livelihood programmes for mining communities, social development organisation India, skill development NGO",
  },
  "/sdg-pantiss": {
    title: "SDGs and Pantiss | Sustainable Development Initiatives",
    description:
      "Explore Pantiss Foundation's sustainable development goals work, impact focus, and community-led progress.",
  },
  "/whoweare/about": {
    title: "About Pantiss Foundation | Mining Community Development NGO",
    description:
      "Learn about Pantiss Foundation's mission, values, and work as a development organisation supporting mining-affected communities across India.",
    keywords:
      "about Pantiss Foundation, Pantiss NGO, mining community development organisation, NGO working in mining areas, social impact organisation India, development organisation for mining communities",
  },
  "/whoweare/team": {
    title: "Pantiss Foundation Team | Development Sector Professionals",
    description:
      "Meet the Pantiss Foundation team leading community development, research, CSR partnerships, social impact programmes, and field delivery.",
    keywords:
      "Pantiss Foundation team, development sector professionals, NGO leadership team, social impact team India, CSR programme team, community development experts",
  },
  "/whoweare/advisory-board": {
    title: "Advisory Board | Pantiss Foundation",
    description:
      "Meet the advisory board guiding Pantiss Foundation's community development and social impact work.",
  },
  "/whoweare/reports-and-financials": {
    title: "Reports and Financials | Pantiss Foundation",
    description:
      "View Pantiss Foundation reports, financial information, publications, and programme documentation.",
  },
  "/what-we-do": {
    title: "What We Do | Mining Livelihood, Skill Development and CSR Programmes",
    description:
      "Discover Pantiss Foundation programmes in skill development, rehabilitation and resettlement, sustainable livelihoods, nutrition, innovation, and mining village transformation.",
    keywords:
      "mining community programmes, skill development for mining affected youth, rehabilitation and resettlement mining, sustainable livelihood programmes, CSR projects in mining areas, mining village development, social development programmes India",
  },
  "/solutions/model-mining-villages": {
    title: "Model Mining Villages | Pantiss Foundation",
    description:
      "Explore Pantiss Foundation's integrated approach to community-led planning, resilient infrastructure, essential services, livelihoods, and governance in mining-affected villages.",
    keywords:
      "model mining villages, mining village development, community-led village planning, resilient rural infrastructure, mining affected communities India",
  },
  "/solutions/repurposed-mining-villages": {
    title: "Repurposed Mining Villages | Pantiss Foundation",
    description:
      "Discover how Pantiss Foundation transforms restored post-mining land into safe villages, productive landscapes, community infrastructure, and local livelihoods.",
    keywords:
      "repurposed mining villages, post-mining land reuse, mine closure community development, abandoned mine restoration, post-mining livelihoods India",
  },
  "/careers": {
    title: "Careers at Pantiss Foundation | NGO Jobs and Internships",
    description:
      "Explore NGO career opportunities, internships, life at Pantiss, employee benefits, and development sector roles with Pantiss Foundation.",
    keywords:
      "Pantiss careers, NGO jobs India, development sector jobs, social impact careers, CSR jobs India, internships in NGO, careers at Pantiss Foundation",
  },
  "/careers/jobs": {
    title: "Jobs at Pantiss Foundation",
    description:
      "Browse open job roles and application details for opportunities at Pantiss Foundation.",
  },
  "/contact-us": {
    title: "Contact Pantiss Foundation | NGO and CSR Partnership Enquiries",
    description:
      "Contact Pantiss Foundation for CSR partnerships, development programmes, careers, tenders, field offices, and general enquiries.",
    keywords:
      "contact Pantiss Foundation, Pantiss Foundation office, CSR partnership enquiry, NGO contact India, development programme enquiry, Pantiss email, Pantiss careers contact",
  },
  "/tenders": {
    title: "Tenders | Pantiss Foundation",
    description:
      "View active tenders, procurement notices, and submission details from Pantiss Foundation.",
  },
  "/tenders/all": {
    title: "All Tender Notices | Pantiss Foundation",
    description:
      "Browse open and closed Pantiss Foundation tenders in one procurement archive.",
  },
  "/where-we-work": {
    title: "Where We Work | Mining Community Programmes Across India",
    description:
      "Explore Pantiss Foundation's mining community development work across Odisha, Jharkhand, Chhattisgarh, Tamil Nadu, and Assam.",
    keywords:
      "Pantiss where we work, NGO in Odisha, NGO in Jharkhand, NGO in Chhattisgarh, mining communities Odisha, mining communities Jharkhand, mining community development India, CSR implementation Odisha",
  },
  "/programmes/young-professionals": {
    title: "Young Professionals Programme | Pantiss Foundation",
    description:
      "Learn about the Pantiss Young Professionals Programme for emerging development sector leaders.",
  },
  "/programmes/internships": {
    title: "Internship Programme | Pantiss Foundation",
    description:
      "Explore internship opportunities and learning pathways at Pantiss Foundation.",
  },
  "/fellowship": {
    title: "Fellowship Programme | Pantiss Foundation",
    description:
      "Learn about the Pantiss Fellowship Programme and its field-based development learning opportunities.",
  },
  "/summit": {
    title: "Mining Villages Summit | Pantiss Foundation",
    description:
      "Explore the Pantiss Foundation summit on mining villages, partnerships, development, and responsible transition.",
  },
  "/impact": {
    title: "Impact, Publications and Stories | Pantiss Foundation",
    description:
      "Read Pantiss Foundation impact stories, publications, reports, podcasts, and research resources.",
  },
  "/life-at-pantiss/people-at-pantiss": {
    title: "People at Pantiss | Life at Pantiss Foundation",
    description:
      "Discover the people, culture, and work environment at Pantiss Foundation.",
  },
  "/life-at-pantiss/inclusiveness-and-diversity": {
    title: "Inclusiveness and Diversity | Pantiss Foundation",
    description:
      "Learn about Pantiss Foundation's commitment to inclusion, diversity, and equitable workplaces.",
  },
  "/life-at-pantiss/zero-tolerance-for-harassment": {
    title: "Zero Tolerance for Harassment | Pantiss Foundation",
    description:
      "Read about Pantiss Foundation's zero-tolerance approach to harassment and safe workplace culture.",
  },
  "/life-at-pantiss/meet-the-leaders": {
    title: "Meet the Leaders | Pantiss Foundation",
    description:
      "Meet leaders shaping Pantiss Foundation's programmes, partnerships, and field impact.",
  },
  "/life-at-pantiss/investing-in-mental-health": {
    title: "Investing in Mental Health | Pantiss Foundation",
    description:
      "Learn how Pantiss Foundation supports mental health, wellbeing, and care at work.",
  },
  "/benefits-at-pantiss/career-development": {
    title: "Career Development Benefits | Pantiss Foundation",
    description:
      "Explore career growth, learning, and development benefits at Pantiss Foundation.",
  },
  "/benefits-at-pantiss/tution-assistance": {
    title: "Tuition Assistance | Pantiss Foundation",
    description:
      "Learn about tuition assistance and education support benefits at Pantiss Foundation.",
  },
  "/benefits-at-pantiss/parenting-benefits": {
    title: "Parenting Benefits | Pantiss Foundation",
    description:
      "Explore parenting support and family-friendly benefits at Pantiss Foundation.",
  },
  "/benefits-at-pantiss/health-insurance": {
    title: "Health Insurance Benefits | Pantiss Foundation",
    description:
      "Learn about health insurance and employee wellbeing benefits at Pantiss Foundation.",
  },
  "/benefits-at-pantiss/retirement-programmes": {
    title: "Retirement Programmes | Pantiss Foundation",
    description:
      "Explore retirement planning and long-term employee support at Pantiss Foundation.",
  },
  "/where-we-work/odisha": {
    title: "Pantiss Foundation in Odisha",
    description:
      "Explore Pantiss Foundation's programmes and district-level work in Odisha.",
  },
  "/where-we-work/chhattisgarh": {
    title: "Pantiss Foundation in Chhattisgarh",
    description:
      "Explore Pantiss Foundation's programmes and community development work in Chhattisgarh.",
  },
  "/where-we-work/jharkhand": {
    title: "Pantiss Foundation in Jharkhand",
    description:
      "Explore Pantiss Foundation's programmes and mining community work in Jharkhand.",
  },
  "/where-we-work/tamil-nadu": {
    title: "Pantiss Foundation in Tamil Nadu",
    description:
      "Explore Pantiss Foundation's programmes and community development work in Tamil Nadu.",
  },
  "/where-we-work/assam": {
    title: "Pantiss Foundation in Assam",
    description:
      "Explore Pantiss Foundation's programmes and community development work in Assam.",
  },
  "/where-we-work/odisha/angul": {
    title: "Pantiss Foundation in Angul, Odisha",
    description:
      "Explore Pantiss Foundation's Angul district programmes, partners, impact, and community work.",
  },
  "/where-we-work/odisha/jajpur": {
    title: "Pantiss Foundation in Jajpur, Odisha",
    description:
      "Explore Pantiss Foundation's Jajpur district programmes, partners, impact, and community work.",
  },
  "/where-we-work/odisha/jharsuguda": {
    title: "Pantiss Foundation in Jharsuguda, Odisha",
    description:
      "Explore Pantiss Foundation's Jharsuguda district programmes, partners, impact, and community work.",
  },
  "/where-we-work/odisha/sundargarh": {
    title: "Pantiss Foundation in Sundargarh, Odisha",
    description:
      "Explore Pantiss Foundation's Sundargarh district programmes, partners, impact, and community work.",
  },
  "/where-we-work/odisha/keonjhar": {
    title: "Pantiss Foundation in Keonjhar, Odisha",
    description:
      "Explore Pantiss Foundation's Keonjhar district programmes, partners, impact, and community work.",
  },
  "/where-we-work/odisha/kalahandi": {
    title: "Pantiss Foundation in Kalahandi, Odisha",
    description:
      "Explore Pantiss Foundation's Kalahandi district programmes, partners, impact, and community work.",
  },
  "/where-we-work/jharkhand/koderma": {
    title: "Pantiss Foundation in Koderma, Jharkhand",
    description:
      "Explore Pantiss Foundation's Koderma district programmes, partners, impact, and community work.",
  },
  "/where-we-work/jharkhand/dhanbad": {
    title: "Pantiss Foundation in Dhanbad, Jharkhand",
    description:
      "Explore Pantiss Foundation's Dhanbad district programmes, partners, impact, and community work.",
  },
  "/where-we-work/jharkhand/bokaro": {
    title: "Pantiss Foundation in Bokaro, Jharkhand",
    description:
      "Explore Pantiss Foundation's Bokaro district programmes, partners, impact, and community work.",
  },
  "/where-we-work/tamil-nadu/neyveli": {
    title: "Pantiss Foundation in Neyveli, Tamil Nadu",
    description:
      "Explore Pantiss Foundation's Neyveli programmes, partners, impact, and community work.",
  },
  "/where-we-work/Chhattisgarh/korba": {
    title: "Pantiss Foundation in Korba, Chhattisgarh",
    description:
      "Explore Pantiss Foundation's Korba district programmes, partners, impact, and community work.",
  },
  "/where-we-work/assam/guwahati": {
    title: "Pantiss Foundation in Guwahati, Assam",
    description:
      "Explore Pantiss Foundation's Guwahati programmes, partners, impact, and community work.",
  },
  "/where-we-work/assam/dispur": {
    title: "Pantiss Foundation in Dispur, Assam",
    description:
      "Explore Pantiss Foundation's Dispur programmes, partners, impact, and community work.",
  },
  "/what-we-do/land-acquisition-rehabilitation-&-resettlement-of-mines": {
    title: "Land Acquisition, Rehabilitation and Resettlement | Pantiss",
    description:
      "Learn about Pantiss Foundation's land acquisition, rehabilitation, and resettlement work for mining-affected communities.",
  },
  "/what-we-do/mine-steel-&-power-skill-park": {
    title: "Mine, Steel and Power Skill Park | Pantiss Foundation",
    description:
      "Explore skill development programmes for mining, steel, and power sector youth and workers.",
  },
  "/what-we-do/carp-rice-&-duck-livelihood-park": {
    title: "Carp, Rice and Duck Livelihood Park | Pantiss Foundation",
    description:
      "Learn about Pantiss Foundation's integrated livelihood park model for mining-affected communities.",
  },
  "/what-we-do/nutrinest": {
    title: "Nutrinest | Pantiss Foundation",
    description:
      "Explore Nutrinest, Pantiss Foundation's nutrition and wellbeing initiative for mining villages.",
  },
  "/what-we-do/model-mining-village-in-making": {
    title: "Model Mining Village in Making | Pantiss Foundation",
    description:
      "Learn about Pantiss Foundation's model mining village initiative and community transformation approach.",
  },
  "/what-we-do/innovation-lab": {
    title: "Innovation Lab | Pantiss Foundation",
    description:
      "Explore Pantiss Foundation's Innovation Lab for social innovation, technology, and development solutions.",
  },
  "/dashboard/results": {
    title: "Results Dashboard | Pantiss Foundation",
    description:
      "View Pantiss Foundation results, indicators, and programme outcomes through the impact dashboard.",
  },
  "/dashboard/partnerships": {
    title: "Partnerships Dashboard | Pantiss Foundation",
    description:
      "Explore Pantiss Foundation partnerships, collaborators, and programme networks.",
  },
  "/dashboard/key-result-stories": {
    title: "Key Result Stories | Pantiss Foundation",
    description:
      "Read key result stories and impact narratives from Pantiss Foundation programmes.",
  },
};

const setMeta = (selector, attributes) => {
  let tag = document.head.querySelector(selector);
  if (!tag) {
    tag = document.createElement("meta");
    document.head.appendChild(tag);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    tag.setAttribute(key, value);
  });
};

const setLink = (rel, href) => {
  let tag = document.head.querySelector(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", rel);
    document.head.appendChild(tag);
  }

  tag.setAttribute("href", href);
};

const setJsonLd = (id, data) => {
  let tag = document.getElementById(id);
  if (!tag) {
    tag = document.createElement("script");
    tag.id = id;
    tag.type = "application/ld+json";
    document.head.appendChild(tag);
  }

  tag.textContent = JSON.stringify(data);
};

const buildTitleFromPath = (pathname) => {
  if (pathname === "/") return "Pantiss Foundation";

  const title = pathname
    .split("/")
    .filter(Boolean)
    .pop()
    .replace(/-/g, " ")
    .replace(/&/g, "and")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

  return `${title} | ${SITE_NAME}`;
};

const getCanonicalUrl = (pathname) => {
  const normalizedPath = pathname === "/" ? "/" : pathname.replace(/\/+$/, "");
  const encodedPath = normalizedPath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `${SITE_URL}${encodedPath}`;
};

const SeoManager = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const metadata = routeMeta[pathname] || {
      title: buildTitleFromPath(pathname),
      description: DEFAULT_DESCRIPTION,
      keywords: DEFAULT_KEYWORDS,
    };
    const canonicalUrl = getCanonicalUrl(pathname);

    document.title = metadata.title;
    setMeta('meta[name="description"]', {
      name: "description",
      content: metadata.description,
    });
    setMeta('meta[name="keywords"]', {
      name: "keywords",
      content: metadata.keywords || DEFAULT_KEYWORDS,
    });
    setMeta('meta[name="robots"]', {
      name: "robots",
      content: pathname.startsWith("/admin/") ? "noindex, nofollow" : "index, follow, max-image-preview:large",
    });
    setMeta('meta[name="googlebot"]', {
      name: "googlebot",
      content: pathname.startsWith("/admin/") ? "noindex, nofollow" : "index, follow, max-image-preview:large",
    });
    setMeta('meta[property="og:site_name"]', {
      property: "og:site_name",
      content: SITE_NAME,
    });
    setMeta('meta[property="og:type"]', {
      property: "og:type",
      content: "website",
    });
    setMeta('meta[property="og:title"]', {
      property: "og:title",
      content: metadata.title,
    });
    setMeta('meta[property="og:description"]', {
      property: "og:description",
      content: metadata.description,
    });
    setMeta('meta[property="og:url"]', {
      property: "og:url",
      content: canonicalUrl,
    });
    setMeta('meta[property="og:image"]', {
      property: "og:image",
      content: DEFAULT_IMAGE,
    });
    setMeta('meta[name="twitter:card"]', {
      name: "twitter:card",
      content: "summary_large_image",
    });
    setMeta('meta[name="twitter:title"]', {
      name: "twitter:title",
      content: metadata.title,
    });
    setMeta('meta[name="twitter:description"]', {
      name: "twitter:description",
      content: metadata.description,
    });
    setMeta('meta[name="twitter:image"]', {
      name: "twitter:image",
      content: DEFAULT_IMAGE,
    });
    setLink("canonical", canonicalUrl);

    setJsonLd("organization-schema", {
      "@context": "https://schema.org",
      "@type": "NGO",
      name: SITE_NAME,
      url: SITE_URL,
      logo: DEFAULT_IMAGE,
      email: "info@pantiss.org",
      sameAs: [
        "https://facebook.com/pantissfoundation",
        "https://twitter.com/pantiss_org",
        "https://instagram.com/pantissfoundation",
        "https://linkedin.com/company/pantissfoundation",
      ],
    });

    setJsonLd("website-schema", {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    });

    setJsonLd("webpage-schema", {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: metadata.title,
      description: metadata.description,
      url: canonicalUrl,
      isPartOf: {
        "@type": "WebSite",
        name: SITE_NAME,
        url: SITE_URL,
      },
    });
  }, [pathname]);

  return null;
};

export default SeoManager;
