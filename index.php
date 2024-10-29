<?PHP
header("Cache-Control: no-cache");
require_once ("env.php");
$lastEditTime = date ("jhi", filemtime(__FILE__));

$acceptLanguage = $_SERVER['HTTP_ACCEPT_LANGUAGE'];
$languages = explode(',', $acceptLanguage);
$zhLanguages = [];
$lang = "en";
foreach($languages as $lang){
  if(strpos(trim($lang), 'zh-') === 0){
    $zhLanguages[] = $lang;
  }
}
if(!empty($zhLanguages)) $lang = "cn";
if(isset($_GET['lang']) && $_GET['lang'] == "cn") $lang = "cn";
if(isset($_GET['lang']) && $_GET['lang'] == "en") $lang = "en";

if($lang == "cn"){
  $extraHead = "";
  // $pageTitle="纽北赛道地图";
  // $pageDesc="可交互的纽博格林北环赛道地图，展示了众多弯道的介绍和图片";
  // $pageLang="zh-Hans";
  $jsLang = "cn";
}
else{
  $extraHead = "";
  // $pageTitle="Nürburgring Map";
  // $pageDesc="An interactive map of Nürburgring race track";
  // $pageLang="en-US";
  $jsLang = "en";
}

echo
<<<HTML
<html lang="zh-Hans">
	<head>
    <meta charset="UTF-8">
    <title>纽北赛道地图 Nürburgring Map</title>
    <meta name="robots" content="noodp"/>
    <meta name="author" content="JJ Ying" />
    <meta name="description" content="可交互的纽博格林北环赛道地图，展示了众多弯道的介绍和图片 An interactive map of Nürburgring race track"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
    <meta name="format-detection" content="telephone=no">

    <meta property="og:url" content="https://jjying.com/nurburgring">
    <meta property="og:type" content="website">
    <meta property="og:title" content="纽北赛道地图">
    <meta property="og:description" content="可交互的纽博格林北环赛道地图，展示了众多弯道的介绍和图片">
    <meta property="og:image" content="https://s.anyway.red/nurburgring/og.png">

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="纽北赛道地图" />
    <meta name="twitter:description" content="可交互的纽博格林北环赛道地图，展示了众多弯道的介绍和图片" />
    <meta name="twitter:site" content="@JJYing" />
    <meta name="twitter:image" content="https://s.anyway.red/nurburgring/og.png" />

    <link rel="preconnect" href="https://s.anyway.red">
    <link rel="preconnect" href="https://anyway.fm">
    <link rel="stylesheet" href="{$assetsDir}/main.css?v={$lastEditTime}"/>
    {$extraHead}
    <link rel="stylesheet" href="{$assetsDir}/sm/result.css"/>
    <link rel="icon" href="{$assetsDir}/fav.png">

    <style>[v-cloak],.hidden-area{display: none;}</style>

    <script>
      var lang = '{$jsLang}'
      var _paq = window._paq = window._paq || [];
      _paq.push(['trackPageView']);
      _paq.push(['enableLinkTracking']);
      (function() {
        var u="//anyway.fm/matomo/";
        _paq.push(['setTrackerUrl', u+'matomo.php']);
        _paq.push(['setSiteId', '3']);
        var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
        g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
      })();
    </script>

	</head>
