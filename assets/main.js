let rootURL = document.baseURI
const body = document.querySelector('body');

var d = new Vue({
  el: '#app',
  data: {
    p: 0,
    w: 660,
    h: 530,
    mX: 0,
    mY: 0,
    showModal: false,
    showAllCornerNames: false,
    darkMode: false,
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
        "y": .495,
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
        "x": .682,
        "y": .664,
        "h": "l",
        "v": "t",
        "ch": "The Gantry",
      },
    ],
    sections: [
      {
        "st":.019,
        "ed":.064,
        "x":.297,
        "y":.892,
        "h": "c",
        "v": "b",
        "ch": "Hatzenbach",
        "en": "Hunt Stream",
        "de": "Hatzenbach",
      },
      {
        "st":.188,
        "ed":.237,
        "x":.155,
        "y":.440,
        "h": "r",
        "v": "b",
        "ch": "狐狸洞",
        "en": "Foxhole",
        "de": "Fuchsröhre",
      }
    ],
    corners: [
      {
        "st": .006,
        "ed": .014,
        "x": .357,
        "y": .88,
        "h": "c",
        "v": "b",
        "ch": "萨宾娜",
        "en": "Sabine Schmitz Curve",
        "de": "Sabine Schmitz Kurve",
        "more": "为了纪念在此开了至少 33,000 圈的纽北女王 Sabine Schmitz，她曾两次赢得纽博格林 24 小时耐力赛，也是第一位赢得这项传奇赛事的女性。",
        "imgs": [
          {
            "src": "sabine-2.jpg",
          },
          {
            "src": "sabine-1.jpg",
          },
        ],
      },
      {
        "st": .019,
        "ed": .032,
        "x": .32,
        "y": .935,
        "h": "c",
        "v": "t",
        "ch": "Hatzenbach Bogen",
        "en": "Hunt Stream Curve",
        "de": "Hatzenbach Bogen",
        "nk": "弧形弯",
        "imgs": [
          {
            "src": "hatzenbach-bogen-1.jpg",
          },
        ],
      },
      {
        "st": .038,
        "ed": .049,
        "x": .256,
        "y": .921,
        "h": "r",
        "v": "t",
        "ch": "扭扭弯",
        "nk": "扭扭弯"
      },
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
        "nk": "龙哥不杀弯",
        "imgs": [
          {
            "src": "hoheichen-1.jpg",
          },
        ],
      },
      {
        "st": .077,
        "ed": .089,
        "x": .192,
        "y": .810,
        "h": "l",
        "v": "t",
        "ch": "小桥直线",
        "nk": "小桥直线"
      },
      {
        "st": .1,
        "ed": .117,
        "x": .128,
        "y": .763,
        "h": "r",
        "v": "m",
        "ch": "飞机场",
        "de": "Flugplatz",
        "en": "Airfield",
        "more": "虽然很多赛车在这个高速弯起飞，但事实上这里叫「飞机场」的原因是在这个弯道边上以前是个飞机场",
      },
      {
        "st": .129,
        "ed": .139,
        "x": .159,
        "y": .670,
        "h": "l",
        "v": "m",
        "ch": "Kottenborn",
        "de": "Kottenborn",
      },
      {
        "st": .145,
        "ed": .162,
        "x": .118,
        "y": .613,
        "h": "r",
        "v": "m",
        "ch": "草原直线",
      },
      {
        "st": .163,
        "ed": .172,
        "x": .125,
        "y": .554,
        "h": "l",
        "v": "m",
        "ch": "瑞典十字",
        "de": "Schwedenkreuz",
        "en": "Swedish Cross"
      },
      {
        "st": .179,
        "ed": .188,
        "x": .067,
        "y": .530,
        "h": "r",
        "v": "m",
        "ch": "阿伦山",
        "de": "Aremberg",
        "en": "Arem mountain",
      }, 
      {
        "st": .188,
        "ed": .203,
        "x": .131,
        "y": .506,
        "h": "l",
        "v": "t",
        "ch": "横滨走廊",
        "nk": "横滨走廊",
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
        "en": "Metzges field 1",
        "nk": "羊弯 1"
      }, 
      {
        "st": .292,
        "ed": .296,
        "x": .252,
        "y": .224,
        "h": "l",
        "v": "b",
        "ch": "屠宰场 2",
        "de": "Metzgesfeld 2",
        "en": "Metzges field 2",
        "nk": "羊弯 2"
      }, 
      {
        "st": .296,
        "ed": .301,
        "x": .230,
        "y": .236,
        "h": "r",
        "v": "t",
        "ch": "羊弯 3",
        "nk": "羊弯 3"
      }, 
      {
        "st": .305,
        "ed": .313,
        "x": .200,
        "y": .206,
        "h": "r",
        "v": "m",
        "ch": "Kallenhard",
        "en": "Kallen hard",
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
        "en": "Mirror Curve",
        "de": "Spiegelkurve"
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
        "de": "Miss-Hit-Miss"
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
        "nk": "卫赛芬",
        "more": "这里以前正好穿过了 Adenau 和 Breidscheid 两个小镇的分界线，所在的峡谷也是一个重要的战略防御点"
      }, 
      {
        "st": .372,
        "ed": .383,
        "x": .370,
        "y": .169,
        "h": "l",
        "v": "t",
        "ch": "小镇桥",
        "en": "Wide Part",
        "de": "Breidscheid",
      }, 
      {
        "st": .385,
        "ed": .392,
        "x": .374,
        "y": .109,
        "h": "r",
        "v": "t",
        "ch": "老磨坊",
        "en": "Water mill",
        "de": "Ex Mühle",
      }, 
      {
        "st": .408,
        "ed": .417,
        "x": .471,
        "y": .120,
        "h": "r",
        "v": "t",
        "ch": "Lauda Links",
        "en": "Lauda Links",
        "de": " Lauda Links",
        "more": "又是一个名场面诞生地了，著名车手 <a href='https://en.wikipedia.org/wiki/Niki_Lauda' target='_blank'>Niki Lauda</a> 参加 1976 年的 F1 大奖赛过程中在此处发生车祸并燃起大火，虽然烧伤了头部但 6 周后即复出并拿下隔年的年度冠军",
        "imgs": [
          {
            "src": "lauda-1.jpg",
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
        "more": "又是顾名思义的一个命名，其实从这些名字里也能感受到纽北赛道的巨大规模，周围从机场到矿场，啥都有……"
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
      }, 
      {
        "st": .496,
        "ed": .506,
        "x": .604,
        "y": .2,
        "h": "l",
        "v": "b",
        "ch": "Klostertal",
        "en": "Monastery Valley",
        "de": "Klostertal",
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
        "more": "这个著名的弯角的恐怖之处在乎很高的速度和极小的容错空间，只有当你拥有足够的勇气才能全速通过"
      }, 
      {
        "st": .552,
        "ed": .560,
        "x": .779,
        "y": .195,
        "h": "r",
        "v": "b",
        "ch": "Steilstrecke",
        "en": "Steep Section",
        "de": "Steilstrecke",
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
        "de": "Caracciola Karussell",
        "imgs": [
          {
            "src": "carousel-2.jpg",
          },
          {
            "src": "carousel-1.jpg",
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
        "ch": "Hohe Acht",
        "en": "High Attention",
        "de": "Hohe Acht",
        "more": "这个弯附近的高大树木很多，所以当雨天过后这里经常是整个赛道最后变干的，大家就说这里「和冰面一样滑」，因而得名"
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
      }, 
      {
        "st": .692,
        "ed": .701,
        "x": .917,
        "y": .324,
        "h": "l",
        "v": "t",
        "ch": "烤肉弯",
        "nk": "烤肉弯",
        "en": "YouTube Corner",
      }, 
      {
        "st": .705,
        "ed": .715,
        "x": .878,
        "y": .315,
        "h": "r",
        "v": "b",
        "ch": "冰弯",
        "en": "Ice Curve",
        "de": "Eiskurve",
        "more": "这个弯附近的高大树木很多，所以当雨天过后这里经常是整个赛道最后变干的，大家就说这里「和冰面一样滑」，因而得名"
      }, 
      {
        "st": .729,
        "ed": .745,
        "x": .870,
        "y": .415,
        "h": "l",
        "v": "m",
        "ch": "植物园 1",
        "en": "Pflanzgarten 1",
        "de": "Plant garden 1",
      }, 
      {
        "st": .746,
        "ed": .762,
        "x": .820,
        "y": .444,
        "h": "r",
        "v": "b",
        "ch": "植物园 2",
        "en": "Pflanzgarten 2",
        "de": "Plant garden 2",
      }, 
      {
        "st": .765,
        "ed": .780,
        "x": .794,
        "y": .509,
        "h": "l",
        "v": "t",
        "ch": "Stefan Bellof S",
        "en": "Stefan Bellof S",
        "de": "Stefan Bellof S",
        "more": "传奇车手 Stefan Bellof 在 1976 年驾驶 C 组保时捷 956 在纽北创造了 6:11.13 的圈速记录，而后来他在这里发生了车祸，所以这个赛段以他命名"
      },
      {
        "st": .793,
        "ed": .810,
        "x": .710,
        "y": .505,
        "h": "c",
        "v": "b",
        "ch": "Schwalbenschwanz",
        "en": "Swallow’s Tail",
        "de": "Schwalbenschwanz",
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
        "more": "曾经是公开处决的绞刑架旧址"
      },
      {
        "st": .853,
        "ed": .945,
        "x": .601,
        "y": .719,
        "h": "l",
        "v": "t",
        "ch": "Döttinger Höhe",
        "en": "Dottingen Height",
        "de": "Döttinger Höhe",
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
        "more": "这里曾经有一颗高大的榉树，很有可能是属于 Anthony 这个人了，当然，为了建造赛道，这棵树被砍了"
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
      }, 
      {
        "st": .981,
        "ed": .994,
        "x": .419,
        "y": .899,
        "h": "l",
        "v": "t",
        "ch": "高雨组合弯",
        "en": "High Altitude Chicane",
        "de": "Hohenrain Schikane",
      }, 
      {
        "st": .994,
        "ed": 1,
        "x": .379,
        "y": .926,
        "h": "l",
        "v": "t",
        "ch": "T13",
        "en": "T13",
        "de": "T13",
      }, 
    ]
  },
  methods: {
    innerModal: function(e){
      e.stopPropagation()
    },
    toggleDarkMode(){
      var root = document.querySelector(':root')
      this.darkMode =!this.darkMode
      if(root.classList == ""){
        root.classList = "dark"
      }
      else{
        root.classList = ""
      }
    },
    setP: function(percentage){
      this.p = percentage
      window.scrollTo(0, (body.scrollHeight - window.innerHeight) * percentage);
      updateScrollDistance()
    },
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

document.querySelector('.track-map > .inner').addEventListener('mousemove', function(event) {
  const innerRect = this.getBoundingClientRect();
  d.mX = (event.clientX - innerRect.left) / innerRect.width
  d.mY = (event.clientY - innerRect.top) / innerRect.height
});
