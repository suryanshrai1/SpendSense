let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

        const form = document.getElementById("transaction-form");
        const list = document.getElementById("transaction-list");
        const balanceEl = document.getElementById("balance");
        const chartEl = document.getElementById("expense-chart").getContext("2d");

        const toggle = document.getElementById("dark-toggle");
        const circle = document.getElementById("toggle-circle");
        const html = document.documentElement;

        let expenseChart;

        function updateLocalStorage() {
            localStorage.setItem("transactions", JSON.stringify(transactions));
        }

        function updateBalance() {
            let total = 0;
            transactions.forEach(tx => {
                total += tx.category === "Income" ? parseFloat(tx.amount) : -parseFloat(tx.amount);
            });
            balanceEl.textContent = total.toFixed(2);
        }

        function renderTransactions() {
            list.innerHTML = "";
            transactions.slice().reverse().forEach((tx, index) => {
                const li = document.createElement("li");
                li.className = "flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-3 border rounded";
                const amountColor = tx.category === "Income" ? "text-green-500" : "text-red-500";
                li.innerHTML = `
                    <div>
                        <span class="font-semibold">${tx.desc}</span> - 
                        <span class="${amountColor}">₹${parseFloat(tx.amount).toFixed(2)}</span>
                        <span class="text-sm text-gray-500">(${tx.category})</span>
                    </div>
                    <div class="space-x-2">
                        <button onclick="editTransaction(${index})" class="text-yellow-500">Edit</button>
                        <button onclick="deleteTransaction(${index})" class="text-red-500">Delete</button>
                    </div>
                `;
                list.appendChild(li);
            });

            updateBalance();
            updateChart();
        }

        function addTransaction(e) {
            e.preventDefault();
            const desc = document.getElementById("desc").value.trim();
            const amount = parseFloat(document.getElementById("amount").value);
            const category = document.getElementById("category").value;

            if (!desc || isNaN(amount) || !category) return;

            transactions.push({ desc, amount, category });
            updateLocalStorage();
            renderTransactions();
            form.reset();
        }

        function deleteTransaction(index) {
            transactions.splice(index, 1);
            updateLocalStorage();
            renderTransactions();
        }

        function editTransaction(index) {
            const tx = transactions[index];
            document.getElementById("desc").value = tx.desc;
            document.getElementById("amount").value = tx.amount;
            document.getElementById("category").value = tx.category;
            transactions.splice(index, 1);
            updateLocalStorage();
            renderTransactions();
        }

        function updateChart() {
            const categories = {};
            transactions.forEach(tx => {
                if (tx.category !== "Income") {
                    categories[tx.category] = (categories[tx.category] || 0) + parseFloat(tx.amount);
                }
            });

            const labels = Object.keys(categories);
            const data = Object.values(categories);

            if (expenseChart) expenseChart.destroy();

            expenseChart = new Chart(chartEl, {
                type: "pie",
                data: {
                    labels,
                    datasets: [{
                        data,
                        backgroundColor: ["#f87171", "#60a5fa", "#34d399", "#fbbf24", "#a78bfa"]
                    }]
                }
            });
        }

        // Theme toggle logic
        window.addEventListener("DOMContentLoaded", () => {
            const savedTheme = localStorage.getItem("theme");

            if (savedTheme === "dark") {
                html.classList.add("dark");
                toggle.checked = true;
                circle.classList.add("translate-x-6");
            } else {
                toggle.checked = false;
                circle.classList.remove("translate-x-6");
            }

            renderTransactions();
        });

        toggle.addEventListener("change", () => {
            if (toggle.checked) {
                html.classList.add("dark");
                localStorage.setItem("theme", "dark");
                circle.classList.add("translate-x-6");
            } else {
                html.classList.remove("dark");
                localStorage.setItem("theme", "light");
                circle.classList.remove("translate-x-6");
            }
        });

        form.addEventListener("submit", addTransaction);