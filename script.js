let isAdmin = false;
const adminPassword = "1114";

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
 

function addSubject() {
    if (!isAdmin) {
        const pass = prompt("管理者パスワードを入力");

        if (pass !== adminPassword) {
            alert("パスワードが違います");
            return;
        }

        isAdmin = true;
    }

    const name = prompt("授業名を入力");
    if (!name) return;

    const teacher = prompt("教授名");
    const credit = prompt("単位数");
    const attendance = prompt("出席（良い / 普通 / 悪い）");
    const test = prompt("テスト点数（0〜100）");
    const report = prompt("レポート（あり / なし）");
    const memo = prompt("メモ");
    const risk = prompt("危険 / 普通 / 安全");

    subjects.push({
        name,
        teacher,
        credit,
        attendance,
        test,
        report,
        memo,
        risk
    });

    saveSubjects();
    displaySubjects(subjects);
}

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

            <button onclick="deleteSubject('${subject.name}')">
                削除
            </button>

            <button onclick="editSubject('${subject.name}')">
                編集
            </button>
        `;

    
document.body.appendChild(card);
  });
}

displaySubjects(subjects);

const searchBox = document.querySelector("input");

searchBox.addEventListener("input", function () {
    const keyword = searchBox.value;

    const filtered = subjects.filter(subject =>
        subject.name.includes(keyword)
    );

    displaySubjects(filtered);
});

displaySubjects(subjects);