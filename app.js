const API_BASE_URL = "https://8yvggmh0i0.execute-api.eu-west-2.amazonaws.com";

// Handle Transport Submission Workflow
document.getElementById('transportForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
        staff_name: document.getElementById('t_name').value,
        staff_email: document.getElementById('t_email').value,
        log_date: document.getElementById('t_date').value,
        amount: document.getElementById('t_amount').value
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/log-transport`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        alert(data.message || "Log submitted!");
        document.getElementById('transportForm').reset();
    } catch (err) {
        alert("Error connecting to API");
    }
});

// Handle Loan Submission Workflow
document.getElementById('loanForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
        staff_name: document.getElementById('l_name').value,
        staff_email: document.getElementById('l_email').value,
        request_type: document.getElementById('l_type').value,
        amount: document.getElementById('l_amount').value
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/request-loan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        alert(data.message || "Request sent successfully!");
        document.getElementById('loanForm').reset();
    } catch (err) {
        alert("Error connecting to API");
    }
});