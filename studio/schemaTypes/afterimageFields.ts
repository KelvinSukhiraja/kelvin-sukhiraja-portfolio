import { defineArrayMember, defineField } from 'sanity';

const editorialImage = (name: string, title: string) => defineField({
  name, title, type: 'image', options: { hotspot: true },
  fields: [defineField({ name: 'alt', title: 'Alternative text', type: 'string' }), defineField({ name: 'caption', title: 'Caption', type: 'string' })],
});

// Additive fields only. Existing names and content remain compatible with the old site.
export const afterimageProjectFields = [
  defineField({ name: 'slug', title: 'Page address', type: 'slug', options: { source: 'name', maxLength: 96 }, description: 'Generate a readable address for this case study. Existing document-ID links continue to redirect.' }),
  defineField({ name: 'role', title: 'Your role', type: 'string' }),
  defineField({ name: 'client', title: 'Client', type: 'string' }),
  defineField({ name: 'githubUrl', title: 'Source code URL', type: 'url', validation: rule => rule.uri({ scheme: ['http', 'https'] }) }),
  editorialImage('heroImage', 'Case-study hero image'),
  defineField({ name: 'videoUrl', title: 'Hero video URL', type: 'url', description: 'Direct MP4 or WebM URL, not a YouTube/Vimeo page. The hero image becomes its poster.', validation: rule => rule.uri({ scheme: ['https'] }) }),
  defineField({ name: 'presentation', title: 'Homepage composition', type: 'string', options: { list: [{ title: 'Cinema — media on the right', value: 'cinema' }, { title: 'System — media on the left', value: 'system' }, { title: 'Signal — offset media', value: 'signal' }] } }),
  defineField({ name: 'theme', title: 'Media background', type: 'string', description: 'Optional six-digit hex color, such as #141414.', validation: rule => rule.regex(/^#[0-9a-fA-F]{6}$/) }),
  defineField({ name: 'chapters', title: 'Case study', type: 'array', description: 'Add only the chapters you need: Context, Challenge, Approach, Interaction, Engineering, Outcome.', of: [defineArrayMember({ name: 'chapter', title: 'Chapter', type: 'object', fields: [
    defineField({ name: 'title', title: 'Heading', type: 'string', validation: rule => rule.required() }),
    defineField({ name: 'body', title: 'Narrative', type: 'array', of: [defineArrayMember({ type: 'block' })] }),
    editorialImage('image', 'Supporting image'),
  ] })] }),
  defineField({ name: 'relatedProjects', title: 'Related projects', type: 'array', of: [defineArrayMember({ type: 'reference', to: [{ type: 'project' }] })] }),
];

export const afterimageSiteFields = [
  defineField({ name: 'name', title: 'Display name', type: 'string', initialValue: 'Kelvin Sukhir Aja' }),
  defineField({ name: 'location', title: 'Location', type: 'string', initialValue: 'Jakarta / Remote' }),
  editorialImage('heroImage', 'Interactive hero artwork'),
  defineField({ name: 'aboutTitle', title: 'About headline', type: 'text', rows: 2, description: 'Use a line break before the italic phrase.', initialValue: 'Between design\nand engineering.' }),
  defineField({ name: 'biography', title: 'Biography', type: 'text', rows: 4 }),
  defineField({ name: 'availability', title: 'Availability', type: 'string', description: 'Optional status on the hero baseline. Leave empty to show location.' }),
  defineField({ name: 'contactTitle', title: 'Contact headline', type: 'text', rows: 2, initialValue: 'Have something\nin mind?' }),
  defineField({ name: 'capabilities', title: 'Capabilities', type: 'array', of: [defineArrayMember({ name: 'capabilityGroup', type: 'object', fields: [defineField({ name: 'title', title: 'Group title', type: 'string' }), defineField({ name: 'items', title: 'Capabilities', type: 'array', of: [defineArrayMember({ type: 'string' })] })] })] }),
  defineField({ name: 'technologies', title: 'Selected tools', type: 'array', of: [defineArrayMember({ type: 'string' })], description: 'Leave empty to derive tools from project tags.' }),
  defineField({ name: 'socialLinks', title: 'Social links', type: 'array', of: [defineArrayMember({ name: 'socialLink', type: 'object', fields: [defineField({ name: 'label', title: 'Label', type: 'string', validation: rule => rule.required() }), defineField({ name: 'url', title: 'URL', type: 'url', validation: rule => rule.required().uri({ scheme: ['http', 'https'] }) })] })] }),
  defineField({ name: 'featuredProjects', title: 'Homepage selection', type: 'array', description: 'Optional curated selection. Drag to reorder. Empty uses the first three featured projects in manual order.', of: [defineArrayMember({ type: 'reference', to: [{ type: 'project' }] })] }),
  defineField({ name: 'seoTitle', title: 'Search title', type: 'string' }),
  defineField({ name: 'seoDescription', title: 'Search description', type: 'text', rows: 3 }),
];
