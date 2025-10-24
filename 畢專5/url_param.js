// 取得 URL 參數
const params = new URLSearchParams(window.location.search);
const allowedGroups = ['行銷與數位經營組','服務創新與創業組','尚未分組'];

const studentId = params.get('studentId');
const group = params.get('group');
const year = params.get('year');

// 判別合法性
if (!studentId || !allowedGroups.includes(group)) {
  alert("請先登入！");
  window.location.href = 'login.html';
}

// 設定跳轉連結
function withParams(page, extra = "") {
  let url = `${page}?studentId=${encodeURIComponent(studentId)}&group=${encodeURIComponent(group)}&year=${encodeURIComponent(year)}`;
  url += extra;
  return url;
}

document.getElementById('homeLink'   ).href = withParams('login.html');
document.getElementById('introLink'  ).href = withParams('intro.html'); 
document.getElementById('courseLink' ).href = withParams('course.html');
document.getElementById('studiedLink').href = withParams('studied.html');
document.getElementById('creditsLink').href = withParams('credits.html');
