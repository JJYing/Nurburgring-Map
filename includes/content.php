<?php
// Shared by the interactive map, server-rendered guide and structured data.
$siteUrl = 'https://jjying.com/nurburgring/';
$trackContent = json_decode(file_get_contents(__DIR__ . '/../assets/track-content.json'), true, 512, JSON_THROW_ON_ERROR);
$languageCodes = ['en' => 'en', 'cn' => 'zh-Hans', 'de' => 'de'];
function escapeHtml($value) {
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}
function contentName($item, $language) {
    return $item[$language === 'cn' ? 'ch' : $language] ?? $item['de'];
}
function contentDescription($item, $language) {
    $fields = $language === 'cn' ? ['more', 'moreEn', 'moreDe'] : ($language === 'de' ? ['moreDe', 'moreEn', 'more'] : ['moreEn', 'more', 'moreDe']);
    foreach ($fields as $field) {
        if (!empty($item[$field])) return $item[$field];
    }
    return '';
}
function structuredData($title, $description, $language, $guide = false) {
    global $siteUrl, $trackContent, $languageCodes;
    $url = $siteUrl . ($guide ? 'guide.php' : '') . '?lang=' . $language;
    $graph = [
        ['@type' => 'WebSite', '@id' => $siteUrl . '#website', 'url' => $siteUrl, 'name' => 'Nürburgring Map', 'inLanguage' => array_values($languageCodes)],
        ['@type' => 'Person', '@id' => 'https://jjying.com/#person', 'name' => 'JJ Ying', 'url' => 'https://jjying.com/'],
        ['@type' => 'WebPage', '@id' => $url . '#webpage', 'url' => $url, 'name' => $title, 'description' => $description,
         'inLanguage' => $languageCodes[$language], 'isPartOf' => ['@id' => $siteUrl . '#website'],
         'author' => ['@id' => 'https://jjying.com/#person'],
         'about' => ['@type' => 'Place', 'name' => 'Nürburgring Nordschleife', 'alternateName' => ['纽博格林北环', 'Green Hell']]],
    ];
    if ($guide) {
        $items = [];
        foreach ($trackContent['corners'] as $index => $corner) {
            $items[] = ['@type' => 'ListItem', 'position' => $index + 1, 'item' => [
                '@type' => 'Thing', 'name' => contentName($corner, $language),
                'alternateName' => array_values(array_unique([$corner['ch'], $corner['en'], $corner['de']])),
                'url' => $url . '#' . $corner['id'],
                'description' => html_entity_decode(strip_tags(contentDescription($corner, $language)), ENT_QUOTES, 'UTF-8')]];
        }
        $graph[2]['mainEntity'] = ['@id' => $url . '#corners'];
        $graph[] = ['@type' => 'ItemList', '@id' => $url . '#corners', 'name' => $title, 'numberOfItems' => count($items), 'itemListElement' => $items];
    }
    return json_encode(['@context' => 'https://schema.org', '@graph' => $graph], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_THROW_ON_ERROR);
}
