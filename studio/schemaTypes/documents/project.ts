import { afterimageProjectFields } from "../afterimageFields";
import { CaseIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const project = defineType({
  name: "project",
  title: "Project",
  type: "document",
  icon: CaseIcon,
  fields: [
    ...afterimageProjectFields,
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "year",
      title: "Year",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      title: "Type",
      type: "string",
      description: "e.g. portfolio, e-commerce, fullstack, mobile, web-app",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "image",
      title: "Thumbnail",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          type: "string",
          description: "Describe the image for accessibility",
        }),
      ],
    }),
    defineField({
      name: "description",
      title: "Short description",
      type: "text",
      rows: 3,
      description: "Shown in the projects list",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "details",
      title: "Detail description",
      type: "text",
      rows: 5,
      description: "Longer copy for the project detail modal",
    }),
    defineField({
      name: "gallery",
      title: "Gallery",
      type: "array",
      of: [
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Alt text",
              type: "string",
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "href",
      title: "URL",
      type: "url",
      validation: (rule) =>
        rule.uri({ allowRelative: true, scheme: ["http", "https"] }),
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({
      name: "order",
      title: "Sort order",
      type: "number",
      description: "Lower numbers appear first",
      initialValue: 0,
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      initialValue: true,
    }),
  ],
  orderings: [
    {
      title: "Year, newest first",
      name: "yearDesc",
      by: [
        { field: "year", direction: "desc" },
        { field: "order", direction: "asc" },
      ],
    },
    {
      title: "Manual order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: {
      title: "name",
      year: "year",
      category: "category",
      legacyType: "type",
      image: "image",
    },
    prepare({ title, year, category, legacyType, image }) {
      const projectType = category ?? legacyType;
      return {
        title,
        subtitle: [year, projectType].filter(Boolean).join(" · "),
        media: image ?? CaseIcon,
      };
    },
  },
});
