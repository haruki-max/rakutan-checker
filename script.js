const isAdmin =
  prompt("管理者パスワード") === "1114";


let subjects = JSON.parse(localStorage.getItem("subjects")) || [
  {
    name: "民法総則",
    teacher: "山田",
    credit: 2,
    attendance: "重い",
    test: "100%",
    report: "少ない",
    risk: "危険"
  },

  {
    name: "刑法総論",
    teacher: "佐藤",
    credit: 2,
    attendance: "普通",
    test: "70%",
    report: "あり",
    risk: "普通"
  }
];

function saveSubjects() {
  localStorage.setItem("subjects", JSON.stringify(subjects));
}

function displaySubjects(list) {

 const riskOrder = {
  "危険": 1,
  "普通": 2,
  "安全": 3
};

list.sort((a, b) => {
  return riskOrder[a.risk] - riskOrder[b.risk];
});

  document.querySelectorAll(".card").forEach(card => {
    card.remove();
  });

  list.forEach(subject => {
    const card = document.createElement("div");
   card.className = `card ${subject.risk}`;
 card.innerHTML = `
<h2>${subject.name}</h2>
<p>教授：${subject.teacher}</p>
<p>単位数：${subject.credit}</p>
<p>出席：${subject.attendance}</p>
<p>テスト：${subject.test}</p>
<p>レポート：${subject.report}</p>
<p>メモ：${subject.memo || "なし"}</p>

<span class="badge">${subject.risk}</span>

${isAdmin ? `
<button onclick="deleteSubject('${subject.name}')">
削除
</button>

<button onclick="editSubject('${subject.name}')">
編集
</button>
` : ""}
`;
       
document.body.appendChild(card);
  });
}

displaySubjects(subjects);

const search${isAdmin ? `

<button onclick="deleteSubject('${subject.name}')">
削除
</button>

<button onclick="editSubject('${subject.name}')">
編集
</button>
` : ""}
 Box = document.querySelector("input");

searchBox.addEventListener("input", function () {
  const keyword = searchBox.value;

  const filtered = subjects.filter(subject =>
    subject.name.includes(keyword)
  );

  displaySubjects(filtered);
});

function addSubject() {
  const name = prompt("授業名を入力");
  if (!name) return;

  subjects.push({
    name: name,
    teacher: "未設定",
    credit: "未設定",
    attendance: "未設定",
    test: "未設定",
    report: "未設定",
    risk: "普通",
    memo: ""
  });

  saveSubjects();
  displaySubjects(subjects);
}

function deleteSubject(name) {
  subjects = subjects.filter(subject =>
    subject.name !== name
  );

  saveSubjects();
  displaySubjects(subjects);
}

function editSubject(name) {
  const subject = subjects.find(s => s.name === name);

  if (!subject) return;

  const teacher = prompt("教授名", subject.teacher);
  const credit = prompt("単位数", subject.credit);
  const attendance = prompt("出席", subject.attendance);
  const test = prompt("テスト割合", subject.test);
  const report = prompt("レポート", subject.report);
  const memo = prompt("メモ", subject.memo || "");
  let risk = prompt(
  "危険度を選択\n1 = 危険\n2 = 普通\n3 = 安全",
  "1"
);

if (risk === "1") {
  risk = "危険";
} else if (risk === "2") {
  risk = "普通";
} else if (risk === "3") {
  risk = "安全";
} else {
  risk = subject.risk;
}

  subject.teacher = teacher || subject.teacher;
  subject.credit = credit || subject.credit;
  subject.attendance = attendance || subject.attendance;
  subject.test = test || subject.test;
  subject.report = report || subject.report;
  subject.memo = memo || subject.memo;
  subject.risk = risk || subject.risk;

  saveSubjects();
  displaySubjects(subjects);
}

if (!isAdmin) {
  document.getElementById(
    "addButton"
  ).style.display = "none";
}