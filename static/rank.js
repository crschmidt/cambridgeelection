let db;

document.addEventListener("DOMContentLoaded", function() {
    // Fetch the database file and initialize the database
    fetch("votes.db").then(response => response.arrayBuffer()).then(data => {
        return initSqlJs().then(SQL => {
            db = new SQL.Database(new Uint8Array(data));
            createRankInputs();
            // Add the event listener here to ensure db is initialized
            document.getElementById("queryButton").addEventListener("click", () => queryDatabase(db));
        });
    });
});
function createRankInputs() {
    const rankInputsDiv = document.getElementById("rankInputs");
    for (let i = 1; i <= 15; i++) {
        const input = document.createElement("input");
        input.type = "text";
        input.id = `rank${i}`;
        input.placeholder = `Enter rank ${i}`;
        rankInputsDiv.appendChild(input);
    }
}

function queryDatabase() {
    // Clear previous results
    document.getElementById("results").innerHTML = "";

    // Build the query based on the filled inputs
    let query = "";
    // SELECT * FROM votes";
    let conditions = [];
    let values = [];

    for (let i = 1; i <= 15; i++) {
        const input = document.getElementById(`rank${i}`);
        if (input.value.trim() !== "") {
            conditions.push(`rank${i} = ?`);
            values.push(input.value);
        }
    }

    if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
    }

    query1 = "SELECT count(*) as c FROM votes " + query;
    var stmt = db.prepare(query1);
    stmt.bind(values);
    while (stmt.step()) {
        const row = stmt.getAsObject();
        displayCount(row);
    }
    stmt.free();

    query2 = "SELECT * FROM votes " + query + " ORDER BY RANDOM() LIMIT 25";
    stmt = db.prepare(query2);
    stmt.bind(values);
    while (stmt.step()) {
        const row = stmt.getAsObject();
        displayResult(row);
    }
    stmt.free();
    
}

function displayCount(row) {
    const resultsElement = document.getElementById("count");
    resultsElement.innerHTML='';
    const rowElement = document.createElement("div");
    rowElement.textContent = row['c'];
    resultsElement.appendChild(rowElement);
}
function displayResult(row) {
    const resultsElement = document.getElementById("results");
    const rowElement = document.createElement("div");
    rowElement.textContent = displayRanks(row);
    resultsElement.appendChild(rowElement);
}
function displayRanks(rankObj) {
    let keysWithValues = [];

    for (let i = 1; i <= 15; i++) {
        let key = `rank${i}`;
        if (rankObj[key] && rankObj[key].trim() !== "") {
            keysWithValues.push(rankObj[key]);
        }
    }

    return keysWithValues.join(", ");
}

