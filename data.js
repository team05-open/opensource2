/* =====================================================================
   여기만 수정하면 됨 (앨범 / 곡 / 사진 / 유튜브 링크)
   =====================================================================
   [앨범 하나 양식]  복사해서 붙여넣고 내용만 바꿔. 앨범 사이엔 쉼표(,)

   {
     id:"영어-소문자-id",          // 앨범마다 달라야 함 (공백 대신 - 사용)
     title:"앨범 제목",
     artist:"아티스트",
     year:2024,
     genre:"장르",                 // 같은 장르끼리 위쪽 버튼으로 묶임
     cover:"images/앨범사진.jpg", 컬러는 앨범 표지 없을때 표시되는거   // 앨범 대표 사진. 비우면 아래 colors 색 그라데이션
     colors:["#222222","#888888"],
     desc:"음반 설명글",                 // ★ 음반 설명글: 음반 탭에서 LP판을 누르면 오른쪽에 뜸. 줄바꿈은 \n
     tracks:[
       { t:"곡 제목", l:"3:42", main:true,       // main:true → 대표곡 (맨 위 + 배지)
         url:"https://youtu.be/영상ID",           // 유튜브 링크 (비우면 재생 불가)
         img:"images/곡사진.jpg" },               // 곡 사진 (비우면 앨범 사진 사용)
       { t:"다른 곡", l:"4:10", url:"https://youtu.be/영상ID" }
     ]
   }
   ===================================================================== */
/* ===== 사이트 첫 화면 설정 ===== */
const site = {
  title: "just",                                   // 첫 화면에 크게 나오는 제목
  desc:  "설명글 추가 1\n설명글 추가 2",   // 제목 밑 작은 설명 (\n = 줄바꿈)
  bg:    "",                                       // 배경 사진 경로 (예: "images/main.jpg"). 비우면 아래 색 그라데이션
  bgColors: ["#1b2a49", "#6a3df0"],

  /* ===== 글씨체 (구글 폰트 이름을 그대로 적으면 자동 적용, 비우면 기본 글씨체) =====
     fontTitle : 제목류 (사이트 제목, 앨범 제목, 로고)   예: "Playfair Display", "Black Han Sans", "Noto Serif KR"
     fontBody  : 나머지 모든 글씨                        예: "Noto Sans KR", "Nanum Myeongjo", "Gowun Batang"
     폰트 이름은 fonts.google.com 에서 찾아서 이름만 복사해 넣기. */
  fontTitle: "",
  fontBody:  ""
};

/* ===== ★ 음반 설명글 입력하는 곳 =====
   각 앨범의 desc:"..." 따옴표 안에 쓰면 됩니다. (음반 탭에서 LP판을 누르면 오른쪽에 뜨는 글)
   - 줄바꿈      : 글 중간에 \n 을 쓰세요.         예) desc:"첫째 줄\n둘째 줄",
   - 큰따옴표(") : 글 안에서는 쓰지 말고 작은따옴표(')를 쓰세요. (꼭 필요하면 \" 로)
   - 긴 글       : 따옴표 대신 백틱(`)으로 감싸면 엔터로 줄바꿈해도 됩니다.
   예) desc:"2024년에 발매된 앨범.\n밤 드라이브에 어울리는 곡들이 담겨 있어요.",
   (앨범 상세 화면에는 설명글이 나오지 않아요 - 음반 탭 전용) */
