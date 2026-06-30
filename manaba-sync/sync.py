import os
from dotenv import load_dotenv

load_dotenv()

USERNAME = os.getenv("MANABA_USERNAME")
PASSWORD = os.getenv("MANABA_PASSWORD")

print(f"USERNAME: {USERNAME}")
print(f"PASSWORDの文字数: {len(PASSWORD) if PASSWORD else 0}")

import firebase_admin
from firebase_admin import credentials, firestore

from selenium import webdriver
from selenium.webdriver.edge.service import Service
from webdriver_manager.microsoft import EdgeChromiumDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

cred = credentials.Certificate("rakutan-checker-firebase-adminsdk-fbsvc-6af7feefe1.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

service = Service(EdgeChromiumDriverManager().install())
driver = webdriver.Edge(service=service)

driver.get("https://hgu.manaba.jp")

time.sleep(2)

print(driver.current_url)

from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

wait = WebDriverWait(driver, 20)

username = wait.until(
    EC.visibility_of_element_located((By.NAME, "username"))
)
password = wait.until(
    EC.visibility_of_element_located((By.NAME, "password"))
)
login_button = wait.until(
    EC.element_to_be_clickable((By.CSS_SELECTOR, "button[type='submit']"))
)

username.send_keys(USERNAME)
password.send_keys(PASSWORD)
login_button.click()

time.sleep(5)

driver.get("https://hgu.manaba.jp/ct/home_library_query")

time.sleep(3)


rows = driver.find_elements(By.CSS_SELECTOR, "table.stdlist tbody tr")
print("取得した行数:", len(rows))

subject_ref = db.collection("subjects")

manaba_tasks = set()
for row in rows[1:]:
    cols = row.find_elements(By.TAG_NAME, "td")

    if len(cols) >= 5:
        key = (cols[2].text, cols[1].text)
        manaba_tasks.add(key)
        
        print({
            "type": cols[0].text,
            "title": cols[1].text,
            "course": cols[2].text,
            "deadline": cols[4].text,
        })

        existing = (
            subject_ref
            .where("name", "==", cols[2].text)
            .where("task", "==", cols[1].text)
            .get()
        )

        data = {
            "name": cols[2].text,
            "teacher": "",
            "credit": "",
            "attendance": "",
            "test": "",
            "report": "",
            "memo": "",
            "risk": "普通",
            "task": cols[1].text,
            "deadline": cols[4].text
        }

        if existing:
            existing[0].reference.update(data)
            print("更新:", cols[1].text)
        else:
            subject_ref.add(data)
            print("追加:", cols[1].text)

print("同期完了！")

docs = subject_ref.stream()

for doc in docs:
    data = doc.to_dict()

    key = (data.get("name"), data.get("task"))

    if key not in manaba_tasks:
        print("削除:", data.get("task"))
        doc.reference.delete()
driver.quit()