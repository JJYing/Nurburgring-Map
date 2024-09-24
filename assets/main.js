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
    showAllCornerNames: true,
    nightMode: false,
    showCorner: false,
    showSection: false,
    currentCorner: null,
    scrollDistance: 0,
    cornerStart: 0,
    cornerEnd: 0,
    sectionStart: 0,
    sectionEnd: 0,
    sections: [
      {
        "st":.019,
        "ed":.064,
        "x":.34,
        "y":.88,
        "ch": "Hatzenbach",
        "en": "Hunt Stream",
        "de": "Hatzenbach",
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
        "nk": "弧形弯"
      },
      {
        "st": .038,
        "ed": .049,
        "x": .27,
        "y": .895,
        "h": "l",
        "v": "b",
        "ch": "扭扭弯",
        "nk": "扭扭弯"
      },
      {
        "st": .065,
        "ed": .076,
        "x": .224,
        "y": .852,
        "h": "l",
        "v": "b",
        "ch": "大橡树",
        "de": "Hoheichen",
        "en": "High Oaks",
        "nk": "龙哥不杀弯"
      },
      {
        "st": .077,
        "ed": .089,
        "x": .176,
        "y": .838,
        "h": "r",
        "v": "t",
        "ch": "小桥直线",
        "nk": "小桥直线"
      },
      {
        "st": .1,
        "ed": .117,
        "x": .156,
        "y": .759,
        "h": "l",
        "v": "m",
        "ch": "飞机场",
        "de": "Flugplatz",
        "more": "虽然很多赛车在这个高速弯起飞，但事实上这里叫「飞机场」的原因是在这个弯道边上以前是个飞机场",
      },      
      {
        "st": .179,
        "ed": .188,
        "x": .106,
        "y": .526,
        "h": "l",
        "v": "m",
        "ch": "Aremberg",
        "de": "Aremberg",
        "en": "Arem mountain",
      }, 
    ]
  },
  methods: {
    openSheet: function(i){
      this.showSheet = true
    }
  }
})


document.addEventListener('scroll', function(e){
  if(window.scrollY > 10){
    document.body.classList = "scrolled"
  }
  else{
    document.body.classList = ""
  }
});


function updateScrollDistance(){
  d.showCorner = false
  d.showSection = false
  d.showCornerDesc = false
  d.currentCorner = null
  const progress = window.scrollY / 70000
  body.style.setProperty('--p', progress)
  d.p = progress
  d.corners.forEach((corner, i)=>{
    if(progress > corner.st && progress < corner.ed){
      d.showCorner = true
      d.cornerStart = corner.st
      d.cornerEnd = corner.ed
      d.currentCorner = corner
      console.log(d.currentCorner);
      
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
  const pageHeight = body.scrollHeight
  body.style.setProperty('--pageH', `${pageHeight}`)
}

window.addEventListener('scroll', updateScrollDistance)
window.addEventListener('resize', function(){
  updateScrollDistance
  updatePageHeight
})

updateScrollDistance()
updatePageHeight()

document.querySelector('.track-map > .inner').addEventListener('mousemove', function(event) {
  // 获取 .inner 元素的边界框
  const innerRect = this.getBoundingClientRect();

  // 计算鼠标在 .inner 内的位置
  const mouseX = event.clientX - innerRect.left;
  const mouseY = event.clientY - innerRect.top;

  // 计算鼠标位置的比例
  d.mX = mouseX / innerRect.width;
  d.mY = mouseY / innerRect.height;
});