const albums = [
  { id:"ex-file", title:"ex file", artist:"Ruel", year:2024, genre:"pop",
    cover:"image/ruel.png", colors:["#1b2a49","#6a3df0"],
    desc:"음반 설명글을 입력하세요",   // ★ 여기에 음반 설명글 입력 (줄바꿈 = \n)
    tracks:[
      { t:"Night Drive", l:"3:42", main:true, url:"https://www.youtube.com/watch?v=3YHGEuefsbI&list=PLT1VpimKCSOBqEP4ibGwRqpfoGN3g502T&index=3", img:"image/painkiller.png" },
      { t:"Neon Rain",   l:"4:10", url:"", img:"" },
      { t:"Last Exit",   l:"3:25", url:"", img:"" }
    ] },
  { id:"slow-bloom", title:"Slow Bloom", artist:"아티스트 B", year:2023, genre:"Ambient",
    cover:"", colors:["#0f3d2e","#d96f8a"],
    desc:"음반 설명글을 입력하세요",   // ★ 여기에 음반 설명글 입력 (줄바꿈 = \n)
    tracks:[
      { t:"Slow Bloom",  l:"5:02", main:true, url:"" },
      { t:"Petals",      l:"4:48", url:"" },
      { t:"Morning Dew", l:"6:15", url:"" }
    ] },
  { id:"paper-sun", title:"Paper Sun", artist:"아티스트 C", year:2022, genre:"Indie",
    cover:"", colors:["#f2b134","#7a2e1d"],
    desc:"음반 설명글을 입력하세요",   // ★ 여기에 음반 설명글 입력 (줄바꿈 = \n)
    tracks:[
      { t:"Paper Sun",   l:"3:18", main:true, url:"" },
      { t:"Porch Light", l:"2:57", url:"" },
      { t:"Letters",     l:"3:40", url:"" }
    ] },
  { id:"static-hymn", title:"Static Hymn", artist:"아티스트 D", year:2024, genre:"Experimental",
    cover:"", colors:["#222222","#bbbbbb"],
    desc:"음반 설명글을 입력하세요",   // ★ 여기에 음반 설명글 입력 (줄바꿈 = \n)
    tracks:[
      { t:"Static Hymn", l:"7:01", main:true, url:"" },
      { t:"Low Choir",   l:"4:33", url:"" }
    ] }
  ,
  { id:"midnight-letter", title:"Midnight Letter", artist:"아티스트 E", year:2024, genre:"Jazz",
    cover:"", colors:["#2b1a12","#c98b4a"],
    desc:"음반 설명글을 입력하세요",   // ★ 여기에 음반 설명글 입력 (줄바꿈 = \n)
    tracks:[
      { t:"Midnight Letter", l:"4:20", main:true, url:"" },
      { t:"Smoke & Piano",   l:"5:05", url:"" },
      { t:"Closing Time",    l:"3:48", url:"" }
    ] },
  { id:"blue-hour", title:"Blue Hour", artist:"아티스트 F", year:2023, genre:"R&B",
    cover:"", colors:["#0b2a4a","#4aa3c9"],
    desc:"음반 설명글을 입력하세요",   // ★ 여기에 음반 설명글 입력 (줄바꿈 = \n)
    tracks:[
      { t:"Blue Hour",  l:"3:30", main:true, url:"" },
      { t:"Afterglow",  l:"3:12", url:"" },
      { t:"Slow Tide",  l:"4:02", url:"" }
    ] },
  { id:"quiet-room", title:"Quiet Room", artist:"아티스트 G", year:2021, genre:"Classical",
    cover:"", colors:["#3a3a3a","#e8e2d4"],
    desc:"음반 설명글을 입력하세요",   // ★ 여기에 음반 설명글 입력 (줄바꿈 = \n)
    tracks:[
      { t:"Quiet Room",   l:"6:40", main:true, url:"" },
      { t:"Window Light", l:"5:15", url:"" },
      { t:"Evening Study",l:"4:55", url:"" }
    ] }
];

/* ===== 만든 사람 (맨 아래 카드) =====
   name: 이름 / role: 맡은 일 / img: 사진 경로 (비우면 이름 첫 글자가 들어간 원)
   한 명 추가하려면 { ... } 한 줄을 복사해서 붙여넣으세요. */
const team = [
  { name:"이름 1", role:"맡은 일을 추가하시오", img:"" },
  { name:"이름 2", role:"맡은 일을 추가하시오", img:"" },
  { name:"이름 3", role:"맡은 일을 추가하시오", img:"" },
  { name:"이름 4", role:"맡은 일을 추가하시오", img:"" },
  { name:"이름 5", role:"맡은 일을 추가하시오", img:"" }
];
