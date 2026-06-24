CHITRAM — LANDING PAGE GALLERY IMAGES
=====================================

Drop the artwork images you uploaded into THIS folder, named exactly as below.
The landing page hero strip and "featured" mosaic reference these filenames.

Recommended (used by the hero strip, left -> right):
  art-1.jpg   (e.g. the lotus/woman illustration)
  art-2.jpg   (e.g. the dancing figure with domes)
  art-3.jpg   (e.g. the floral miniature grid)
  art-4.jpg   (e.g. the colorful arch / palace gateway)
  art-5.jpg   (e.g. the pink palace window with peacock)

Optional extras (used in the "more from the gallery" mosaic if present):
  art-6.jpg ... art-13.jpg

Notes
-----
- Any of .jpg / .png works; if you use .png, update the extension in
  src/data/galleryImages.js (the filenames are listed there).
- If an image is missing, the slot falls back to a soft gradient so the page
  still looks intentional — nothing breaks.
- For production you'll typically serve real uploads from Cloudinary via the API;
  these static images are just for the marketing landing page.
