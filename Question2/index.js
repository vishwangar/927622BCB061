const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 9876;

// Map numberid to test server API
const apiMap = {
  p: 'http://20.244.56.144/evaluation-service/primes',
  f: 'http://20.244.56.144/evaluation-service/fibo',
  e: 'http://20.244.56.144/evaluation-service/even',
  r: 'http://20.244.56.144/evaluation-service/rand'
};

// Your Bearer token
const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ4MDY4MTg1LCJpYXQiOjE3NDgwNjc4ODUsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6ImMyYTYzYTE2LTcxNmUtNDNiMS1hMDY0LWQ2ZDc2MDVhYzU2YiIsInN1YiI6InZpc2h3YW5nYXJyYXZpa3VtYXJAZ21haWwuY29tIn0sImVtYWlsIjoidmlzaHdhbmdhcnJhdmlrdW1hckBnbWFpbC5jb20iLCJuYW1lIjoidmlzaHdhbmdhciByIiwicm9sbE5vIjoiOTI3NjIyYmNiMDYxIiwiYWNjZXNzQ29kZSI6IndoZVFVeSIsImNsaWVudElEIjoiYzJhNjNhMTYtNzE2ZS00M2IxLWEwNjQtZDZkNzYwNWFjNTZiIiwiY2xpZW50U2VjcmV0IjoiUUZxR1NyellHdkJmcHlmYSJ9.GcJDSu3Z18qx4VRwE2VZ1JoY1Y_nXz5XLp_bSIfh3wg`;

// Memory window to store latest 10 unique numbers
let windowCurrState = [];

app.get('/numbers/:numberid', async (req, res) => {
  const numberid = req.params.numberid;

  if (!apiMap[numberid]) {
    return res.status(400).json({ error: 'Invalid number type' });
  }

  let incomingNumbers = [];

  try {
    const response = await axios.get(apiMap[numberid], {
      headers: {
        Authorization: `Bearer ${token}`
      },
      timeout: 500
    });

    incomingNumbers = response.data.numbers || [];

  } catch (err) {
    console.error('Fetch error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch numbers in time or API error' });
  }

  // Save previous state
  const windowPrevState = [...windowCurrState];

  // Append new unique numbers
  incomingNumbers.forEach(num => {
    if (!windowCurrState.includes(num)) {
      windowCurrState.push(num);
    }
  });

  // Keep only the last 10 numbers
  if (windowCurrState.length > 10) {
    windowCurrState = windowCurrState.slice(windowCurrState.length - 10);
  }

  // Calculate average
  const avg =
    windowCurrState.reduce((sum, n) => sum + n, 0) / windowCurrState.length || 0;

  // Final response
  res.json({
    windowPrevState,
    windowCurrState,
    numbers: incomingNumbers,
    avg: parseFloat(avg.toFixed(2))
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
