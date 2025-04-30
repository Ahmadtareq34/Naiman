// Add a submit event listener to the signup form
document.getElementById('signup-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  // Retrieve input values from the form and trim any excess whitespace
  const firstName = document.getElementById('first-name').value.trim();
  const lastName = document.getElementById('last-name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const errorTab = document.getElementById('error-tab');

  // Reset and hide any previous error messages
  errorTab.innerHTML = '';
  errorTab.classList.add('hidden');

  // Define regular expressions for email and password validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@\-!])[A-Za-z\d@\-!]{8,}$/;
  // Password must have:
  // - At least 8 characters
  // - One uppercase letter
  // - One lowercase letter
  // - One number
  // - One special character (@, -, !)

  // Validate email format
  if (!emailRegex.test(email)) {
    errorTab.innerHTML = 'Invalid email format.';
    errorTab.classList.remove('hidden');
    return;
  }

  // Validate password format
  if (!passwordRegex.test(password)) {
    errorTab.innerHTML = 'Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character (@, -, !).';
    errorTab.classList.remove('hidden');
    return;
  }

  try {
    // Send a POST request to the signup endpoint
    const response = await fetch('/auth/signup', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ first_name: firstName, last_name: lastName, email, password }),
      credentials: 'include', 
    });

    const result = await response.json();

    if (result.success) {
      // If signup is successful, redirect to the URL provided in the response
      window.location.href = result.redirect;
    } else {
      // If signup fails, display the error messages returned by the server
      errorTab.innerHTML = result.message.join('<br>');
      errorTab.classList.remove('hidden');
    }
  } catch (err) {
    // Handle unexpected errors, such as network issues or server errors
    console.error('Error signing up:', err);
    errorTab.innerHTML = 'Unexpected error occurred. Please try again later.';
    errorTab.classList.remove('hidden');
  }
});
