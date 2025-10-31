// 一次性動作區 =============================================================================================================

document.getElementById('studentIdDisplay').textContent = studentId;	// 顯示學號

const requiredCredits = {						// 固定
  基礎課程: 16,
  系必修: 56,
  組必修: 12,
  系內選修: 20,
  系外選修: 12,
  通識: 12

};

let totalReq=0,totalDone=0,totalRemain=0;				
const rows=[									
  ["基礎課程","req-basic","done-basic","remain-basic"],
  ["系必修","req-major","done-major","remain-major"],
  ["組必修","req-group","done-group","remain-group"],
  ["系內選修","req-elective","done-elective","remain-elective"],
  ["系外選修","req-outside","done-outside","remain-outside"],
  ["通識","req-general","done-general","remain-general"]
];

rows.forEach(r=>{							// 各類型學分計算
  const res = fillRow(...r);
  totalReq    += res.req;
  totalDone   += res.done;
  totalRemain += res.remain;
})

document.getElementById("totalRequired" ).textContent = totalReq;	// 總學分計算
document.getElementById("totalCompleted").textContent = totalDone;
const totalRemainCell = document.getElementById("totalRemaining");
totalRemainCell.textContent = totalRemain;
totalRemainCell.style.color = totalRemain > 0 ? 'red' : 'black';	
checkWarning();

// 函數定義 ===============================================================================================================

function getRequiredCredits(category) {			// 必修學分計算
  const data = JSON.parse(localStorage.getItem(`required_${studentId}`) || '[]');
  return data.filter(c => c.category === category).reduce((sum,c)=>sum+(Number(c.credits)||0),0);
}

function getElectiveCredits(type) {			// 選修學分計算 (自行輸入)
  const data = JSON.parse(localStorage.getItem(`elective_${type}_${studentId}`) || '[]');
  return data.reduce((sum, c) => sum + (parseInt(c.credits)||0), 0);
}

function getSDCredits() {				// 選修學分計算 (表格勾選)
  const data = JSON.parse(localStorage.getItem(`sd_courses_${studentId}`) || '[]');
  return data.reduce((sum, c) => sum + (parseInt(c.credits)||0), 0);
}

function getGeneralCredits() {				// 通識學分計算
  const data = JSON.parse(localStorage.getItem(`general_courses_${studentId}`) || '[]');
  return data.reduce((sum, c) => sum + (parseInt(c.credits)||0), 0);
}

function fillRow(name, reqId, doneId, remainId) {	// 表格
  const req = requiredCredits[name];

  let done = 0;
  if (name==='基礎課程' || name==='系必修' || name==='組必修') 
    done = getRequiredCredits(name);
  else if (name==='系內選修') 
    done = getElectiveCredits("internal") + getSDCredits();
  else if (name==='系外選修') 
    done = getElectiveCredits("external");
  else if (name==='通識') 
    done = getGeneralCredits();

  const remain = Math.max(req-done,0);

  document.getElementById(reqId   ).textContent = req;
  document.getElementById(doneId  ).textContent = done;
  const remainCell = document.getElementById(remainId);
  remainCell.textContent = remain;
  remainCell.style.color = remain > 0 ? '#FF0000' : 'black';

  return {req,done,remain};
}

function viewCourse(page,type){				// 頁面跳轉
  page=withParams(page);
  const sep=page.includes('?')?'&':'?';
  window.location.href=`${page}${sep}tab=${type}`;
}

function checkWarning() {				
  const warningContainer = document.getElementById('warningArea');

  // 檢查通識三類別
  const data = JSON.parse(localStorage.getItem(`general_courses_${studentId}`) || '[]');
  
  let hasHumanities = false;
  let hasSocial = false;
  let hasNature = false;

  data.forEach(c => {
    if (c.name.startsWith('[人文]')) hasHumanities = true;
    else if (c.name.startsWith('[社會]')) hasSocial = true;
    else if (c.name.startsWith('[自然]')) hasNature = true;
  });
  if (!hasHumanities || !hasSocial || !hasNature) {
    warningContainer.append('* 通識三領域尚未各完成一門！');
    warningContainer.append(document.createElement('br'));
  }

  // 檢查0學分必修
  const requiredBasics = ["國防", "大一體育上", "大一體育下", "大二體育上", "大二體育下"];
  const doneBasics = JSON.parse(localStorage.getItem(`required_${studentId}`) || '[]')
                        .filter(c => c.category === "基礎課程")
                        .map(c => c.name);

  const missing = requiredBasics.some(course => !doneBasics.includes(course));

  if (missing) {
    warningContainer.append('* 尚有0學分必修基礎課程未修！');
    warningContainer.append(document.createElement('br'));
  }

  // 一般警語
  warningContainer.append('* 如有學分相關問題，請詢問助教/註冊組！'); 
  warningContainer.append(document.createElement('br'));
}
