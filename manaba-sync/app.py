import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from firebase_admin import auth
from sync import run_sync

app = Flask(__name__)
CORS(app)


@app.route("/", methods=["POST"])
def sync():
    try:
        # Firebase IDトークンを取得
        authorization = request.headers.get("Authorization")

        if not authorization or not authorization.startswith("Bearer "):
            return jsonify({
                "success": False,
                "message": "ログイン認証が必要です"
            }), 401

        id_token = authorization.split("Bearer ")[1]

        # Firebaseでトークンが本物か検証
        decoded_token = auth.verify_id_token(id_token)

        # UIDはブラウザから受け取らず、検証済みトークンから取得
        uid = decoded_token["uid"]

        data = request.get_json()

        manaba_id = data.get("manabaId")
        manaba_password = data.get("manabaPassword")

        if not manaba_id or not manaba_password:
            return jsonify({
                "success": False,
                "message": "ManabaのIDまたはパスワードがありません"
            }), 400

        result = run_sync(
            uid,
            manaba_id,
            manaba_password
        )

        return jsonify(result)

    except Exception as e:
        print("同期エラー:", str(e))

        return jsonify({
            "success": False,
            "message": "同期中にエラーが発生しました"
        }), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port)