import { db, auth } from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";


import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

let isAdmin = false;
const adminPassword = "1114";

let subjects = [];

async function loadSubjects() {
  if (!auth.currentUser) return;

const querySnapshot = await getDocs(
  collection(db, "users", auth.currentUser.uid, "subjects")
);

  subjects = [];

  querySnapshot.forEach((docSnap) => {
    subjects.push({
      id: docSnap.id,
      ...docSnap.data()
    });
  });

  console.log(subjects);

  displaySubjects(subjects);
  displayTasks(subjects);
}

function displayTasks(list) {
    const taskList = document.getElementById("taskList");
    taskList.innerHTML = "";

    const tasks = list
        .filter(subject => subject.task && subject.task.trim() !== "")
        .sort((a, b) => {
            if (!a.deadline) return 1;
            if (!b.deadline) return -1;
            return new Date(a.deadline) - new Date(b.deadline);
        });

    tasks.forEach(subject => {
    const deadline = new Date(subject.deadline);
    const today = new Date();

    const diffDays = Math.ceil(
        (deadline - today) / (1000 * 60 * 60 * 24)
    );

    let status = "";

    if (diffDays < 0) {
        status = "🔴 期限切れ";
    } else if (diffDays === 0) {
        status = "🟠 今日まで";
    } else if (diffDays === 1) {
        status = "🟡 あと1日";
    } else {
        status = `🟢 あと${diffDays}日`;
    }

    const li = document.createElement("li");

    li.innerHTML = `
        <strong>${subject.name}</strong><br>
        📝 ${subject.task}<br>
        📅 ${subject.deadline}<br>
        ${status}
    `;

    taskList.appendChild(li);
    });
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
    await addDoc(
    collection(db, "users", auth.currentUser.uid, "subjects"),
    subject
);

    // ローカルにも保存
    await loadSubjects();

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
  // まず危険度順
  const riskDiff = riskOrder[a.risk] - riskOrder[b.risk];
  if (riskDiff !== 0) return riskDiff;

  // 同じ危険度なら締切が近い順
  if (!a.deadline) return 1;
  if (!b.deadline) return -1;

  return new Date(a.deadline) - new Date(b.deadline);
});

  document.querySelectorAll(".card").forEach(card => {
    card.remove();
  });

  list.forEach(subject => {
    let deadlineText = "期限なし";

if (subject.deadline) {
  const now = new Date();
  const deadline = new Date(subject.deadline);

  const diffDays = Math.ceil(
    (deadline - now) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) {
    deadlineText = "🔴 期限切れ";
  } else if (diffDays === 0) {
    deadlineText = "🟠 今日まで";
  } else if (diffDays === 1) {
    deadlineText = "🟡 あと1日";
  } else {
    deadlineText = `🟢 あと${diffDays}日`;
  }
}
    const card = document.createElement("div");
    let cardClass = subject.risk;

if (subject.deadline) {
    const diff = Math.ceil(
        (new Date(subject.deadline) - new Date()) / (1000 * 60 * 60 * 24)
    );

    if (diff < 0) {
        cardClass = "expired";
    } else if (diff === 0) {
        cardClass = "today";
    }
}
   card.className = `card ${cardClass}`;
  card.innerHTML = `
<h2>${subject.name}</h2>
<p>教授：${subject.teacher}</p>
<p>単位数：${subject.credit}</p>
<p>出席：${subject.attendance}</p>
<p>テスト：${subject.test}</p>
<p>レポート：${subject.report}</p>
<p>課題：${subject.task || "なし"}</p>
<p>締切：${subject.deadline || "なし"}</p>
<p><strong>${deadlineText}</strong></p>
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
if ("Notification" in window) {
  if (Notification.permission !== "granted") {
    Notification.requestPermission();
  }
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

async function deleteSubject(subjectName) {
    const subject = subjects.find(s => s.name === subjectName);

    if (!subject) return;

    await deleteDoc(
    doc(db, "users", auth.currentUser.uid, "subjects", subject.id)
);

    await loadSubjects();
}

async function editSubject(subjectName) {
    const subject = subjects.find(subject => subject.name === subjectName);

    if (!subject) return;

    const newDeadline = prompt("新しい締切を入力", subject.deadline);

    if (newDeadline !== null) {
        subject.deadline = newDeadline;

        await updateDoc(
    doc(db, "users", auth.currentUser.uid, "subjects", subject.id),
    {
            deadline: newDeadline
        }
      );
    

        await loadSubjects();
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

async function addTask() {
  const subject = document.getElementById("taskSubject").value;
  const taskName = document.getElementById("taskName").value;
  const date = document.getElementById("taskDate").value;
  const time = document.getElementById("taskTime").value;
  const target = subjects.find(s => s.name === subject);

  if (!target) {
    alert("授業が見つかりません");
    return;
 }

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

  await updateDoc(doc(db, "subjects", target.id), {
    task: taskName,
    deadline: `${date} ${time}`
});

await loadSubjects();

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
window.editSubject = editSubject;
window.deleteSubject = deleteSubject;
window.showTaskForm = showTaskForm;
window.addTask = addTask;

document.getElementById("registerBtn").addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("新規登録成功！");
    } catch (e) {
        alert(e.message);
    }
});

document.getElementById("loginBtn").addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        alert("ログイン成功！");
    } catch (e) {
        alert(e.message);
    }
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
    await signOut(auth);
    alert("ログアウトしました");
});

onAuthStateChanged(auth, async (user) => {
    const userInfo = document.getElementById("userInfo");

    if (user) {
        userInfo.textContent = `ログイン中: ${user.email}`;
        await loadSubjects();
    } else {
        userInfo.textContent = "ログアウト中";
        subjects = [];
        displaySubjects([]);
        displayTasks([]);
    }
});

document.getElementById("syncBtn").addEventListener("click", async () => {
    const manabaId = document.getElementById("manabaId").value;
    const manabaPassword = document.getElementById("manabaPassword").value;

    if (!manabaId || !manabaPassword) {
        alert("学籍番号とパスワードを入力してください");
        return;
    }

    // 同期開始
    document.getElementById("syncStatus").textContent = "同期中...";

    console.log({
        uid: auth.currentUser.uid,
        manabaId
    });

    const syncBtn = document.getElementById("syncBtn");

syncBtn.disabled = true;
syncBtn.textContent = "同期中...";

    try {
      const idToken = await auth.currentUser.getIdToken();
        const response = await fetch(
            "https://manaba-sync-1000257457532.asia-northeast1.run.app",
            {
                method: "POST",
                headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${idToken}`
},
                body: JSON.stringify({
                    manabaId,
                    manabaPassword
                })
            }
        );

        const result = await response.json();

        if (result.success) {
            document.getElementById("syncStatus").textContent = "同期完了！";

            await loadSubjects();

            const now = new Date();
const syncTime = now.toLocaleString("ja-JP");

localStorage.setItem("lastSync", syncTime);

document.getElementById("lastSync").textContent =
    `最終同期：${syncTime}`;

            
            alert(`同期完了！${result.taskCount ?? 0}件の課題を取得しました`);
        } else {
            document.getElementById("syncStatus").textContent = "同期失敗";
            alert(`同期失敗：${result.message}`);
        }

    } catch (error) {
    console.error("同期エラー:", error);
    document.getElementById("syncStatus").textContent = "同期失敗";
    alert("同期中にエラーが発生しました");
} finally {
    syncBtn.disabled = false;
    syncBtn.textContent = "Manabaと同期";
}
});

const lastSync = localStorage.getItem("lastSync");

if (lastSync) {
    document.getElementById("lastSync").textContent =
        `最終同期：${lastSync}`;
}