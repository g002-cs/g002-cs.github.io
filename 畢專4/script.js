// 課程資料 (每類 3 科)
const courses = {
  "必修": ["微積分", "物理", "程式設計"],
  "選修": ["經濟學", "統計學", "人工智慧概論"],
  "通識": ["哲學導論", "心理學", "社會學"]
};

// 每類修課統計
const courseData = {
  "必修": { required: 2, completed: 0 },
  "選修": { required: 3, completed: 0 },
  "通識": { required: 3, completed: 0 }
};

// 讀取網址參數
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// 載入頁面初始化
window.onload = () => {
  const studentId = getQueryParam("studentId");
  if (studentId) {
    document.getElementById("studentInfo").innerText = "學號：" + studentId;
  }

  // 預設顯示必修
  loadCourseList("必修");
  renderTable();
};

// 載入某類別的課程清單
function loadCourseList(type) {
  const courseListDiv = document.getElementById("courseList");
  courseListDiv.innerHTML = "";
  document.getElementById("courseCategoryTitle").innerText = type + "科目";

  courses[type].forEach(courseName => {
    const label = document.createElement("label");
    label.innerHTML = `<input type="checkbox" data-type="${type}" value="${courseName}"> ${courseName}`;
    courseListDiv.appendChild(label);
  });

  // 綁定事件
  courseListDiv.querySelectorAll("input[type=checkbox]").forEach(checkbox => {
    checkbox.addEventListener("change", () => {
      const type = checkbox.getAttribute("data-type");
      if (checkbox.checked) {
        courseData[type].completed += 1;
      } else {
        courseData[type].completed -= 1;
      }
      renderTable();
    });
  });
}

// 點擊上方按鈕切換課程清單
document.addEventListener("click", e => {
  if (e.target.matches(".buttons button")) {
    const type = e.target.getAttribute("data-type");
    loadCourseList(type);
  }
});

// 渲染表格
function renderTable() {
  const tbody = document.getElementById("courseTable");
  tbody.innerHTML = "";

  for (let type in courseData) {
    const required = courseData[type].required;
    const completed = courseData[type].completed;
    const remaining = required - completed;

    const row = `
      <tr>
        <td>${type}</td>
        <td>${required}</td>
        <td>${completed}</td>
        <td>${remaining >= 0 ? remaining : 0}</td>
      </tr>
    `;
    tbody.innerHTML += row;
  }
}
