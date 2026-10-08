<?php
require_once __DIR__ . '/includes/content.php';
$requestedLanguage = $_GET['lang'] ?? 'en';
$lang = is_string($requestedLanguage) && isset($languageCodes[$requestedLanguage]) ? $requestedLanguage : ($requestedLanguage === 'zh' ? 'cn' : 'en');
$copy = [
    'cn' => ['纽北弯道名称与故事指南', '纽博格林北环（Nürburgring Nordschleife）赛道的中文、英文及德文弯道名称、介绍与照片来源。', '互动地图', '弯道目录', '参考来源', '查看地图位置', '照片来源', '本指南整理地图中的 43 个命名弯道和路段，并保留中、英、德文名称便于对照。北环也称“纽北”或“绿色地狱”；本站地图采用 20.832 公里的完整北环圈长。', '地图里程由绘制路径的行进比例换算，海拔经过插值，均为近似值。弯道故事综合以下参考资料；个别名称解释属于传说或非官方称呼。本站由 JJ Ying 独立制作。'],
    'en' => ['Nordschleife corner names and stories', 'Chinese, English and German names, descriptions and photo sources for Nürburgring Nordschleife corners and sections.', 'Interactive map', 'Corner index', 'References', 'View on map', 'Photo source', 'This guide covers the 43 named corners and sections in the map, with Chinese, English and German names for comparison. The Nürburgring Nordschleife is also known as the North Loop or Green Hell. This map uses the full 20.832 km Nordschleife lap.', 'Map distances are estimated from progress along the drawn path; elevation is interpolated. Both are approximate. Corner stories draw on the references below; some name explanations are legends or informal names. This is an independent project by JJ Ying.'],
    'de' => ['Nordschleife: Kurvennamen und Geschichten', 'Chinesische, englische und deutsche Namen, Beschreibungen und Bildquellen der Kurven und Abschnitte der Nürburgring-Nordschleife.', 'Interaktive Karte', 'Kurvenverzeichnis', 'Quellen', 'Auf der Karte ansehen', 'Bildquelle', 'Dieser Leitfaden enthält die 43 benannten Kurven und Abschnitte der Karte mit chinesischen, englischen und deutschen Namen. Die Nürburgring-Nordschleife ist auch als „Grüne Hölle“ bekannt. Die Karte verwendet die volle Rundenlänge von 20,832 km.', 'Entfernungen werden aus dem Fortschritt entlang der gezeichneten Strecke geschätzt; Höhenangaben sind interpoliert. Beide sind Näherungswerte. Kurvengeschichten basieren auf den folgenden Quellen; manche Erklärungen sind Legenden oder inoffizielle Namen. Dies ist ein unabhängiges Projekt von JJ Ying.'],
][$lang];
$canonical = $siteUrl . 'guide.php?lang=' . $lang;
header('Content-Type: text/html; charset=UTF-8');
?><!doctype html>
<html lang="<?= $languageCodes[$lang] ?>">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= escapeHtml($copy[0]) ?> | Nürburgring Map</title>
  <meta name="description" content="<?= escapeHtml($copy[1]) ?>">
  <meta name="author" content="JJ Ying">
  <link rel="canonical" href="<?= escapeHtml($canonical) ?>">
<?php foreach ($languageCodes as $code => $locale): ?>
  <link rel="alternate" hreflang="<?= $locale ?>" href="<?= $siteUrl ?>guide.php?lang=<?= $code ?>">
<?php endforeach; ?>
  <link rel="alternate" hreflang="x-default" href="<?= $siteUrl ?>guide.php?lang=en">
  <link rel="icon" href="assets/fav.png">
  <link rel="stylesheet" href="assets/guide.css">
  <meta property="og:type" content="website">
  <meta property="og:url" content="<?= escapeHtml($canonical) ?>">
  <meta property="og:title" content="<?= escapeHtml($copy[0]) ?>">
  <meta property="og:description" content="<?= escapeHtml($copy[1]) ?>">
  <meta property="og:image" content="https://s.anyway.red/nurburgring/og.png">
  <script type="application/ld+json"><?= structuredData($copy[0], $copy[1], $lang, true) ?></script>
