document.addEventListener("DOMContentLoaded", function () {
  const reviewBox = document.getElementById("review-box");
  const rating = document.getElementById("rating");
  const submitReviewButton = document.getElementById("submit-review");

  // Submit review functionality
  submitReviewButton.addEventListener("click", function () {
    const reviewText = reviewBox.value.trim();
    const reviewRating = rating.value;

    if (!reviewText) {
      alert("Please write a review before submitting.");
      return;
    }

    alert(`Thank you for your review! You rated us ${reviewRating} stars.`);
    reviewBox.value = "";
    rating.value = "5";
  });
});
