import firebase_admin
from firebase_admin import firestore

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

import time


# Firebase初期化
if not firebase_admin._apps:
    firebase_admin.initialize_app()

db = firestore.client()


def run_sync(uid, manaba_id, manaba_password):

    # Cloud Run用Chromium設定
    options = Options()
    options.binary_location = "/usr/bin/chromium"

    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1920,1080")

    driver = webdriver.Chrome(options=options)

    try:
        # Manabaを開く
        driver.get("https://hgu.manaba.jp")

        wait = WebDriverWait(driver, 20)

        # ログインフォームを取得
        username = wait.until(
            EC.visibility_of_element_located((By.NAME, "username"))
        )

        password = wait.until(
            EC.visibility_of_element_located((By.NAME, "password"))
        )

        login_button = wait.until(
            EC.element_to_be_clickable(
                (By.CSS_SELECTOR, "button[type='submit']")
            )
        )

        # ユーザーが入力したManaba情報を使用
        username.send_keys(manaba_id)
        password.send_keys(manaba_password)
        login_button.click()

        time.sleep(5)

        # 課題一覧
        driver.get("https://hgu.manaba.jp/ct/home_library_query")

        time.sleep(3)

        rows = driver.find_elements(
            By.CSS_SELECTOR,
            "table.stdlist tbody tr"
        )

        print("取得した行数:", len(rows))

        # ユーザーごとのsubjectsに保存
        subject_ref = (
            db.collection("users")
            .document(uid)
            .collection("subjects")
        )

        manaba_tasks = set()

        for row in rows[1:]:

            cols = row.find_elements(By.TAG_NAME, "td")

            if len(cols) >= 5:

                course = cols[2].text
                task = cols[1].text
                deadline = cols[4].text

                key = (course, task)
                manaba_tasks.add(key)

                existing = (
                    subject_ref
                    .where("name", "==", course)
                    .where("task", "==", task)
                    .get()
                )

                data = {
                    "name": course,
                    "teacher": "",
                    "credit": "",
                    "attendance": "",
                    "test": "",
                    "report": "",
                    "memo": "",
                    "risk": "普通",
                    "task": task,
                    "deadline": deadline
                }

                if existing:
                    existing[0].reference.update(data)
                    print("更新:", task)

                else:
                    subject_ref.add(data)
                    print("追加:", task)

        # Manabaから消えた課題をFirestoreから削除
        docs = subject_ref.stream()

        for doc in docs:

            data = doc.to_dict()

            # Manaba同期で追加された課題だけを対象
            task = data.get("task")
            name = data.get("name")

            if task and (name, task) not in manaba_tasks:
                print("削除:", task)
                doc.reference.delete()

        print("同期完了")

        return {
            "success": True,
            "message": "Manaba同期が完了しました",
            "taskCount": len(manaba_tasks)
        }

    finally:
        driver.quit()