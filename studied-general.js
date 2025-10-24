// 一次性動作區 =============================================================================================================

const storageKey = `required_${studentId}`;
const typeSelect = document.getElementById('typeSelect');
const categorySelect = document.getElementById('categorySelect');
let courses = [];

const generalKey = `general_courses_${studentId}`;
const generalList = document.getElementById('generalCourseList');

document.getElementById('studentIdDisplay').textContent = studentId;		// 顯示學號
loadCourses(generalKey, generalList);

// 監測區 ================================================================================================================

typeSelect.addEventListener('change', function() {				// 更改必修/選修/通識時觸發
  const value = this.value;
  if (value === '必修') 
    window.location.href = withParams('studied-required.html');
  if (value === '選修') 
    window.location.href = withParams('studied-elective.html');
  if (value === '通識') 
    window.location.href = withParams('studied-general.html');
});


document.getElementById('addCourseBtn').onclick = () => {			// 輸入課程時觸發
  const courseName = document.getElementById('courseName');	
  const courseCredits = document.getElementById('courseCredits');
  const courseType = document.getElementById('courseCategorySelect');

  const n = courseName.value.trim(), c = courseCredits.value.trim(), t = courseType.value.trim();
  if (!n || !c) return alert('請輸入完整資訊');

  const li = document.createElement('li');

  const nameSpan = document.createElement('span');
  nameSpan.className = 'course-name';
  nameSpan.textContent = `[${t}] ${n}` ;

  const creditsSpan = document.createElement('span');
  creditsSpan.className = 'course-credits';
  creditsSpan.textContent = `${c}學分`;

  const del = document.createElement('button');
  del.textContent = '刪除';
  del.onclick = () => { 
    li.remove(); saveCourses(generalKey, generalList); 
  };

  li.appendChild(nameSpan);
  li.appendChild(creditsSpan);
  li.appendChild(del);

  generalCourseList.appendChild(li);
  courseName.value = ''; courseCredits.value = '';
  saveCourses(generalKey, generalList);
};


// 函數定義 ===============================================================================================================

function loadCourses(key, listEl) {	// 讀取本地手動輸入資料
  const data = JSON.parse(localStorage.getItem(key) || '[]');
  data.forEach(c => {
    const li = document.createElement('li');

    const nameSpan = document.createElement('span');
    nameSpan.className = 'course-name';
    nameSpan.textContent = c.name;

    const creditsSpan = document.createElement('span');
    creditsSpan.className = 'course-credits';
    creditsSpan.textContent = `${c.credits}學分`;

    const del = document.createElement('button');
    del.textContent = '刪除';
    del.onclick = () => { 
      li.remove(); saveCourses(key, listEl); 
    };

    li.appendChild(nameSpan);
    li.appendChild(creditsSpan);
    li.appendChild(del);

    listEl.appendChild(li); 
  });
}

function saveCourses(key, listEl) {	// 本地記錄手動輸入資料
  const data = [];
  listEl.querySelectorAll('li').forEach(li => {
    const name = li.childNodes[0].textContent.trim();
    const creditsText = li.childNodes[1].textContent.trim();
    const match = creditsText.match(/(\d+)學分/);
    if (match) 
      data.push({ name, credits: Number(match[1]) });
  });
  localStorage.setItem(key, JSON.stringify(data));
}