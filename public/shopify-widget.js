(function() {
  console.log('Shopify widget script started');

  // Create the "See Me In This" button
  const tryOnButton = document.createElement('button');
  tryOnButton.textContent = 'See Me In This';
  tryOnButton.style.marginBottom = '10px';
  tryOnButton.className = 'button button--full-width button--primary';
  tryOnButton.type = 'button'; // Ensure it's not a submit button

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
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 hidden'; // Hidden by default

  const modalContent = document.createElement('div');
  modalContent.className = 'bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl relative';

  const closeButton = document.createElement('button');
  closeButton.innerHTML = '&times;';
  closeButton.className = 'absolute top-2 right-2 text-2xl font-bold text-gray-600 hover:text-gray-900';
  closeButton.addEventListener('click', function() {
    modal.classList.add('hidden'); // Hide the modal
  });

  const productTitle = document.querySelector('.product__title').textContent;

  modalContent.innerHTML = `
    <h2 class="text-2xl font-bold mb-4">See how ${productTitle} looks on yourself</h2>
    <div class="flex">
      <div class="w-1/2 flex flex-col items-center">
        <div class="mb-4">
          <p class="text-center mb-2">Before</p>
          <img src="https://via.placeholder.com/150" alt="Before" class="w-full h-auto rounded-lg">
        </div>
        <div>
          <p class="text-center mb-2">After</p>
          <img src="https://via.placeholder.com/150" alt="After" class="w-full h-auto rounded-lg">
        </div>
      </div>
      <div class="w-1/2 flex flex-col items-center">
        <div id="uploadBox" class="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer mb-4">
          <p class="text-center text-gray-500">Click to upload or drag and drop an image here</p>
          <input type="file" id="photoUpload" accept="image/*" class="hidden">
        </div>
        <button id="submitPhoto" class="bg-blue-500 text-white py-2 px-4 rounded-lg">Try On This Item</button>
        <div id="tryOnResult" class="mt-4 w-full"></div>
      </div>
    </div>
  `;

  // Add outline box styles to the upload box
  const uploadBox = document.createElement('div');
  uploadBox.id = 'uploadBox';
  uploadBox.className = 'w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer mb-4';
  uploadBox.style.outline = '2px dashed #4CAF50'; // Add this line for the outline box

  modalContent.appendChild(closeButton);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  // Event listener for the "See Me In This" button
  tryOnButton.addEventListener('click', function(event) {
    event.preventDefault();
    event.stopPropagation();
    modal.classList.remove('hidden'); // Show the modal
  });

  // Close the modal when clicking outside of it
  modal.addEventListener('click', function(event) {
    if (event.target === modal) {
      modal.classList.add('hidden'); // Hide the modal
    }
  });

  // Handle drag and drop for the upload box
  const photoUpload = document.getElementById('photoUpload');

  uploadBox.addEventListener('click', () => photoUpload.click());

  uploadBox.addEventListener('dragover', (event) => {
    event.preventDefault();
    uploadBox.classList.add('border-blue-500');
  });

  uploadBox.addEventListener('dragleave', () => {
    uploadBox.classList.remove('border-blue-500');
  });

  uploadBox.addEventListener('drop', (event) => {
    event.preventDefault();
    uploadBox.classList.remove('border-blue-500');
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      photoUpload.files = files;
      handleFileUpload(files[0]);
    }
  });

  photoUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  });

  function handleFileUpload(file) {
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
    reader.readAsDataURL(file);
  }

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
