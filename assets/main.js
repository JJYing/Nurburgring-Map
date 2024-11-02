let rootURL = document.baseURI
var root = document.querySelector(':root')
const body = document.querySelector('body');
if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches){
  root.classList.add('dark')
}


var d = new Vue({
  el: '#app',
  data: {
    p: 0,
    w: 660,
    h: 530,
    mX: 0,
    mY: 0,
    lang: lang,
    showModal: false,
    showAllCornerNames: false,
    darkMode: window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches,
    showCorner: false,
    showSection: false,
    currentCorner: null,
    scrollDistance: 0,
    cornerStart: 0,
    cornerEnd: 0,
    sectionStart: 0,
    sectionEnd: 0,
    bridges: [
      {
        "stx":.0855,
        "sty":.508,
        "edx":.091,
        "edy":.528,
        "pt": .188,
        "x": .104,
        "y": .5,
        "h": "r",
        "v": "b",
        "ch": "优科豪马桥",
        "en": "Yokohama Bridge",
      },
      {
        "stx":.666,
        "sty":.644,
        "edx":.675,
        "edy":.662,
        "pt": .869,
        "x": .663,
        "y": .634,
        "h": "r",
        "v": "m",
        "ch": "BTG 终点桁架",
      },
      {
        "stx":.47,
        "sty":.796,
        "edx":.479,
        "edy":.813,
        "pt": .949,
        "x": .484,
        "y": .818,
        "h": "l",
        "v": "t",
        "ch": "BTG 起点桥",
      },
    ],
    sections: [
      // {
      //   "st":.019,
      //   "ed":.064,
      //   "x":.297,
      //   "y":.892,
      //   "h": "c",
      //   "v": "b",
      //   "ch": "Hatzenbach",
      //   "en": "Hunt Stream",
      //   "de": "Hatzenbach",
      // },
      // {
      //   "st":.188,
      //   "ed":.237,
      //   "x":.155,
      //   "y":.440,
      //   "h": "r",
      //   "v": "b",
      //   "ch": "狐狸洞",
      //   "en": "Foxhole",
      //   "de": "Fuchsröhre",
      // }
      {
        "st":.681,
        "ed":.701,
        "x":.901,
        "y":.290,
        "h": "r",
        "v": "m",
        "ch": "小水井",
        "en": "Small Water",
        "de": "Brünnchen",
      }
    ],
    corners: [
      {
        "st": .006,
        "ed": .014,
        "x": .357,
        "y": .876,
        "h": "c",
        "v": "b",
        "ch": "萨宾娜",
        "en": "Sabine Schmitz Curve",
        "de": "Sabine-Schmitz-Kurve",
        "more": "为了纪念在此开了至少 33,000 圈的纽北女王 <a href='https://zh.wikipedia.org/zh-cn/%E8%96%A9%E8%B3%93%C2%B7%E6%96%BD%E5%AF%86%E8%8C%A8' target='blank'>Sabine Schmitz</a>，她曾两次赢得纽博格林 24 小时耐力赛，也是第一位赢得这项传奇赛事的女性。",
        "imgs": [
          {
            "src": "sabine-3.jpg",
            "url": "https://themotorsporthubni.com/2024/03/16/sabine-schmitz-queen-of-the-nurburgring/",
            "author": "Miguel Bosch"
          },
          {
            "src": "sabine-1.jpg",
            "url": "https://www.motorbox.com/auto/sport/news/motorsport-piange-sabine-schmitz-regina-nurburgring-nordschleife",
            "author": "motorbox"
          },
        ],
      },
      {
        "st": .019,
        "ed": .032,
        "x": .32,
        "y": .933,
        "h": "c",
        "v": "t",
        "ch": "Hatzenbach Bogen",
        "en": "Hunt Stream Curve",
        "de": "Hatzenbach Bogen",
        // "nk": "弧形弯",
      },
      {
        "st":.033,
        "ed":.063,
        "x":.262,
        "y":.896,
        "h": "l",
        "v": "b",
        "ch": "Hatzenbach",
        "en": "Hunt Stream",
        "de": "Hatzenbach",
        "more": "其实是一个挺长的组合弯，包含了两快五慢总共七个弯道",
        "imgs": [
          {
            "src": "hatzenbach-1.jpg",
            "author": "Gruppe C GmbH",
            "url": "https://www.24h-rennen.de/camping-hatzenbach/"
          },
          {
            "src": "hatzenbach-3.jpg",
            "url": "https://racetours.co.uk/",
            "author": "RaceTours"
          },
        ],
      },
      // {
      //   "st": .038,
      //   "ed": .049,
      //   "x": .256,
      //   "y": .921,
      //   "h": "r",
      //   "v": "t",
      //   "ch": "扭扭弯",
      //   "nk": "扭扭弯"
      // },
      {
        "st": .065,
        "ed": .076,
        "x": .203,
        "y": .867,
        "h": "r",
        "v": "t",
        "ch": "大橡树",
        "de": "Hoheichen",
        "en": "High Oaks",
        "imgs": [
          {
            "src": "hoheichen-1.jpg",
            "url": "https://www.studio-397.com/",
            "author": "rFactor 2"
          },
        ],
      },
      {
        "st": .08,
        "ed": .116,
        "x": .172,
        "y": .78,
        "h": "l",
        "v": "t",
        "ch": "奎德巴赫高地",
        "de": "Quiddelbacher Höhe",
        "en": "Quiddelbach Height",
        "more": "很多人会把这一段和接下来的飞机场搞混，但事实上当年 GTR 起飞所在的这个右弯和之前的大直道都是以边上村庄 Quiddelbacher 命名的",
        "imgs": [
          {
            "src": "quiddelbacher-2.jpg",
            "author": "dh-ontour.de",
            "url": "https://www.dh-ontour.de/nuerburgring/runde/eine_runde04.htm"
          },
          {
            "src": "flugplatz-2.jpg",
            "author": "The Mirror",
            "url": "https://www.mirror.co.uk/sport/gallery/nissan-gt-r-nismo-horror-5417893"
          },
        ],
      },
      {
        "st": .117,
        "ed": .127,
        "x": .133,
        "y": .714,
        "h": "r",
        "v": "m",
        "ch": "飞机场",
        "de": "Flugplatz",
        "en": "Airfield",
        "more": "2015 年改造之前这里有个坡，的确容易让车腾空，但事实上这里叫「飞机场」的原因是在这个弯道边上以前有个飞机场",
        "imgs": [
          {
            "src": "flugplatz-1.jpg",
            "url": "https://smallblogv8.blogspot.com/2015/08/the-nurburgring-nordschleife-is-finally.html",
            "author": "Small Blog V8"
          },
        ],
      },
      {
        "st": .129,
        "ed": .139,
        "x": .159,
        "y": .670,
        "h": "l",
        "v": "m",
        "ch": "Kottenborn",
        "en": "Kottenborn",
        "de": "Kottenborn",
        "en": "Kottenborn",
        "more": "以附近的小镇命名，但最近也没人这么叫了，都直呼「飞机场和瑞典十字之间那个左弯」",
        "imgs": [
          {
            "src": "kottenborn-1.jpg",
            "url": "https://www.flickr.com/photos/jimculp/30905906765",
            "author": "Jim Culp"
          },
        ],
      },
      // {
      //   "st": .145,
      //   "ed": .162,
      //   "x": .118,
      //   "y": .613,
      //   "h": "r",
      //   "v": "m",
      //   "ch": "草原直线",
      // },
      {
        "st": .163,
        "ed": .172,
        "x": .105,
        "y": .57,
        "h": "r",
        "v": "t",
        "ch": "瑞典十字",
        "de": "Schwedenkreuz",
        "en": "Swedish Cross",
        "more": "在这里的护栏右侧有一个石制十字纪念碑，用来纪念在 17 世纪被瑞典军队杀死的阿德瑙当地市长",
        "imgs": [
          {
            "src": "swedish-1.jpg",
            "author": "Porsche",
            "url": "https://press.cn.porsche.com/prod/presse_pag/PressResources.nsf/Content?ReadForm&languageversionid=1211252"
          },
          {
            "src": "swedish-2.jpg",
            "url": "https://zh.wikipedia.org/zh-cn/File:Schwedenkreuz.jpg",
            "author": "Walter Koch"
          },
        ],
      },
      {
        "st": .179,
        "ed": .188,
        "x": .092,
        "y": .530,
        "h": "l",
        "v": "m",
        "ch": "阿伦山",
        "de": "Aremberg",
        "en": "Arem Mountain",
        "more": "附近有座山就叫 Aremberg，但我查了一下地图，西北偏西的这座山离本弯直线距离也有十公里……",
        "imgs": [
          {
            "src": "aremberg-1.jpg",
            "url": "https://www.petrolart.de/51-schwedenkreuz.html",
            "author": "PetrolArt"
          },
        ],
      }, 
      // {
      //   "st": .188,
      //   "ed": .203,
      //   "x": .131,
      //   "y": .506,
      //   "h": "l",
      //   "v": "t",
      //   "ch": "横滨走廊",
      //   "nk": "横滨走廊",
      // }, 
      {
        "st":.205,
        "ed":.237,
        "x":.155,
        "y":.440,
        "h": "r",
        "v": "b",
        "ch": "狐狸洞",
        "en": "Foxhole",
        "de": "Fuchsröhre",
        "more": "这是纽北众多著名弯道里少数的英文名传颂更广的，传闻在赛道初建时,有只受惊的狐狸躲进了附近的下水道，一直到大家从它躲藏的洞里把它拉出来之后工程才得以继续，所以有了这个名字",
        "imgs": [
          {
            "src": "fox-1.jpg",
            "url": "https://zh.wikipedia.org/zh-cn/File:Nordschleife_Fuchsroehre_800x453.jpg",
            "author": "BUICK REGAL"
          },
        ],
      },
      {
        "st": .237,
        "ed": .256,
        "x": .175,
        "y": .362,
        "h": "r",
        "v": "m",
        "ch": "阿德瑙森林",
        "de": "Adenauer Forst",
        "en": "Adenau Forest",
        "more": "阿德瑙小镇其实横穿了整个赛道，所以跟阿德瑙相关的名字其实很多",
        "imgs": [
          {
            "src": "adenau-f-2.jpg",
            "url": "https://www.24h-rennen.de/en/2016/05/27/fire-on-the-adenauer-forst-camping-ground/",
            "author": "24h-rennen.de"
          },
          {
            "src": "adenau-f-1.jpg",
          },
        ],
      }, 
      {
        "st": .277,
        "ed": .285,
        "x": .257,
        "y": .277,
        "h": "l",
        "v": "t",
        "ch": "屠宰场 1",
        "de": "Metzgesfeld 1",
        "en": "Metzges Field 1",
        // "nk": "羊弯 1"
      }, 
      {
        "st": .291,
        "ed": .296,
        "x": .259,
        "y": .230,
        "h": "l",
        "v": "m",
        "ch": "屠宰场 2",
        "de": "Metzgesfeld 2",
        "en": "Metzges Field 2",
        "imgs": [
          {
            "src": "metzges-2.jpg",
            "url": "https://alavigne.net/Miscellaneous/CommonUtils/Presentation/show_image.jsp?id=49342-63839",
            "author": "alavigne.net"
          },
        ],
      }, 
      {
        "st": .305,
        "ed": .313,
        "x": .202,
        "y": .210,
        "h": "r",
        "v": "t",
        "ch": "卡伦哈特",
        "en": "Kallen Hard",
        "de": "Kallenhard"
      }, 
      {
        "st": .319,
        "ed": .328,
        "x": .232,
        "y": .170,
        "h": "r",
        "v": "b",
        "ch": "镜像双子",
        "nk": "镜像双子",
        "en": "Mirror Curve",
        "de": "Spiegelkurve",
        "more": "这是一个很有意思的名字，虽然根据单词的意思以及这个 Chicane 的布局，Mirror 被翻译成了「镜像」，但其实这是纽北众多民间名字之一，它被大家叫「Mirror Curve」的时候赛道布局和现如今很不一样，当时此处左侧的树丛离赛道非常贴近，以至于很多赛车都会在这次蹭坏左侧反光镜，所以得名",
        "imgs": [
          {
            "src": "spiegelkurve-1.jpg",
            "url": "https://www.flickr.com/photos/84415982@N07/52136132311",
            "author": "Nic2209"
          },
        ],
      }, 
      {
        "st": .329,
        "ed": .343,
        "x": .261,
        "y": .115,
        "h": "c",
        "v": "t",
        "ch": "Miss-Hit-Miss",
        "en": "Miss-Hit-Miss",
        "de": "Dreifach-Rechts",
        "more": "比起前面这些地点或者相关特征的取名方式，这里直接把过弯的方式写了出来，因为这个连续弯道有三个非常醒目的路肩，一般认为的通过方式是 1、3 走中线或者外线，第 2 个压路肩",
        "imgs": [
          {
            "src": "miss-1.jpg",
            "url": "https://www.youtube.com/watch?app=desktop&v=SLFQ-53Ca_I",
            "author": "Misha Charoudin"
          },
        ],
      }, 
      {
        "st": .347,
        "ed": .359,
        "x": .301,
        "y": .184,
        "h": "c",
        "v": "t",
        "ch": "防御谷",
        "en": "Defend Valley",
        "de": "Wehrseifen",
        "more": "这里以前正好穿过了 Adenau 和 Breidscheid 两个小镇的分界线，所在的峡谷也是一个重要的战略防御点。此处也基本上是纽北全程弯速最慢的地方了",
        "imgs": [
          {
            "src": "defend-1.jpg",
            "url": "https://www.motorsportimages.com/photo/1018429004-24-hours-of-nurburgring/1018429004/",
            "author": "Motorsport Images"
          },
          {
            "src": "defend-2.jpg",
            "url": "https://www.petrolart.de/98-Wehrseifen.html",
            "author": "PetrolArt"
          },
        ],
      }, 
      {
        "st": .372,
        "ed": .383,
        "x": .370,
        "y": .169,
        "h": "l",
        "v": "t",
        "ch": "Breidscheid",
        "nk": "小镇桥",
        "en": "Wide Part",
        "de": "Breidscheid",
        "more": "整个赛道海拔最低的地方差不多就在这里，大概 320 米左右，事实上，纽北海拔最高点到最低点的落差超过 300 米",
        "imgs": [
          {
            "src": "breidscheid-1.jpg",
            "url": "https://www.flickr.com/photos/dench26/6506224181",
            "author": "Neil Densham"
          },
          {
            "src": "breidscheid-2.jpg",
            "url": "https://www.nordschleife1927.de/news/nuerburgring/zufahrt-breidscheid-bleibt-einsatzkraeften-vorbehalten",
            "author": "Nordschleife 1927"
          },
        ],
      }, 
      {
        "st": .385,
        "ed": .392,
        "x": .374,
        "y": .109,
        "h": "r",
        "v": "t",
        "ch": "水磨坊",
        "en": "Water Mill",
        "de": "Ex Mühle",
        "more": "又是一个顾名思义的弯道，相传以前这里就有一个磨坊，而赛道本来也打算把起点设置在这里，但磨坊主人拒绝把他的这块地用来建造赛道主看台所以作罢",
        "imgs": [
          {
            "src": "mill-1.jpg",
            "url": "https://www.pro-steilstrecke.de/streckenabschnitte/nuerburgring_exmuehle.php",
            "author": "Burkhard Köhr"
          },
        ],
      }, 
      {
        "st": .408,
        "ed": .417,
        "x": .443,
        "y": .09,
        "h": "r",
        "v": "b",
        "ch": "劳达",
        "en": "Lauda Links",
        "de": " Lauda-Links",
        "more": "一个名场面诞生地，著名车手<a href='https://zh.wikipedia.org/wiki/%E5%B0%BC%E5%9F%BA%C2%B7%E5%8A%B3%E8%BE%BE' target='_blank'>尼基·劳达</a> (Niki Lauda) 参加 1976 年的 F1 大奖赛过程中在此处发生车祸并燃起大火，虽然烧伤了头部但 6 周后即复出并拿下隔年的年度冠军。后来这个弯道就以他的名字来命名了",
        "imgs": [
          {
            "src": "lauda-2.jpg",
            "url": "https://www.gq-magazine.co.uk/sport/article/niki-lauda-to-hell-and-back",
            "author": "DPA"
          },
          {
            "src": "lauda-4.jpg",
            "url": "https://www.youtube.com/watch?v=v59-1RXpqPs",
            "author": "Ginola's Videos"
          },
          {
            "src": "lauda-3.jpg",
            "url": "https://zh.wikipedia.org/wiki/File:Lauda_at_1982_Dutch_Grand_Prix.jpg",
            "author": "Anefo"
          },
        ],
      }, 
      {
        "st": .42,
        "ed": .432,
        "x": .491,
        "y": .078,
        "h": "l",
        "v": "t",
        "ch": "矿山",
        "en": "Mountain Factory",
        "de": "Bergwerk",
        "more": "其实从这些直白的地标名字里也能感受到纽北赛道的巨大规模，周围从机场到矿场，啥都有……",
        "imgs": [
          {
            "src": "bergwerk-1.jpg",
            "url": "https://oversteer48.com/nurburgring-nordschleife-bergwerk/",
            "author": "oversteer48"
          },
          {
            "src": "bergwerk-2.jpg",
            "url": "https://www.kuladig.de/Objektansicht/SWB-325156",
            "author": "Knöchel"
          },
        ],
      }, 
      {
        "st": .466,
        "ed": .480,
        "x": .538,
        "y": .219,
        "h": "c",
        "v": "t",
        "ch": "Kesselchen",
        "en": "Little Valley",
        "de": "Kesselchen",
        "more": "出了矿山弯之后是一段长长的上坡路，所以这里很多弯道的名字都跟「谷」有关",
        "imgs": [
          {
            "src": "kesselchen-1.jpg",
            "url": "https://www.youtube.com/watch?v=d1v4CZ4q7K4",
            "author": "PROBEICH"
          },
        ],
      }, 
      {
        "st": .513,
        "ed": .526,
        "x": .665,
        "y": .262,
        "h": "c",
        "v": "t",
        "ch": "勇气弯",
        "en": "Courage Curve",
        "de": "Mutkurve",
        "more": "这个著名弯角的恐怖之处在于很高的速度和极小的容错空间，只有当你拥有足够的勇气才能全速通过"
      }, 
      {
        "st": .531,
        "ed": .544,
        "x": .706,
        "y": .208,
        "h": "r",
        "v": "b",
        "ch": "修道谷",
        "en": "Monastery Valley",
        "de": "Klostertal",
        "imgs": [
          {
            "src": "klostertal-1.jpg",
            "author": "sfcriga.com",
            "url": "https://sfcriga.com/nurburgring-the-most-challenging-race-track-in-the-world"
          },
        ],
      }, 
      {
        "st": .552,
        "ed": .560,
        "x": .789,
        "y": .195,
        "h": "r",
        "v": "b",
        "ch": "陡坡",
        "en": "Steep Section",
        "de": "Steilstrecke",
        "more": "这个弯道是一个半径很大的回头弯，一点儿都不陡，「陡坡」这个直译名字会觉得很奇怪，其实是因为以前这里有个测试用的陡坡可以作为岔路跳过旋转木马直接去到高八那段，后来因为太陡很多车溜坡产生安全问题就封闭了",
        "imgs": [
          {
            "src": "steilstrecke-1.jpg",
            "url": "https://de.wikipedia.org/wiki/Datei:Steilstreckenkurve_auf_der_N%C3%BCrburgring_Nordschleife.jpg",
            "author": "Eigenes Werk"
          },
          {
            "src": "steilstrecke-2.jpg",
            "url": "https://www.pro-steilstrecke.de/steilstrecke/nuerburgring_steilstrecke.php",
            "author": "Pro Steilstrecke"
          },
        ],
      }, 
      {
        "st": .571,
        "ed": .586,
        "x": .730,
        "y": .277,
        "h": "c",
        "v": "t",
        "ch": "旋转木马",
        "en": "Carousel",
        "de": "Caracciola-Karussell",
        "more": "这也许是纽北最著名的弯道了，而它的德文原名里的 Caracciola 是为了纪念著名车手 <a href='https://en.wikipedia.org/wiki/Rudolf_Caracciola'>Rudolf Caracciola</a>，他在上世纪 30 年代的比赛中，在这里发明了「水渠过弯法」",
        "imgs": [
          {
            "src": "carousel-2.jpg",
            "url": "https://autos.yahoo.com/mastering-n-rbugring-apos-most-193000555.html",
            "author": "Porsche"
          },
          {
            "src": "carousel-3.jpg",
            "url": "https://www.bridgetogantry.com/the-truth-behind-the-nurburgrings-karussell/",
            "author": "BridgeToGantry"
          },
        ],
      }, 
      {
        "st": .624,
        "ed": .633,
        "x": .811,
        "y": .157,
        "h": "r",
        "v": "b",
        "ch": "高八",
        "nk": "瞭望塔",
        "en": "High Attention",
        "de": "Hohe Acht",
        "more": "「高八」是这里附近的一座山，本身高 700 多米但其实离这个弯道有点儿距离，这里也并不是赛道最高的地方，「高八」这名字是个直译，但其实并不准确，虽然 Acht 在德语里是「8」的意思，但其实更准确的翻译是 Attention",
        "imgs": [
          {
            "src": "hohe-acht-1.jpg",
            "url": "https://www.petrolart.de/04-hohe8.html",
            "author": "PetrolArt"
          },
          {
            "src": "hohe-acht-2.jpg",
            "url": "https://www.eifel.info/a-hohe-acht-mit-dem-kaiser-wilhelm-turm",
            "author": "eifel.info"
          },
        ],
      }, 
      {
        "st": .636,
        "ed": .65,
        "x": .851,
        "y": .154,
        "h": "l",
        "v": "b",
        "ch": "海德薇高地",
        "en": "Hedgwig Height",
        "de": "Hedgwigshöhe",
        "more": "纽博格林赛道能建成多亏了当时 Eifel 地区的议员 Otto Creuz 博士，而他也用自己妻子的名字 Hedgwig 命名了这个弯道"
      }, 
      {
        "st": .65,
        "ed": .66,
        "x": .898,
        "y": .188,
        "h": "l",
        "v": "b",
        "ch": "弹跳人",
        "en": "Seesaw Man",
        "de": "Wippermann",
        "more": "这一段曾经非常颠簸，而且水平方向上也有剧烈的运动",
        "imgs": [
          {
            "src": "wippermann-1.jpg",
            "url": "https://press.au.porsche.com/prod/presse_pag/PressResources.nsf/WebResources?OpenView&catF=Wippermann",
            "author": "Porsche"
          },
        ],
      }, 
      {
        "st": .662,
        "ed": .681,
        "x": .890,
        "y": .242,
        "h": "r",
        "v": "m",
        "ch": "Eschbach",
        "de": "Eschbach",
        "en": "Ash Brook",
        "imgs": [
          {
            "src": "eschbach-1.jpg",
            "url": "https://www.locationscout.net/germany/22886-eschbach-nuerburgring-nordschleife",
            "author": "Marco"
          },
        ],        
      }, 
      {
        "st": .692,
        "ed": .701,
        "x": .9,
        "y": .327,
        "h": "l",
        "v": "t",
        "ch": "网红弯",
        "de": "",
        "en": "YouTube Corner",
        "more": "这一段两个连续的右弯一般被叫做小水井（Brünnchen），但更被世人熟知的是其中第二个弯道，因为这里经常聚集着很多观众拍照录像，而各类车辆在这里出丑的视频在 YouTube 上已经成了一种赛博咸菜",
        "imgs": [
          {
            "src": "youtube-1.jpg",
            "url": "https://en.m.wikipedia.org/wiki/File:Nordschleife_Br%C3%BCnnchen_201204061.JPG",
            "author": "BedaNo1"
          },
          {
            "src": "youtube-2.jpg",
            "url": "https://www.flickr.com/photos/23405782@N02/3160341491",
            "author": "japanpower22"
          },
        ],
      }, 
      {
        "st": .705,
        "ed": .715,
        "x": .867,
        "y": .323,
        "h": "r",
        "v": "m",
        "ch": "冰弯",
        "en": "Ice Curve",
        "de": "Eiskurve",
        "more": "这个弯附近的高大树木很多，所以有一种说法是当雨天过后这里经常是整个赛道最后变干的，大家就说这里「和冰面一样滑」，而另一种说法是这些树木遮蔽了阳光，当冬天结冰的时候这里是最后解冻的",
        "imgs": [
          {
            "src": "eiskurve-1.jpg",
            "url": "https://press.au.porsche.com/prod/presse_pag/PressResources.nsf/Content?ReadForm&languageversionid=1211264",
            "author": "Porsche"
          },
        ],
      }, 
      {
        "st": .721,
        "ed": .745,
        "x": .870,
        "y": .415,
        "h": "l",
        "v": "m",
        "ch": "植物园 1",
        "de": "Pflanzgarten 1",
        "en": "Plant Garden 1",
        "imgs": [
          {
            "src": "pflanzgarten-1-2.jpg",
            "url": "https://press.au.porsche.com/prod/presse_pag/PressResources.nsf/Content?ReadForm&languageversionid=1211266",
            "author": "Porsche"
          },
          {
            "src": "pflanzgarten-1-1.jpg",
            "url": "https://en.m.wikipedia.org/wiki/File:Nordschleife_Pflanzgarten.JPG",
            "author": "BedaNo1"
          },
        ],
      }, 
      {
        "st": .746,
        "ed": .762,
        "x": .820,
        "y": .444,
        "h": "r",
        "v": "b",
        "ch": "植物园 2",
        "de": "Pflanzgarten 2",
        "en": "Plant Garden 2",
        "imgs": [
          {
            "src": "pflanzgarten-2-1.jpg",
            "url": "https://en.m.wikipedia.org/wiki/File:Nordschleife_Pflanzgarten_II.JPG",
            "author": "BedaNo1"
          },
        ],
      }, 
      {
        "st": .763,
        "ed": .783,
        "x": .794,
        "y": .509,
        "h": "l",
        "v": "t",
        "ch": "Stefan-Bellof-S",
        "en": "Stefan Bellof S",
        "de": "Stefan-Bellof-S",
        "more": "传奇车手 <a href='https://en.wikipedia.org/wiki/Stefan_Bellof' target='_blank'>Stefan Bellof</a> 在 1983 年驾驶 C 组保时捷 956 在纽北创造了 6:11.13 的圈速记录（保持了整整 35 年才被保时捷 919 打破），后来他在这里发生了车祸，所以这个赛段以他命名",
        "imgs": [
          {
            "src": "bellof-1.jpg",
            "url": "https://www.alamy.com/stock-photo/stefan-bellof-s.html?sortBy=relevant",
            "author": "alamy"
          },
          {
            "src": "bellof-2.jpg",
            "url": "https://www.motorsportimages.com/photos/?driver_id=6830&race_type_id=139&location_id=223",
            "author": "LAT Photographic"
          },
          {
            "src": "bellof-3.jpg",
            "url": "https://www.elferspot.com/en/magazin/stefan-bellof-the-biggest-talent-that-i-have-ever-seen/",
            "author": "Porsche"
          },
        ],
      },
      {
        "st": .793,
        "ed": .810,
        "x": .715,
        "y": .503,
        "h": "c",
        "v": "b",
        "ch": "燕尾",
        "en": "Swallow’s Tail",
        "de": "Schwalbenschwanz",
        "imgs": [
          {
            "src": "schwalbenschwanz-1.jpg",
            "url": "https://www.petrolart.de/74-schwalbenschwanz.html",
            "author": "PetrolArt"
          },
          {
            "src": "schwalbenschwanz-2.jpg",
            "url": "https://www.24h-rennen.de/camping-schwalbenschwanz/",
            "author": "24h-rennen.de"
          },
        ],
      },
      {
        "st": .815,
        "ed": .824,
        "x": .667,
        "y": .539,
        "h": "r",
        "v": "m",
        "ch": "小旋转木马",
        "en": "Mini Carousel",
        "de": "Kleine Karussell",
        "more": "虽然看名字就知道是一个小号的旋转木马弯，但因为转弯角度更小，斜坡形式不一样，进弯速度也不一样，所以其实是两种完全不同的开法",
        "imgs": [
          {
            "src": "kleines-1.jpg",
            "url": "https://www.flickr.com/photos/wilson_wong/33695169874/",
            "author": "Wilson Wong"
          },
        ],
      },
      {
        "st": .834,
        "ed": .850,
        "x": .735,
        "y": .590,
        "h": "l",
        "v": "m",
        "ch": "断头台",
        "en": "Gallows Head",
        "de": "Galgenkopf",
        "more": "中世纪时，这里是执行公开处决的绞刑架旧址",
        "imgs": [
          {
            "src": "galgenkopf-1.jpg",
            "url": "https://www.petrolart.de/92-Galgenkopf.html",
            "author": "PetrolArt"
          },
        ],
      },
      {
        "st": .853,
        "ed": .945,
        "x": .601,
        "y": .719,
        "h": "l",
        "v": "t",
        "ch": "多廷根高地",
        "en": "Dottingen Height",
        "de": "Döttinger Höhe",
        "more": "名字来自附近的多廷根小镇，严格来说不是弯道，是一段整整两公里长的直线。当然，大部分普通业余驾驶员能开的赛道布局「BTG」里并不包含这段，BTG 全称「Bridge to Gantry」，Bridge 指的是 Döttinger Höhe 尽头的桥，Gantry 就是出了断头台的一个桁架",
        "imgs": [
          {
            "src": "dottinger-1.jpg",
            "url": "https://www.24h-rennen.de/2019/06/22/news-und-stimmen-nach-7h/",
            "author": "24h-rennen.de"
          },
          {
            "src": "dottinger-2.jpg",
            "url": "https://www.petrolart.de/70-doettingerhoehe.html",
            "author": "PetrolArt"
          },
        ],
      }, 
      {
        "st": .947,
        "ed": .959,
        "x": .458,
        "y": .804,
        "h": "r",
        "v": "b",
        "ch": "安东尼榉木",
        "en": "Anthony’s Beech",
        "de": "Antoniusbuche",
        "more": "这里曾经有一颗高大的榉树，很有可能是属于 Anthony 这个人了，当然，为了建造赛道，这棵树被砍了",
        "imgs": [
          {
            "src": "antoniusbuche-1.jpg",
            "url": "https://www.raceroom.com/en/nordschleife-released/",
            "author": "RaceRoom"
          },
        ],
      }, 
      {
        "st": .966,
        "ed": .979,
        "x": .445,
        "y": .863,
        "h": "l",
        "v": "t",
        "ch": "动物园",
        "en": "Animal Garden",
        "de": "Tiergarten",
        "more": "对于跑 BTG 布局的大部分人来说，这里是赛道开始的第一个开始有挑战性的弯道，其实并不难，但如果是走整个北环布局经历了大直道加速之后来到这里的话就非常考验走线了",
        "imgs": [
          {
            "src": "tiergarten-1.jpg",
            "url": "https://nring.info/nurburgring-nordschleife-corners/tiergarten/",
            "author": "nring.info"
          },
        ],
      }, 
      {
        "st": .981,
        "ed": .994,
        "x": .419,
        "y": .91,
        "h": "l",
        "v": "t",
        "ch": "高雨组合弯",
        "en": "High Altitude Chicane",
        "de": "Hohenrain Schikane",
      }, 
      {
        "st": .994,
        "ed": .999,
        "x": .379,
        "y": .926,
        "h": "l",
        "v": "t",
        "ch": "T13",
        "en": "T13",
        "de": "T13",
        "more": "这里作为整个赛道的起点，有个 Pit 区和大看台，看台的名字就叫 T13，同时这里也差不多是整个赛道海拔最高的地方",
        "imgs": [
          {
            "src": "t13-1.jpg",
            "url": "https://pitlaneitalia.com/2023/07/31/nurburgring-rifornimento-e-zona-riposo-lungo-il-circuito-per-i-guidatori-turisti/",
            "author": "Pitlaneitalia"
          },
          {
            "src": "t13-2.jpg",
            "url": "https://www.petrolart.de/24-t13.html",
            "author": "PetrolArt"
          },
        ],
      }, 
    ],
    aboutContent: "网页设计 & 开发：<a href='https://jjying.com/' target='_blank'>JJ Ying</a><br/><br/><strong>参考信息:</strong><br/>· <a target='_blank' href='https://oversteer48.com/nurburgring-corner-names/'>Corner Names, Numbers and circuit map</a><br/>· <a target='_blank' href='https://nring.info/nurburgring-nordschleife-corners/'>NRing.info</a><br/>· <a target='_blank' href='https://www.youtube.com/watch?v=-lCR1_cDqTg'>Nürburgring Corner Names Explained</a><br/>· 键盘车神教教主视频：<a target='_blank' href='https://www.bilibili.com/video/BV1NntCe4ETM/'>纽北每一个弯的名字？</a><br/><br/><strong>页面源码:</strong><br/>· <a target='_blank' href='https://github.com/JJYing/Nurburgring-Map'>@GitHub</a>",
    modalContent: "",
    modalType: "text"
  },
  methods: {
    innerModal: function(e){
      e.stopPropagation()
    },
    toggleLang(){
      if(this.lang == "en"){
        this.lang = "cn"
      }
      else{
        this.lang = "en"
      }
    },
    toggleDarkMode(){
      this.darkMode =!this.darkMode
      if(this.darkMode == true){
        root.classList.add("dark")
      }
      else{
        root.classList.remove("dark")
      }
    },
    setP: function(percentage){
      this.p = percentage
      window.scrollTo(0, (body.scrollHeight - window.innerHeight) * percentage);
      updateScrollDistance()
    },
    openModal: function(type, img=null){
      this.modalType = type
      if(type == 'text') this.modalContent = this.aboutContent
      if(type == 'image'){
        this.modalContent = "<img src='" + 'https://s.anyway.red/nurburgring/' + img.src + '!/quality/80/progressive/true/ignore-error/true' + "'/>"
        if(img.url) this.modalContent += "<div class='source-in-modal'>@<a href='" + img.url + "' target='_blank'>" + img.author + "</a></div>"
      }
      this.showModal = true
    }

  }
})


