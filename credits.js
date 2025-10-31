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
			
const rows=[									
  ["基礎課程","req-basic","done-basic","remain-basic","remain-basic-after"],
  ["系必修","req-major","done-major","remain-major","remain-major-after"],
  ["組必修","req-group","done-group","remain-group","remain-group-after"],
  ["系內選修","req-elective","done-elective","remain-elective","remain-elective-after"],
  ["系外選修","req-outside","done-outside","remain-outside","remain-outside-after"],
  ["通識","req-general","done-general","remain-general","remain-general-after"]
];

renderTable(rows);
checkWarning();

// 函數定義 ===============================================================================================================

async function renderTable(rows) {
  let totalReq = 0;
  let totalDone = 0;
  let totalRemain = 0;
  let totalRemainAfter = 0;	
  let res;
  
  res = fillRow(...rows[0], 0);						// 基礎課程	
  totalReq    	   += res.req;
  totalDone  	   += res.done;
  totalRemain 	   += res.remain;
  totalRemainAfter += res.remainAfter;
  const overflow_x  = res.overflow;

  res = fillRow(...rows[1], 0);						// 系必修
  totalReq         += res.req;
  totalDone   	   += res.done;
  totalRemain 	   += res.remain;
  totalRemainAfter += res.remainAfter;

  res = fillRow(...rows[2], 0);						// 組必修
  totalReq   	   += res.req;
  totalDone  	   += res.done;
  totalRemain 	   += res.remain;
  totalRemainAfter += res.remainAfter;
  const overflow_a  = res.overflow;

  res = fillRow(...rows[3], overflow_a);				// 系內選修
  totalReq    	   += res.req;
  totalDone   	   += res.done;
  totalRemain 	   += res.remain;
  totalRemainAfter += res.remainAfter;
  const overflow_b  = res.overflow;

  res = fillRow(...rows[5], 0);						// 通識
  totalReq    	   += res.req;
  totalDone   	   += res.done;
  totalRemain 	   += res.remain;
  totalRemainAfter += res.remainAfter;
  const overflow_c  = res.overflow;

  res = fillRow(...rows[4], overflow_b + overflow_c + overflow_x);	// 系外選修
  totalReq    	   += res.req;
  totalDone   	   += res.done;
  totalRemain 	   += res.remain;
  totalRemainAfter += res.remainAfter;
  
  document.getElementById("totalRequired" ).textContent = totalReq;	// 總學分計算
  document.getElementById("totalCompleted").textContent = totalDone;
  const totalRemainCell = document.getElementById("totalRemaining");
  const totalRemainAfterCell = document.getElementById("totalRemaining-after");
  totalRemainCell.textContent = totalRemain;
  totalRemainCell.style.color = totalRemain > 0 ? 'red' : 'black';
  totalRemainAfterCell.textContent = totalRemainAfter;
  totalRemainAfterCell.style.color = totalRemainAfter > 0 ? 'red' : 'black';	
}


function getRequiredCredits(category) {		// 必修學分計算
  return JSON.parse(localStorage.getItem(`required_${studentId}`) || '[]')
         .filter(c => c.category === category && c.name !== "勞作教育")
         .map(c => Number(c.credits) || 0);
}

function getElectiveCredits(type) {		// 選修學分計算 (自行輸入)
  return JSON.parse(localStorage.getItem(`elective_${type}_${studentId}`) || '[]')
         .map(c => Number(c.credits) || 0);
}

function getSDCredits() {			// 選修學分計算 (表格勾選)
  return JSON.parse(localStorage.getItem(`sd_courses_${studentId}`) || '[]')
         .map(c => Number(c.credits) || 0);
}

function getLaborCredits() {			// 選修學分計算 (表格勾選)
  return JSON.parse(localStorage.getItem(`required_${studentId}`) || '[]')
         .filter(c => c.category === "基礎課程" && c.name === "勞作教育")
         .map(c => Number(c.credits) || 0);
}

function getGeneralCredits() {			// 通識學分計算
  return JSON.parse(localStorage.getItem(`general_courses_${studentId}`) || '[]')
         .map(c => Number(c.credits) || 0);
}

function fillRow(name, reqId, doneId, remainId, remainAfterId, overflow_in) {		// 表格
  const req = requiredCredits[name];

  let done = 0;
  if (name==='基礎課程' || name==='系必修' || name==='組必修') 
    done = getRequiredCredits(name);
  else if (name==='系內選修') 
    done = getElectiveCredits('internal').concat(getSDCredits());
  else if (name==='系外選修') 
    done = getElectiveCredits("external").concat(getLaborCredits());
  else if (name==='通識') 
    done = getGeneralCredits();
  done = done.reduce((sum, c) => sum + c, 0);
  doneAfter = done + overflow_in;

  const remain = Math.max(req - done, 0);
  const remainAfter = Math.max(req - doneAfter, 0);
  const overflow = Math.max(doneAfter - req, 0);

  document.getElementById(reqId ).textContent = req;
  document.getElementById(doneId).textContent = done;
  
  const remainCell = document.getElementById(remainId);
  remainCell.textContent = remain;
  remainCell.style.color = remain > 0 ? '#FF0000' : 'black';

  const remainAfterCell = document.getElementById(remainAfterId);
  remainAfterCell.textContent = remainAfter;
  remainAfterCell.style.color = remainAfter > 0 ? '#FF0000' : 'black';


  return {req,done,remain,remainAfter,overflow};
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
  warningContainer.append('* 系統學分折抵以學分為單位計算！'); 
  warningContainer.append(document.createElement('br'));
  warningContainer.append('* 如有學分相關問題，請詢問助教/註冊組！'); 
  warningContainer.append(document.createElement('br'));
}