</head>
<body>
  <header>
    <a href="./?lang=<?= $lang ?>"><?= escapeHtml($copy[2]) ?> ↗</a>
    <nav aria-label="Language"><a href="?lang=cn" lang="zh-Hans" hreflang="zh-Hans">中文</a> · <a href="?lang=en" lang="en" hreflang="en">English</a> · <a href="?lang=de" lang="de" hreflang="de">Deutsch</a></nav>
  </header>
  <main>
    <h1><?= escapeHtml($copy[0]) ?></h1>
    <p class="intro"><?= escapeHtml($copy[7]) ?></p>
    <p><?= escapeHtml($copy[8]) ?></p>
    <nav aria-labelledby="corner-index">
      <h2 id="corner-index"><?= escapeHtml($copy[3]) ?></h2>
      <ol class="index">
<?php foreach ($trackContent['corners'] as $corner): ?>
        <li><a href="#<?= $corner['id'] ?>"><?= escapeHtml(contentName($corner, $lang)) ?> <span lang="de"><?= escapeHtml($corner['de']) ?></span></a></li>
<?php endforeach; ?>
      </ol>
    </nav>
<?php foreach ($trackContent['corners'] as $corner): ?>
    <article id="<?= $corner['id'] ?>">
      <h2><a href="#<?= $corner['id'] ?>"><?= escapeHtml(contentName($corner, $lang)) ?></a></h2>
      <dl class="names">
        <dt>Deutsch</dt><dd lang="de"><?= escapeHtml($corner['de']) ?></dd>
        <dt>English</dt><dd lang="en"><?= escapeHtml($corner['en']) ?></dd>
        <dt>中文</dt><dd lang="zh-Hans"><?= escapeHtml($corner['ch']) ?><?= !empty($corner['nk']) && $corner['nk'] !== $corner['ch'] ? ' / ' . escapeHtml($corner['nk']) : '' ?></dd>
      </dl>
<?php if (contentDescription($corner, $lang)): ?>
      <p><?= contentDescription($corner, $lang) ?></p>
<?php endif; ?>
      <a class="map-link" href="./?lang=<?= $lang ?>#<?= $corner['id'] ?>"><?= escapeHtml($copy[5]) ?> ↗</a>
<?php if (!empty($corner['imgs'])): ?>
      <div class="photos">
<?php foreach ($corner['imgs'] as $photo): ?>
        <figure>
          <img src="https://s.anyway.red/nurburgring/<?= escapeHtml($photo['src']) ?>!/fh/300/quality/68/progressive/true/ignore-error/true" alt="<?= escapeHtml($corner['de']) ?>" loading="lazy" width="400" height="240">
<?php if (!empty($photo['url'])): ?>
          <figcaption><a href="<?= escapeHtml($photo['url']) ?>"><?= escapeHtml($copy[6]) ?>: <?= escapeHtml($photo['author']) ?></a></figcaption>
<?php endif; ?>
        </figure>
<?php endforeach; ?>
      </div>
<?php endif; ?>
    </article>
<?php endforeach; ?>
    <section id="references">
      <h2><?= escapeHtml($copy[4]) ?></h2>
      <ul>
        <li><a href="https://oversteer48.com/nurburgring-corner-names/">Nürburgring Corner Names — Oversteer48</a></li>
        <li><a href="https://nring.info/nurburgring-nordschleife-corners/">Nordschleife corners — NRing.info</a></li>
        <li><a href="https://www.youtube.com/watch?v=-lCR1_cDqTg">Nürburgring Corner Names Explained</a></li>
        <li><a href="https://www.bilibili.com/video/BV1NntCe4ETM/" lang="zh-Hans">纽北每一个弯的名字？</a></li>
        <li><a href="https://veloviewer.com/segment/5539685">Elevation profile — VeloViewer</a></li>
      </ul>
    </section>
  </main>
  <footer><a href="https://github.com/JJYing/Nurburgring-Map">Source · JJ Ying</a> · <a href="llms.txt">llms.txt</a> · <a href="assets/track-content.json">JSON</a></footer>
</body>
</html>
