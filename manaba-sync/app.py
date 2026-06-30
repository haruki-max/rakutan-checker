from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route("/", methods=["POST"])
def sync():
    data = request.json

    uid = data.get("uid")
    manaba_id = data.get("manabaId")
    manaba_password = data.get("manabaPassword")

    print(uid)
    print(manaba_id)

    return jsonify({
        "success": True,
        "message": "Cloud Runに届きました"
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)