<body>
<div id="app" :class="[showAllCornerNames ? 'show-all-corners' : '', lang ]">
  <!-- <div class="debug">P: {{p.toFixed(3)}}<br/>X: {{mX.toFixed(3)}}<br/>Y: {{mY.toFixed(3)}}</div> -->
  <div class="track-map">
    <div class="inner">
      <svg viewBox="0 0 660 530" class="main-svg" width="6600px" height="5300px">
        <def>
          <path d="M246.6 482.9c-.8-.8-1.6-1.7-2.4-2.8l-1.7-2.3c-3.7-5.6-2.8-7-6.9-7.3-2-.1-4.3 0-6.9 4.7a23.2 23.2 0 0 1-5 6.4c-4.2 3.8-8.7 7-14.2 7-5.8 0-7.6-3-14.4-5.2a30.4 30.4 0 0 0-15.4-.6c-2 1-1.8 1.2-3.4 1.4-2.1.2-4-1-5.6-2.6-2.4-2.6-3.4-4.4-5.7-7.4-1.7-2.3-4.5-3.6-6-6.2-1-1.8-.6-2.7-3-4.5-1.6-1.2-8.7-1.1-13.4-2.8-3.7-1.2-3.3-6.1-5.8-9.9-2.4-3.7-14.7-11-21.7-16.9-8.4-8.8-8.7-9.6-12-13.4-3.4-3.8-6.4-6.7-9-10.4a15.6 15.6 0 0 1-3.1-10.9c1-9.8 6.7-17.6 6.8-28.7 0-7.7.6-11.2-1.2-23.8-.7-5-2.4-8.5-4.3-13.3a305 305 0 0 0-15-32.4c-2.2-4-5.3-7-9-9.2-4-2.3-8.8-4.3-13.3-6.6a5.6 5.6 0 0 1-3-6c1-4.4 7.3-4.7 14.7-8.2 9-4.2 13-6.7 18.2-11.2 6.3-5.5 12-9.3 18.1-15.3 4.3-4.2 8-6.8 11.5-13.7 1.9-3.8 3.2-7 4.3-11.4 1.5-6.5.1-12.2 1.1-15.7 1.2-4.2 6-5 6.6-8 .6-3-2.8-6.3-1.2-10.6 1-2.6 7.6-6 12.3-10.2 3.9-3.3 3.3-4.2 7-8.1 7.2-7.7 7.7-6.6 15.3-15.2a24 24 0 0 0 6.4-11.5c1.2-5.9-1.5-11.2-3.6-16-.7-1.5-1.9-2.4-3.8-3.2-1.7-.6-4.3.2-6.1-.5-3-1.2-5-2.1-7.8-4.4-3.6-2.8-5.1-5.3-5.3-7.4-.2-2.7 1.4-3.7 3.4-4.6a53 53 0 0 0 15.4-10.2c2.5-2.6 1.2-5.9 2.7-9.4A23 23 0 0 1 166 77c3.3-3.2 8-4.9 13.7-2.3a57.6 57.6 0 0 1 16.4 11c1.5 1.4 1 6 4.2 5.8 4.3-.1 2.1-3 6.6-5.1 7-3.4 16.7-3.8 23.8-2 3.4.8 7.2 2.8 10.6 2.3 4.4-.7 6-4.4 6.4-6.1.9-4-.1-9.7 2-12.5 2.3-2.9 3.4-4.4 17.5-9 13.4-4.3 18.2-1.8 25-4.5 8-3 14.2-13 20.4-12.6 3.2.2 6.3 2 6.9 5.7 1 6.8-.6 13.5-.7 19.7 0 14 4 21.7 6.7 24.8 5.5 6 11.4 9.5 18 12.6 5.1 2.4 9.2 4.7 16.2 4.8 13.2.2 23.3 0 33.4 2.4a53.4 53.4 0 0 1 18.7 6.9c4.2 2.9 6.6 5.6 10.6 8.1 7.6 4.7 13 6.8 19.2 6 5-.8 11.9-5.4 17.1-9.8 4.5-3.7 8.5-9.4 14.2-10.6 8.6-1.9 12.8-.8 18.5-3.1 5-2 7.6-2.1 9-.8 3.5 3.3.9 7-1.6 8.8-5.8 4.4-15.5 12.2-18.3 13-6.8 1.6-5.5 7.3-4 8.8 3.5 3.5 8.8 1 9.5-1.6.5-1.9 2-3 4.8-5.1a48 48 0 0 1 13-6.4c2.8-1 4.6-2 11.9-2.8 5.3-.6 10.7-7.5 15-13.6 5.4-8 .3-9.3 1.5-13.8 1-3.8 2-7.7 7-11 4.1-3 26.3 4.5 28 5.5 3.9 2.4 5.8 7 9.4 8.8 4.3 2 6 2 9.5 3.6a38 38 0 0 1 10.3 15.3c.2 5-8.4 18.5-3.3 23 4.5 4 5.9 2.8 11 5.3 3.4 1.8 3.4 7.5 3.7 11.4.2 3.8 0 8.9-3 10.5-6.2 3.3-14.6-1.7-21.6.2-3.7 1-2.4 5.9-7 11.8-5.5 6.8-8 14.4-8 18.7 0 6.3.6 14.3 0 20-.2 3-2 6.5-4.7 7.8-4.5 2.3-8.8 1.9-12.5 4.6-4 2.8-6.4 6-10.1 10-3.6 4-4.3 6.4-6.5 11.3-2 4.2-3.6 6-5.9 8.7-2 2.4-5.1 3.5-7.7 5.3-2.5 1.6-4.7 4.3-8.9 5.4-11.3 3-21.9 7.8-32.7 8.6-7 .5-9.5-8.4-16.5-8.3-2.9 0-5.7 1.7-8.2 3.4-4.3 3-8.6 5.1-8.3 8.7 1 11.5 22.4 10.7 28 19.6 2 3 4.7 7 4.2 14-.2 3.9-3.3 7-6.2 9.3-6.6 5.4-29.9 18.6-45.1 27.8L351.8 402c-13.8 8.7-35.7 21.7-41.6 26.1-14.2 10.8-26.5 31-29.7 35.7-2 2.9-8.9 7.7-9.6 9.9-1 2.5-.7 7.4-3.2 9.2-3 2.1-4.7 1.3-7.8 1.3-2.7 0-2 .7-4.9 1.3-1.8.4-5 .3-8.3-2.6"  id="track"/>
        </def>
        
        <g class="section" :class=" showSection ? 'show' : 'hidden' " :style=" '--st:' + sectionStart + ';--ed:' + sectionEnd" >
          <use href="#track" class="path"></use>
        </g>

        <use href="#track" class="base base2"/>

        <g class="extras">
          <path v-for="c in bridges" class="bridge" :d=" 'M' + w * c.stx + ' ' + h * c.sty + 'L' + w * c.edx + ' ' + h * c.edy"/>
          <path class="bridge" :d=" 'M' + w * .367 + ' ' + h * .919 + 'L' + w * .379 + ' ' + h * .903"/>
        </g>

        <use href="#track" class="base"/>

        <g class="corner" :class=" showCorner ? 'show' : 'hidden' " :style=" '--st:' + cornerStart + ';--ed:' + cornerEnd" >
          <use href="#track" class="path"></use>
        </g>

        <use href="#track" class="progress"/>
      </svg>
      <div v-for="c in bridges" class="corner-name bridge-name" :class="[ (c.pt < p) || showAllCornerNames ? 'show' : 'hidden', c.h, c.v, c.pt - 0.001 < p && p < c.pt + 0.001 ? 'highlighted' : '']" :style=" '--x:' + c.x + ';--y:' + c.y " @click="setP(c.pt)">
        <div>
            <div>
              <template v-if="lang == 'cn'">{{c.ch}}</template>
              <template v-if="lang == 'en'">{{c.en}}</template>
            </div>
        </div>
      </div>
      <div v-for="c in sections" class="corner-name section-name" :class="[ (c.st < p) || showAllCornerNames ? 'show' : 'hidden', c.h, c.v, c.st < p && p < c.ed ? 'highlighted' : '']" :style=" '--x:' + c.x + ';--y:' + c.y " @click="setP((c.st + c.ed) / 2)">
        <div>
            <div>
              <template v-if="lang == 'cn'">{{c.ch}}</template>
              <template v-if="lang == 'en'">{{c.en}}</template>
            </div>
        </div>
      </div>
      <div v-for="c in corners" class="corner-name" :class="[ (c.st < p) || showAllCornerNames ? 'show' : 'hidden', c.h, c.v, c.st < p && p < c.ed ? 'highlighted' : '' ]" :style=" '--x:' + c.x + ';--y:' + c.y " @click="setP( (c.st + c.ed) / 2)">
        <div>
            <div>
              <template v-if="lang == 'cn'">{{c.ch}}</template>
              <template v-if="lang == 'en'">{{c.en}}</template>
            </div>
        </div>
      </div>

      <div class="mid " v-cloak>

        <div class="msg" v-if="p == 0">
          <div class="inner" v-if="p == 0" v-cloak>
            <p class="title-font msg-title" v-if="lang == 'cn'">纽北赛道地图</p>
            <p class="title-font msg-title" v-if="lang == 'en'">Nürburgring Map</p>
            <p v-if="lang == 'cn'"><a href="https://zh.wikipedia.org/zh-hans/%E7%BA%BD%E5%8D%9A%E6%A0%BC%E6%9E%97%E8%B5%9B%E9%81%93" target="_blank">纽博格林赛道</a>（德语：Nürburgring）修筑于 1920 年代，由于跑道非常长、地形复杂充满挑战性，被认为是世界上最严苛的竞速赛道，其中的北环俗称为“纽北”，又叫“绿色地狱”。这里很多弯道都有独特的名字和故事，通过本地图可以方便爱好者学习。</p>
            <p v-if="lang == 'en'"><a href="https://en.wikipedia.org/wiki/N%C3%BCrburgring" target="_blank">Nürburgring</a> is a German race track built in 1920s, and the North Loop(Nordschleife) of it is very famous and challenging for racers around the world, through this interactive map you can learn the names of the corners in Nürburgring</p>
            <div class="indicator">
              <div v-if="lang == 'cn'">向下滚动或点击弯道名查看地图</div>
              <div v-if="lang == 'en'">Scroll or click the corner to start</div>
              <svg viewBox="0 0 100 100" class="scroll-arrow">
                <path d="M10 20l40 30l40 -30"/>
                <path d="M10 60l40 30l40 -30"/>
              </svg>
            </div>
          </div>
        </div>

        <div class="title-font miles"  v-if="p != 0">
          <span v-if="p > 0">{{ (p * 20.832).toFixed(2)}}</span><span v-else>0.00</span> <em>KM</em>
        </div>
      </div>
    </div>
  </div>
  <div class="desc skew-p">
    <div class="logo">
      <div class="inner skew-n">
        <span class="title-font" v-if="lang == 'cn'">纽<span>博格林</span>北<span>环</span>赛道地图</span>
        <span class="title-font" v-if="lang == 'en'">Nürburgring Map</span>
        <img src="{$assetsDir}/logo.svg" alt="纽北赛道地图"/>
      </div>
    </div>
    <div class="corner-info">
      <div class="inner" v-if="currentCorner && p > 0" v-cloak>
        <div class="primary skew-n title-font" v-if="lang == 'cn' && currentCorner.ch" :class="currentCorner.ch == currentCorner.nk ? 'qt' : '' " v-cloak>{{currentCorner.ch}}</div>
        <div class="primary skew-n" v-if="lang == 'en' && currentCorner.en" v-cloak>{{currentCorner.en}}</div>
        <div class="nickname qt skew-n title-font" v-if="lang == 'cn' && currentCorner.nk && currentCorner.ch != currentCorner.nk" v-cloak>{{currentCorner.nk}}</div>
        <div class="secondary skew-n" v-if="currentCorner.en" v-cloak>
          <span class="extra" v-if="currentCorner.de">
            <svg viewBox="0 0 5 3" class="skew-p">
              <rect id="black_stripe" width="5" height="3" y="0" x="0" fill="#000"/>
              <rect id="red_stripe" width="5" height="2" y="1" x="0" fill="#6C6C6C"/>
              <rect id="gold_stripe" width="5" height="1" y="2" x="0" fill="#DADADA"/>
            </svg> {{currentCorner.de}}
          </span>
          <span class="extra" v-if="lang == 'cn' && currentCorner.en">
            <svg viewBox="0 0 60 30" class="skew-p">
              <clipPath id="s">
                <path d="M0,0 v30 h60 v-30 z"/>
              </clipPath>
              <clipPath id="t">
                <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/>
              </clipPath>
              <g clip-path="url(#s)">
                <path d="M0,0 v30 h60 v-30 z" fill="#292929"/>
                <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" stroke-width="6"/>
                <path d="M0,0 L60,30 M60,0 L0,30" clip-path="url(#t)" stroke="#646464" stroke-width="4"/>
                <path d="M30,0 v30 M0,15 h60" stroke="#fff" stroke-width="10"/>
                <path d="M30,0 v30 M0,15 h60" stroke="#646464" stroke-width="6"/>
              </g>
            </svg> {{currentCorner.en}}
          </span>
        </div>
        <div class="more skew-n" v-if="lang == 'cn' && currentCorner.more" v-html="currentCorner.more"></div>
      </div>
      <div class="inner desc-msg" v-if="p == 1" v-cloak>
        <div class="ending skew-n" v-if="p > 0.999">
          The End
          <div class='btn skew-p' @click="setP(0.001)">
            <div class='skew-n title-font' v-if="lang == 'cn'">回到起点</div>
            <div class='skew-n' v-if="lang == 'en'">Start Over</div>
          </div>
        </div>
      </div>
      <div class="thumbs" v-if="currentCorner && currentCorner.imgs" v-cloak>
        <div class="thumb" v-for="img in currentCorner.imgs" :class="img.url ? 'has-author' : '' ">
          <img class="skew-n" :src=" 'https://s.anyway.red/nurburgring/' + img.src + '!/fh/300/quality/68/progressive/true/ignore-error/true' " loading="lazy" @click="openModal('image', img)"/>
          <a class="thumb-source" v-if="img.url" :href="img.url" target="_blank" title="查看照片来源"><span class="skew-n">{{img.author}}</span></a>
        </div>
      </div>
    </div>
    <div class="controls">

      <div class="inner skew-n">

        <div @click="openModal('text')" role="button" class="link">
          <template v-if="lang == 'cn'">关于本站</template>
          <template v-if="lang == 'en'">About</template>
        </div>

        <div class="toggle-group" :class=" showAllCornerNames ? 'on' : 'off' " @click="showAllCornerNames = !showAllCornerNames">
          <span v-if="lang == 'cn'">显示所有弯道</span>
          <span v-if="lang == 'en'">All Corners</span>
          <div class="toggle"></div>
        </div>

        <div class="toggle-group" :class=" darkMode ? 'on' : 'off' " @click="toggleDarkMode()">
          <span v-if="lang == 'cn'">深色模式</span>
          <span v-if="lang == 'en'">Dark Mode</span>
          <div class="toggle"></div>
        </div>

        <div class="toggle-group" :class=" lang == 'cn' ? 'on' : 'off' " @click="toggleLang()">
          <span v-if="lang == 'cn'">中文</span>
          <span v-if="lang == 'en'">Chinese</span>
          <div class="toggle"></div>
        </div>

      </div>
    </div>
  </div>

  <div class="modal text" :class="[showModal && modalType == 'text' ? 'show' : '']" @click="showModal = false">
    <div class="inner" @click="innerModal(event)">
      <div class="modal-content skew-n" v-html="modalContent" @click="showModal = false"></div>
      <div class="modal-close skew-n" @click="showModal = false">
        <svg viewBox="0 0 30 30">
          <circle cx="15" cy="15" r="12"/>
          <path d="M10 10L20 20M20 10L10 20"/>
        </svg>
      </div>
    </div>
  </div>

  <div class="modal image" :class="[showModal && modalType == 'image' ? 'show' : '']" @click="showModal = false">
    <div class="inner" @click="innerModal(event)">
      <div class="modal-content skew-n" v-html="modalContent"></div>
      <div class="modal-close skew-n" @click="showModal = false">
        <svg viewBox="0 0 30 30">
          <circle cx="15" cy="15" r="12"/>
          <path d="M10 10L20 20M20 10L10 20"/>
        </svg>
      </div>
    </div>
  </div>

  <div class="all-names title-font"><template v-for="c in corners" >{{c.ch}} <template v-if="c.nk && c.ch != c.nk">{{c.nk}} </template></template> </div>
</div>
<script src='{$assetsDir}/vue-2.6.11.min.js'></script>
<script src="{$assetsDir}/main.js?v={$lastEditTime}"></script>
</body>
</html>
HTML;
?>
