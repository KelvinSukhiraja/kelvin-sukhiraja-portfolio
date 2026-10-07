import { afterimageSiteFields } from "../afterimageFields";
import { CogIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  icon: CogIcon,
  fields: [
    ...afterimageSiteFields,
    defineField({
      name: "heroEyebrow",
      title: "Hero eyebrow",
      type: "string",
    }),
    defineField({
      name: "heroTitle",
      title: "Hero title",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "heroBody",
      title: "Hero body",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "heroStats",
      title: "Hero focus areas",
      description:
        "Short focus labels shown in the hero (e.g. React · primary stack). Leave empty to use site defaults.",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "heroStat",
          fields: [
            defineField({ name: "value", type: "string", title: "Value" }),
            defineField({ name: "label", type: "string", title: "Label" }),
          ],
          preview: {
            select: { title: "value", subtitle: "label" },
          },
        }),
      ],
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
    }),
    defineField({
      name: "copyright",
      title: "Copyright",
      type: "string",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Site settings" }),
  },
});
