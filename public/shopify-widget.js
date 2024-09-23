(function() {
  console.log('Shopify widget script started');

  // Create the "See Me In This" button
  const tryOnButton = document.createElement('button');
  tryOnButton.textContent = 'See Me In This';
  tryOnButton.style.marginBottom = '10px';
  tryOnButton.className = 'button button--full-width button--primary';

  // Find the "Add to Cart" button
  const addToCartButton = document.querySelector('button[name="add"]');
  if (addToCartButton && addToCartButton.parentNode) {
    addToCartButton.parentNode.insertBefore(tryOnButton, addToCartButton);
    console.log('Try-on button inserted into DOM');
  } else {
    console.error('Could not find the Add to Cart button');
    return;
  }

  // Create a modal for the photo upload and try-on feature
  const modal = document.createElement('div');
  modal.style.display = 'none';
  modal.style.position = 'fixed';
  modal.style.zIndex = '1000';
  modal.style.left = '0';
  modal.style.top = '0';
  modal.style.width = '100%';
  modal.style.height = '100%';
  modal.style.backgroundColor = 'rgba(0,0,0,0.5)';

  const modalContent = document.createElement('div');
  modalContent.style.backgroundColor = '#fefefe';
  modalContent.style.margin = '15% auto';
  modalContent.style.padding = '20px';
  modalContent.style.border = '1px solid #888';
  modalContent.style.width = '80%';
  modalContent.style.maxWidth = '500px';
  modalContent.style.borderRadius = '10px';

  const productTitle = document.querySelector('.product__title').textContent;

  modalContent.innerHTML = `
    <h2>See how ${productTitle} looks on yourself</h2>
    <input type="file" id="photoUpload" accept="image/*" style="margin-top: 10px;">
    <button id="submitPhoto" style="margin-top: 10px;">Try On This Item</button>
    <div id="tryOnResult" style="margin-top: 20px;"></div>
  `;

  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  // Event listener for the "See Me In This" button
  tryOnButton.addEventListener('click', function() {
    modal.style.display = 'block';
  });

  // Close the modal when clicking outside of it
  modal.addEventListener('click', function(event) {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });

  // Handle photo upload and try-on
  document.getElementById('submitPhoto').addEventListener('click', async function() {
    const fileInput = document.getElementById('photoUpload');
    if (fileInput.files && fileInput.files[0]) {
      const reader = new FileReader();
      reader.onload = async function(e) {
        const humanImg = e.target.result;
        const garmImg = document.querySelector('.product__media img').src;
        const garmentDes = document.querySelector('.product__title').textContent;

        document.getElementById('tryOnResult').innerHTML = 'Processing...';

        console.log('Sending data to API:', { garmImg, humanImg, garmentDes });

        try {
          console.log('Attempting to fetch from API...');
          const response = await fetch('https://shopify-virtual-tryon-app.vercel.app/api/try-on', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ garmImg, humanImg, garmentDes }),
          });

          console.log('Fetch response received:', response);

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
          }

          const data = await response.json();
          if (data.status === 'processing') {
            pollForResult(data.jobId);
          } else {
            displayResult(data.output);
          }
        } catch (error) {
          console.error('Detailed error:', error);
          document.getElementById('tryOnResult').innerHTML = `An error occurred while processing the image: ${error.message}`;
          if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
            console.log('This might be a CORS issue or the server is not responding');
          }
        }
      };
      reader.readAsDataURL(fileInput.files[0]);
    } else {
      alert('Please select a photo first.');
    }
  });

  function pollForResult(jobId) {
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max (60 * 5 seconds)
    
    // Create progress bar elements
    const progressContainer = document.createElement('div');
    progressContainer.style.width = '100%';
    progressContainer.style.backgroundColor = '#f0f0f0';
    progressContainer.style.borderRadius = '5px';
    progressContainer.style.margin = '10px 0';

    const progressBar = document.createElement('div');
    progressBar.style.width = '0%';
    progressBar.style.height = '20px';
    progressBar.style.backgroundColor = '#4CAF50';
    progressBar.style.borderRadius = '5px';
    progressBar.style.transition = 'width 0.5s ease-in-out';

    progressContainer.appendChild(progressBar);

    const progressText = document.createElement('div');
    progressText.style.textAlign = 'center';
    progressText.style.marginTop = '5px';

    const resultElement = document.getElementById('tryOnResult');
    resultElement.innerHTML = '';
    resultElement.appendChild(progressContainer);
    resultElement.appendChild(progressText);

    const pollInterval = setInterval(async () => {
      try {
        console.log(`Polling for job ${jobId}, attempt ${attempts + 1}`);
        const response = await fetch(`https://shopify-virtual-tryon-app.vercel.app/api/try-on?jobId=${jobId}`);
        const data = await response.json();
        console.log(`Poll response for job ${jobId}:`, data);
        
        if (data.status === 'completed') {
          clearInterval(pollInterval);
          displayResult(data.output);
        } else if (data.status === 'failed') {
          clearInterval(pollInterval);
          resultElement.innerHTML = `An error occurred while processing the image: ${data.error}`;
        } else if (data.status === 'processing') {
          const progress = ((attempts + 1) / maxAttempts) * 100;
          progressBar.style.width = `${progress}%`;
          progressText.textContent = `Processing: ${Math.round(progress)}%`;
        }
        
        attempts++;
        if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
          resultElement.innerHTML = 'Processing timed out. Please try again.';
        }
      } catch (error) {
        console.error('Error polling for result:', error);
        resultElement.innerHTML = `Error checking status: ${error.message}`;
      }
    }, 5000); // Poll every 5 seconds
  }

  function displayResult(outputUrl) {
    console.log('Displaying result:', outputUrl);
    document.getElementById('tryOnResult').innerHTML = `
      <p>Here's how you might look in this item:</p>
      <img src="${outputUrl}" style="max-width: 100%; height: auto;" onerror="this.onerror=null; this.src=''; this.alt='Error loading image';">
    `;
  }

  console.log('Try-on widget fully initialized');
})();
