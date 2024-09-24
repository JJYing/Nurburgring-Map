let rootURL = document.baseURI
const body = document.querySelector('body');

var d = new Vue({
  el: '#app',
  data: {
    p: 0,
    w: 660,
    h: 530,
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
        "ed":.057,
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
        "x": .34,
        "y": .88,
        "ch": "萨宾娜弯",
        "en": "Sabine Schmitz Curve",
        "de": "Sabine Schmitz Kurve",
      },
      {
        "st": .019,
        "ed": .032,
        "x": .28,
        "y": .94,
        "ch": "Hatzenbach Bogen",
        "en": "Hunt Stream Curve",
        "de": "Hatzenbach Bogen",
        "nk": "弧形弯"
      },
      {
        "st": .038,
        "ed": .049,
        "x": .27,
        "y": .82,
        "nk": "扭扭弯"
      },
      {
        "st": .07,
        "ed": .09,
        "x": .27,
        "y": .82,
        "ch": "lalala",
        "en": 69,
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