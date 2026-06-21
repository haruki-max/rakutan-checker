import { db } from "./firebase.js";


import {
  collection,
  getDocs,
  addDoc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

let isAdmin = false;
const adminPassword = "1114";

let subjects = [];

async function loadSubjects() {
  const querySnapshot = await getDocs(collection(db, "subjects"));

  subjects = [];

  querySnapshot.forEach((doc) => {
    subjects.push(doc.data());
  });

  displaySubjects(subjects);
}

async function addSubject() {
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
    const task = prompt("課題名（なければ空白）");
    const deadline = prompt("締切（例: 2026-06-20 18:00）");

    const subject = {
        name,
        teacher,
        credit,
        attendance,
        test,
        report,
        memo,
        risk,
        task,
        deadline
    };

    // Firestoreへ保存
    await addDoc(collection(db, "subjects"), subject);

    // ローカルにも保存
    subjects.push(subject);
    saveSubjects();
    displaySubjects(subjects);

    alert("保存しました！");
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
<p>課題：${subject.task || "なし"}</p>
<p>締切：${subject.deadline || "なし"}</p>
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

// 通知許可
if (Notification.permission !== "granted") {
  Notification.requestPermission();
}

// 締切チェック
function checkDeadlines() {
  const now = new Date();

  subjects.forEach(subject => {
    if (!subject.deadline || subject.deadline === "なし") return;

    const deadlineDate = new Date(subject.deadline);
    const diffTime = deadlineDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // 明日締切
    if (diffDays === 1) {
      new Notification("⚠️課題締切が近い", {
        body: `${subject.name} の課題が明日締切！`
      });
    }

    // 今日締切
    if (diffDays === 0) {
      new Notification("🚨今日締切", {
        body: `${subject.name} の課題今日まで！`
      });
    }
  });
}

// 10秒後に確認（テスト用）
setInterval(checkDeadlines, 3600000);

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("notifyBtn").addEventListener("click", function () {

        alert("押された");

        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                new Notification("通知テスト", {
                    body: "通知が有効になった！"
                });
            }
        });

    });
});

function deleteSubject(subjectName) {
    subjects = subjects.filter(subject => subject.name !== subjectName);

    localStorage.setItem("subjects", JSON.stringify(subjects));

    displaySubjects(subjects);
}

function editSubject(subjectName) {
    const subject = subjects.find(subject => subject.name === subjectName);

    if (!subject) return;

    const newDeadline = prompt("新しい締切を入力", subject.deadline);

    if (newDeadline !== null) {
        subject.deadline = newDeadline;

        localStorage.setItem("subjects", JSON.stringify(subjects));

        displaySubjects(subjects);
    }
}

function showTaskForm() {
  const form = document.getElementById("taskForm");

  if (form.style.display === "none") {
    form.style.display = "block";
  } else {
    form.style.display = "none";
  }
}

function addTask() {
  const subject = document.getElementById("taskSubject").value;
  const taskName = document.getElementById("taskName").value;
  const date = document.getElementById("taskDate").value;
  const time = document.getElementById("taskTime").value;

  if (!subject || !taskName || !date || !time) {
    alert("全部入力して！");
    return;
  }

  const li = document.createElement("li");
  li.innerHTML = `
    <strong>${subject}</strong><br>
    ${taskName}<br>
    締切: ${date} ${time}
  `;

  document.getElementById("taskList").appendChild(li);

  // 1時間前通知
  const deadline = new Date(`${date}T${time}`);
  const notifyTime = deadline.getTime() - (60 * 60 * 1000);
  const delay = notifyTime - Date.now();

  if (delay > 0) {
    setTimeout(() => {
      new Notification(`${subject}の課題締切1時間前！`, {
        body: `${taskName} の締切が近い！`
      });
    }, delay);
  }

  alert("課題保存した！");
}

async function testFirestore() {
  try {
    await window.addDoc(
      window.collection(window.db, "subjects"),
      {
        name: "Firestoreテスト",
        teacher: "ChatGPT",
        createdAt: new Date().toISOString()
      }
    );

    console.log("Firestore保存成功！");
    alert("Firestoreに保存できました！");
  } catch (e) {
    console.error(e);
    alert("保存失敗");
  }
}

window.addSubject = addSubject;