// Add a submit event listener to the login form
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();

    // Retrieve the input values for email and password
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const errorTab = document.getElementById('error-tab');

  errorTab.innerHTML = '';
  errorTab.classList.add('hidden');

  try {
        // Send a POST request to the login endpoint
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });

    const result = await response.json();

    // If the login is successful, redirect to the URL provided in the response
    if (result.success) {
      window.location.href = result.redirect;
    } else {
      // If the login fails, display the error messages
      errorTab.innerHTML = result.message.join('<br>');
      errorTab.classList.remove('hidden');
    }
  } catch (err) {
    // Handle unexpected errors, such as network issues
    console.error('Error logging in:', err);
    errorTab.innerHTML = 'Unexpected error occurred. Please try again later.';
    errorTab.classList.remove('hidden');
  }
});
