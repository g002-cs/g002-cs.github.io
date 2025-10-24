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
document.getElementById("totalRemaining").textContent = totalRemain;
checkGeneralFields();

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
  document.getElementById(remainId).textContent = remain;

  return {req,done,remain};
}

function viewCourse(page,type){				// 頁面跳轉
  page=withParams(page);
  const sep=page.includes('?')?'&':'?';
  window.location.href=`${page}${sep}tab=${type}`;
}

function checkGeneralFields() {				// 檢查通識三類別
  const data = JSON.parse(localStorage.getItem(`general_courses_${studentId}`) || '[]');
  
  let hasHumanities = false;
  let hasSocial = false;
  let hasNature = false;

  data.forEach(c => {
    if (c.name.startsWith('[人文]')) hasHumanities = true;
    else if (c.name.startsWith('[社會]')) hasSocial = true;
    else if (c.name.startsWith('[自然]')) hasNature = true;
  });

  const warningContainer = document.getElementById('warningArea');
  if (!hasHumanities || !hasSocial || !hasNature) 
    warningContainer.append('* 通識三領域尚未各完成一門！');

}