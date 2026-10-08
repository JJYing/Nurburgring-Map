![](https://github.com/JJYing/Nurburgring-Corners/blob/master/assets/screenshot.jpg?raw=true)

# Reference
- [Nurburgring Corner Names](https://oversteer48.com/nurburgring-corner-names/)
- [NRing.info](https://nring.info/nurburgring-nordschleife-corners/)
- [Nürburgring Corner Names Explained](https://www.youtube.com/watch?v=-lCR1_cDqTg)
- [【干货】纽北每一个弯的名字？](https://www.bilibili.com/video/BV1NntCe4ETM/)

# Content and discovery

- `assets/track-content.json` is the shared source for map corners, sections and bridges. Edit it to update both the Vue map and PHP guide. Preserve existing corner IDs: they are public citation anchors.
- `guide.php?lang=cn|en|de` serves the complete corner guide without JavaScript, with source links and JSON-LD matching the visible content. Map links use the same corner IDs.
- Explicit language URLs have canonical and reciprocal hreflang links. The map's language controls navigate to these URLs so metadata and content stay aligned.
- `llms.txt` is an optional readable index for AI tools; it does not guarantee indexing or citations. `sitemap.xml` lists the localized map and guide URLs.
- Deploy the PHP files, `includes/`, JSON, CSS, `llms.txt` and sitemap together. If the public URL changes, update `$siteUrl` in `includes/content.php` and absolute URLs in the sitemap and `llms.txt`.
- Submit `https://jjying.com/nurburgring/sitemap.xml` to search webmaster tools or reference it in the existing **domain-root** `robots.txt`. A robots file inside this subdirectory would not control crawling. Likewise, optionally link this project's `llms.txt` from the domain-root index. Check domain-level crawler access when deploying.
