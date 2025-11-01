// 一次性動作區 =============================================================================================================

document.getElementById('studentIdDisplay').textContent = studentId;	// 顯示學號
const warningContainer = document.getElementById('warningArea');

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
         .map(c => Number(c.credits));
}

function getElectiveCredits(type) {		// 選修學分計算 (自行輸入)
  return JSON.parse(localStorage.getItem(`elective_${type}_${studentId}`) || '[]')
         .map(c => Number(c.credits));
}

function getSDCredits() {			// 選修學分計算 (表格勾選)
  return JSON.parse(localStorage.getItem(`sd_courses_${studentId}`) || '[]')
         .map(c => Number(c.credits));
}

function getLaborCredits() {			// 選修學分計算 (表格勾選)
  return JSON.parse(localStorage.getItem(`required_${studentId}`) || '[]')
         .filter(c => c.category === "基礎課程" && c.name === "勞作教育")
         .map(c => Number(c.credits));
}

function getGeneralCredits() {			// 通識學分計算
  return JSON.parse(localStorage.getItem(`general_courses_${studentId}`) || '[]')
         .map(c => Number(c.credits));
}

function fillRow(name, reqId, doneId, remainId, remainAfterId, overflow_in) {		// 表格
  const req = requiredCredits[name];

  let doneList = 0;
  if (name === '基礎課程' || name === '系必修' || name === '組必修') 
    doneList = getRequiredCredits(name);
  else if (name === '系內選修') 
    doneList = getElectiveCredits('internal').concat(getSDCredits());
  else if (name === '系外選修') 
    doneList = getElectiveCredits("external").concat(getLaborCredits());
  else if (name=== '通識') 
    doneList = getGeneralCredits();

  const done = doneList.reduce((sum, c) => sum + c, 0);
  const remain = Math.max(req - done, 0);
  const doneAfter = done + overflow_in;
  const remainAfter = Math.max(req - doneAfter, 0);

  // 折抵計算 // 警告：僅適用於組必修均為 3 學分之狀況
  let overflow = 0;
  if (name === '組必修') {
    overflow = Math.max(doneAfter - req, 0);
  }
  else if (name === '系內選修' || name==='通識') {
    if (doneAfter < req) {
      overflow = 0;
    }
    else {
      if (doneList.some(c => c > 10)) {
        warningContainer.append('* 請確認10學分以上課程的存在性，目前不納入學分折抵計算！');
        warningContainer.append(document.createElement('br'));
      }

      const countArray = Array(10).fill(0);
      doneList.forEach(c => { if (c <= 10) countArray[c-1]++; });
      countArray[3-1] += Math.floor(overflow_in / 3);

      overflow = maxScoreUnderTarget(countArray, doneAfter - req);
    }
  }
  else {
    overflow = Math.max(doneAfter - req, 0); // 無用
  } 

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

function maxScoreUnderTarget(courses, target) {
  const scores = [1,2,3,4,5,6,7,8,9,10];  // 支援 1~10 學分
  const dp = Array(target + 1).fill(0);

  for (let i = 0; i < scores.length; i++) {
    const score = scores[i];
    const count = courses[i] || 0;
    let k = 1, remaining = count;
    while (remaining > 0) {
      const use = Math.min(k, remaining);
      const weight = score * use;
      for (let j = target; j >= weight; j--) {
        dp[j] = Math.max(dp[j], dp[j - weight] + weight);
      }
      remaining -= use;
      k *= 2;
    }
  }
  return dp[target];
}

function checkWarning() {				
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
  warningContainer.append('* 本系統以課程為單位折抵學分，故可能有不完全折抵之狀況！'); 
  warningContainer.append(document.createElement('br'));
  warningContainer.append('* 如有學分相關問題，請詢問助教/註冊組！'); 
  warningContainer.append(document.createElement('br'));
}