document.addEventListener('scroll', function(e){
  if(window.scrollY > 2){
    document.body.classList.add("scrolled")
  }
  else{
    document.body.classList.remove("scrolled")
  }
});


function updateScrollDistance(){
  d.showCorner = false
  d.showSection = false
  d.showCornerDesc = false
  d.currentCorner = null
  let progress = window.scrollY / ( body.scrollHeight - window.innerHeight)
  if(progress > 1){
    progress = 1
  }
  body.style.setProperty('--p', progress)
  d.p = progress
  d.corners.forEach((corner, i)=>{
    if(progress > corner.st && progress < corner.ed){
      d.showCorner = true
      d.cornerStart = corner.st
      d.cornerEnd = corner.ed
      d.currentCorner = corner      
    }
  })
  d.sections.forEach((section, i)=>{
    if(progress > section.st && progress < section.ed){
      d.showSection = true
      d.sectionStart = section.st
      d.sectionEnd = section.ed
    }
  })
}

function updatePageHeight(){
  if(window.innerHeight < window.innerWidth){
    body.classList.remove("vertical")
    body.classList.add("horizontal")
  }
  else{
    body.classList.remove("horizontal")
    body.classList.add("vertical")
  }
}

window.addEventListener('scroll', updateScrollDistance)
window.addEventListener('resize', function(){
  updateScrollDistance()
  updatePageHeight()
})

updateScrollDistance()
updatePageHeight()

window.addEventListener("keyup",function(e){
  if(e.key === "Escape") {
    d.showModal = false
  }
})

document.querySelector('.track-map > .inner').addEventListener('mousemove', function(event) {
  const innerRect = this.getBoundingClientRect();
  d.mX = (event.clientX - innerRect.left) / innerRect.width
  d.mY = (event.clientY - innerRect.top) / innerRect.height
});