document.getElementById("loginBtn").addEventListener("click", () => {		// 點擊登入時的動作
  // 提取資料
  const studentId = document.getElementById("studentId").value.trim();
  const group = document.getElementById("select").value;
  const year = document.getElementById("yearSelect").value;

  // 判別合法性 (TODO: 判別學號合法)
  if (studentId === "") {
    alert("請輸入學號！"); 
    return;
  }

  if (group === "組別") {
    alert("請選擇組別！");
    return;
  }

  if (year === "適用學年必修科目表") {
    alert("請選擇適用學年必修科目表！");
    return;
  }

  // 設定網址參數
  const params = new URLSearchParams({
    studentId: studentId,
    group: group,
    year: year
  });

  // 跳轉頁面
  window.location.href = `intro.html?${params.toString()}`;
});