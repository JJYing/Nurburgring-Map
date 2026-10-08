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
    languages: [
      { code: "cn", short: "CN", label: "中文" },
      { code: "en", short: "EN", label: "English" },
      { code: "de", short: "DE", label: "Deutsch" },
    ],
    ui: {
      cn: {
        mainTitle: "纽北赛道地图",
        logoTitle: "纽博格林北环赛道地图",
        intro: "<a href='https://zh.wikipedia.org/zh-hans/%E7%BA%BD%E5%8D%9A%E6%A0%BC%E6%9E%97%E8%B5%9B%E9%81%93' target='_blank'>纽博格林赛道</a>（德语：Nürburgring）修筑于 1920 年代，由于跑道非常长、地形复杂充满挑战性，被认为是世界上最严苛的竞速赛道，其中的北环俗称为“纽北”，又叫“绿色地狱”。这里很多弯道都有独特的名字和故事，通过本地图可以方便爱好者学习。",
        startHint: "向下滚动或点击弯道名查看地图",
        about: "关于本站",
        allCorners: "所有弯道",
        darkMode: "深色模式",
        language: "语言",
        photoSource: "查看照片来源",
        endLabel: "终点",
        elevation: "海拔",
        startOver: "回到起点",
      },
      en: {
        mainTitle: "Nürburgring Map",
        logoTitle: "Nürburgring Map",
        intro: "<a href='https://en.wikipedia.org/wiki/N%C3%BCrburgring' target='_blank'>Nürburgring</a> is a German race track built in the 1920s. Its North Loop, the Nordschleife, is famous for its length, complex terrain, and relentless challenge. This interactive map helps fans learn the names and stories behind its many corners.",
        startHint: "Scroll or click a corner name to start",
        about: "About",
        allCorners: "All Corners",
        darkMode: "Dark Mode",
        language: "Language",
        photoSource: "View photo source",
        endLabel: "The End",
        elevation: "Elevation",
        startOver: "Start Over",
      },
      de: {
        mainTitle: "Nordschleife-Karte",
        logoTitle: "Nordschleife-Karte",
        intro: "Der <a href='https://de.wikipedia.org/wiki/N%C3%BCrburgring' target='_blank'>Nürburgring</a> wurde in den 1920er Jahren gebaut. Seine Nordschleife ist wegen ihrer Länge, der komplexen Topografie und ihres hohen Anspruchs weltweit berühmt. Diese interaktive Karte hilft dabei, die Namen und Geschichten der vielen Kurven zu lernen.",
        startHint: "Scrollen oder einen Kurvennamen anklicken",
        about: "Über",
        allCorners: "Alle Kurven",
        darkMode: "Dunkler Modus",
        language: "Sprache",
        photoSource: "Bildquelle anzeigen",
        endLabel: "Ziel",
        elevation: "Höhe",
        startOver: "Zurück zum Start",
      },
    },
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
    bridges: window.TRACK_CONTENT.bridges,
    sections: window.TRACK_CONTENT.sections,
    corners: window.TRACK_CONTENT.corners,
    aboutContent: "网页设计 & 开发：<a href='https://jjying.com/' target='_blank'>JJ Ying</a><br/><br/><strong>参考信息:</strong><br/>· <a target='_blank' href='https://oversteer48.com/nurburgring-corner-names/'>Corner Names, Numbers and circuit map</a><br/>· <a target='_blank' href='https://nring.info/nurburgring-nordschleife-corners/'>NRing.info</a><br/>· <a target='_blank' href='https://www.youtube.com/watch?v=-lCR1_cDqTg'>Nürburgring Corner Names Explained</a><br/>· 键盘车神教教主视频：<a target='_blank' href='https://www.bilibili.com/video/BV1NntCe4ETM/'>纽北每一个弯的名字？</a><br/><br/><strong>海拔数据:</strong><br/>来源：<a target='_blank' href='https://veloviewer.com/segment/5539685'>VeloViewer · Nürburgring Nordschleife</a>。海拔为近似值，已按地图行进比例进行插值和校准，仅供参考，不代表精确测量。<br/><br/><strong>页面源码:</strong><br/>· <a target='_blank' href='https://github.com/JJYing/Nurburgring-Map'>@GitHub</a>",
    aboutContentEn: "Web design & development: <a href='https://jjying.com/' target='_blank'>JJ Ying</a><br/><br/><strong>References:</strong><br/>· <a target='_blank' href='https://oversteer48.com/nurburgring-corner-names/'>Corner Names, Numbers and circuit map</a><br/>· <a target='_blank' href='https://nring.info/nurburgring-nordschleife-corners/'>NRing.info</a><br/>· <a target='_blank' href='https://www.youtube.com/watch?v=-lCR1_cDqTg'>Nürburgring Corner Names Explained</a><br/>· Video by 键盘车神教教主: <a target='_blank' href='https://www.bilibili.com/video/BV1NntCe4ETM/'>What is the name of every Nürburgring corner?</a><br/><br/><strong>Elevation data:</strong><br/>Source: <a target='_blank' href='https://veloviewer.com/segment/5539685'>VeloViewer · Nürburgring Nordschleife</a>. Elevations are approximate, interpolated and aligned to progress along this map. They are for reference and do not represent precise measurements.<br/><br/><strong>Source code:</strong><br/>· <a target='_blank' href='https://github.com/JJYing/Nurburgring-Map'>@GitHub</a>",
    aboutContentDe: "Webdesign & Entwicklung: <a href='https://jjying.com/' target='_blank'>JJ Ying</a><br/><br/><strong>Quellen:</strong><br/>· <a target='_blank' href='https://oversteer48.com/nurburgring-corner-names/'>Corner Names, Numbers and circuit map</a><br/>· <a target='_blank' href='https://nring.info/nurburgring-nordschleife-corners/'>NRing.info</a><br/>· <a target='_blank' href='https://www.youtube.com/watch?v=-lCR1_cDqTg'>Nürburgring Corner Names Explained</a><br/>· Video von 键盘车神教教主: <a target='_blank' href='https://www.bilibili.com/video/BV1NntCe4ETM/'>Wie heißen alle Kurven der Nordschleife?</a><br/><br/><strong>Höhendaten:</strong><br/>Quelle: <a target='_blank' href='https://veloviewer.com/segment/5539685'>VeloViewer · Nürburgring Nordschleife</a>. Die Höhenangaben sind Näherungswerte, die interpoliert und an den Verlauf dieser Karte angepasst wurden. Sie dienen der Orientierung und stellen keine präzisen Messwerte dar.<br/><br/><strong>Quellcode:</strong><br/>· <a target='_blank' href='https://github.com/JJYing/Nurburgring-Map'>@GitHub</a>",
    modalContent: "",
    modalType: "text"
  },
  computed: {
    elevationLevel(){
      // A fixed 300-650 m scale keeps the indicator comparable along the lap.
      return Math.max(0, Math.min(1, (this.elevationM - 300) / 350))
    },
    elevationM(){
      const samples = window.TRACK_ELEVATION_PROFILE.samples
      const progress = Math.max(0, Math.min(1, this.p))
      let low = 0
      let high = samples.length - 1
      while(high - low > 1){
        const middle = Math.floor((low + high) / 2)
        if(samples[middle][0] <= progress) low = middle
        else high = middle
      }
      const start = samples[low]
      const end = samples[high]
      return start[1] + (end[1] - start[1]) * (progress - start[0]) / (end[0] - start[0])
    }
  },
  methods: {
    innerModal: function(e){
      e.stopPropagation()
    },
    uiText(key){
      return this.ui[this.lang][key] || this.ui.en[key] || ""
    },
    getLocalizedValue(item, lang){
      if(!item) return ""
      const field = lang == "cn" ? "ch" : lang
      return item[field] || item.en || item.de || item.ch || ""
    },
    getName(item, lang){
      return this.getLocalizedValue(item, lang)
    },
    otherNames(item){
      return this.languages
        .filter(language => language.code != this.lang)
        .map(language => {
          return {
            lang: language.code,
            label: language.label,
            value: this.getLocalizedValue(item, language.code)
          }
        })
        .filter(name => name.value)
    },
    getMore(item){
      if(!item) return ""
      if(this.lang == "cn") return item.more || item.moreEn || item.moreDe || ""
      if(this.lang == "de") return item.moreDe || item.moreEn || item.more || ""
      return item.moreEn || item.more || item.moreDe || ""
    },
    getAboutContent(){
      if(this.lang == "cn") return this.aboutContent
      if(this.lang == "de") return this.aboutContentDe
      return this.aboutContentEn
    },
    setLang(nextLang){
      this.lang = nextLang
      if(this.showModal && this.modalType == 'text'){
        this.modalContent = this.getAboutContent()
      }
    },
    toggleLang(){
      const currentIndex = this.languages.findIndex(language => language.code == this.lang)
      const nextLanguage = this.languages[(currentIndex + 1) % this.languages.length]
      this.setLang(nextLanguage.code)
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
      if(type == 'text') this.modalContent = this.getAboutContent()
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

// Stable corner links from the text guide also work on direct map visits.
function openLinkedCorner(){
  const corner = d.corners.find(item => '#' + item.id === window.location.hash)
  if(corner) d.setP((corner.st + corner.ed) / 2)
}
window.addEventListener('hashchange', openLinkedCorner)
window.addEventListener('load', openLinkedCorner)
