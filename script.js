let chart;

function calculate() {

    let name = document.getElementById("name").value;

    let marks = [
        Number(document.getElementById("m1").value),
        Number(document.getElementById("m2").value),
        Number(document.getElementById("m3").value),
        Number(document.getElementById("m4").value),
        Number(document.getElementById("m5").value)
    ];

    fetch("/calculate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: name, marks: marks })
    })
    .then(res => res.json())
    .then(data => {

        let resultBox = document.getElementById("result");
        resultBox.style.display = "block";

        resultBox.innerHTML = `
            👤 Name: ${data.name} <br>
            📊 Total: ${data.total} <br>
            📈 Average: ${data.average.toFixed(2)} <br>
            🏆 Grade: ${data.grade} <br>
            ✅ Status: ${data.status}
        `;

        let ctx = document.getElementById("chart");

        if (chart) {
            chart.destroy();
        }

        chart = new Chart(ctx, {
            type: "bar",
            data: {
                labels: ["Sub1", "Sub2", "Sub3", "Sub4", "Sub5"],
                datasets: [{
                    label: "Marks",
                    data: data.marks
                }]
            }
        });
    });
}