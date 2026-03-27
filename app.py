from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/calculate", methods=["POST"])
def calculate():
    data = request.get_json()

    name = data.get("name")
    marks = data.get("marks")

    # Remove empty values
    marks = [m for m in marks if m is not None]

    total = sum(marks)
    average = total / len(marks) if len(marks) > 0 else 0

    # Grade logic
    if average >= 90:
        grade = "A"
    elif average >= 75:
        grade = "B"
    elif average >= 50:
        grade = "C"
    else:
        grade = "Fail"

    status = "Pass" if average >= 50 else "Fail"

    return jsonify({
        "name": name,
        "total": total,
        "average": average,
        "grade": grade,
        "status": status,
        "marks": marks
    })

if __name__ == "__main__":
    app.run(debug=True)