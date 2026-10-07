const projectFields = `
  _id, name, title, "slug": slug.current, year, category, type, description, details,
  image { ..., asset->{ _id, url } }, heroImage { ..., asset->{ _id, url } },
  gallery[] { ..., asset->{ _id, url } }, href, githubUrl, tags, role, client,
  featured, order, presentation, theme, videoUrl,
  chapters[] { _key, title, body, image { ..., asset->{ _id, url } } },
  relatedProjects[]->{ _id }
`;
export const PORTFOLIO_QUERY = `{
  "projects": *[_type == "project" && !(_id in path("drafts.**"))] | order(coalesce(order, 9999) asc, year desc, _id asc) { ${projectFields} },
  "settings": *[_type == "siteSettings"] | order(_updatedAt desc) [0] {
    name, location, heroEyebrow, heroTitle, heroBody, heroImage { ..., asset->{ _id, url } },
    biography, aboutTitle, email, copyright, availability, seoTitle, seoDescription, contactTitle,
    socialLinks, capabilities, technologies, featuredProjects[]->{ _id }
  }
}`;
