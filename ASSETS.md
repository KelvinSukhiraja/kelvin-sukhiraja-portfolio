# Artwork and fonts

The active hero uses the user-selected ouroboros drawing, preserved in public/art/ouroboros-reference.png. scripts/prepare-ouroboros.mjs samples it into 7,533 glyphs and a static SVG. src/lib/ouroboros.ts animates these glyphs, rendered by src/components/hero-art.tsx. It contains no photographic texture. The following landscape assets and refraction scene are archived and no longer used by the homepage.

The decorative landscape was generated with the built-in ImageGen tool. It is not a client-project screenshot.

- Runtime asset: `public/art/coast.webp` (1200px wide, approximately 274 KB).
- Source asset: `public/art/coast.png`.
- The old Sanity hero artwork field is retained for compatibility; it does not override the ouroboros.
- Glass, distortion and ASCII dissolution are rendered by `src/components/refraction-scene.tsx`.

Generation prompt:

> Create a photographic texture asset for a refined monochrome creative developer portfolio, no text, no lettering, no UI, no glass object. Portrait 3:4 fine art black-and-white photograph of a rugged volcanic coastline, dramatic layered basalt cliffs to the left and silver ocean surf to the right, far horizon lost into pale atmospheric gray fog, foreground almost black jagged rocks. Cinematic editorial landscape, restrained delicate highlights, rich shadow detail, tactile analog photographic quality but no heavy grain. Beautiful high contrast structural composition suitable for a bending image plane in WebGL and ASCII transformation. Realistic natural geology, cloudy overcast soft daylight, no humans, no buildings, no logos. Full image photographic edge to edge.

All project previews come from the existing Sanity dataset. They have not been replaced with generated interface concepts.

Manrope and Cormorant Garamond are self-hosted under `public/fonts`, with their SIL Open Font License files. No external font request is required at runtime.



The startup fallback is public/art/ouroboros-still.webp, pre-rendered from the SVG at 2x resolution. The SVG remains a reproducible source rather than a first-load dependency.


## Heritage study (2026-10-07)
`public/art/raden-saleh-tiger-study.webp` is a generated contemporary interpretation of the user-supplied Raden Saleh painting, not an authentic reproduction. The transparent artwork was generated with the built-in imagegen tool and optimized with Sharp to a 1400px WebP (421 KB).

Reference: Raden Saleh, *Tigers Fighting over a Dead Javanese*, 1870, Belvedere inventory 7899. Attribution verified against https://commons.wikimedia.org/wiki/File:Raden_Saleh_-_K%C3%A4mpfende_Tiger_%C3%BCber_der_Leiche_eines_Javaners_1870_-_Belvedere_Wien_Inv.Nr._7899.jpg which links the Belvedere collection record. Source reference provided by the user; Commons marks the painting public domain.

Prompt: Reinterpret only the two intertwined tigers, preserving their sideways composition, striped bodies and expressive heads. Remove scenery, ground, vegetation and human figure. Transparent cutout; contemporary vermilion #ff492d, ivory and near-black screenprint with restrained halftone detail. No typography or extra objects. Contemporary interpretive study after the painting.

The on-page caption credits the source and explicitly identifies the generated treatment. The interaction is a 2.5D image tilt, with an image-sampled ASCII projection, not a reconstructed 3D tiger model.

## Poster / ASCII refinement (2026-10-07)
The heritage headline uses self-hosted Pirata One from Google Fonts, under the SIL Open Font License (`public/fonts/pirata-one-OFL.txt`). Source: https://github.com/google/fonts/tree/main/ofl/pirataone . The existing tiger asset is unchanged. Supporting text is monochrome; no personal regional identity is inferred. The texture combines image samples with diamond halftone cells and ASCII characters, varying density and displacement on input.

The monis. Workspace Builder image is an actual screenshot of the user-provided live project with its Studio preset selected. It was uploaded with the new Sanity project `project-monis-workspace-builder`. Copy describes observed functionality and explicitly treats rental pricing and requests as a demo. No unverified technology claims or measured outcomes were added.

## Red / pink revision
`public/art/raden-saleh-tiger-pink-red.webp` is the new generated color treatment, optimized to 1400px WebP. The previous vermilion asset is retained. Edit prompt: preserve the two tigers' pose, silhouette and stripe structure; recolor exclusively in candy pink (#f16ade) and scarlet (#ff292f), following the user's folk-poster color reference, with grainy screenprint ink and a transparent background. No text or additional objects. Generated via imagegen; original painting attribution remains unchanged.

Print textures: print-distress-heavy.svg and print-distress-fine.svg are original procedural SVG ink masks. Static tiled turbulence creates ink dropout without adding an animation loop. The headline uses heavier distress; the tiger and restored subtitle use finer grain.

Heritage lettering uses printed-letter-grain.svg, an original procedural mask with soft alpha variation. The background ASCII samples the earlier high-contrast tiger engraving to preserve stripes; it is mirrored and offset as a second impression. The pink foreground remains free of added texture.

CV: public/documents/Kelvin-Sukhiraja-CV-2026.pdf is an unchanged copy of the user-provided KelvinSukhiraja_CV_2026 (1).pdf, linked as a download in the footer.
