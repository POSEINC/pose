console.log('Shopify try-on widget script started');

(function() {
  console.log('Shopify try-on widget script started');

  // Function to determine if we're on a product page
  function isProductPage() {
    return !!document.querySelector('.product-single__title, .product__title, h1.title');
  }

  // Function to store job information
  function storeJobInformation(jobId, productImage, productTitle, productUrl) {
    const jobInfo = {
      jobId: jobId,
      productImage: productImage,
      productTitle: productTitle,
      productUrl: productUrl,
      status: 'processing',
      timestamp: Date.now(),
      notified: false
    };
    localStorage.setItem('currentTryOnJob', JSON.stringify(jobInfo));
    console.log('Job information stored:', jobInfo);
  }

  // Function to get stored job information
  function getStoredJobInformation() {
    const jobInfo = localStorage.getItem('currentTryOnJob');
    return jobInfo ? JSON.parse(jobInfo) : null;
  }

  // Function to update stored job status
  function updateStoredJobStatus(status, output = null) {
    const jobInfo = getStoredJobInformation();
    if (jobInfo) {
      jobInfo.status = status;
      if (output) {
        jobInfo.output = output;
      }
      localStorage.setItem('currentTryOnJob', JSON.stringify(jobInfo));
    }
  }

  // Function to check job status
  async function checkJobStatus(jobId) {
    try {
      const response = await fetch(`https://shopify-virtual-tryon-app.vercel.app/api/try-on?jobId=${jobId}`);
      
      if (!response.ok) {
        throw new Error(`Status check failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log(`Status check for job ${jobId}:`, data);

      if (data.status === 'completed') {
        console.log('Job completed, updating status and showing notification');
        updateStoredJobStatus('completed', data.output);
        updateStatusIndicator('completed');
        showNotification('Look how great you look!', data.output);
      } else if (data.status === 'failed') {
        console.log('Job failed, updating status and showing notification');
        updateStoredJobStatus('failed');
        updateStatusIndicator('none');
        showNotification('Virtual try-on processing failed. Please try again.');
      }
    } catch (error) {
      console.error('Error checking job status:', error);
      updateStatusIndicator('none');
    }
  }

  // Function to show a notification
  function showNotification(message, output = null) {
    console.log('Showing notification:', message, 'Output:', output);
    
    // Remove any existing notification
    const existingNotification = document.getElementById('try-on-notification');
    if (existingNotification) {
      existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.id = 'try-on-notification';
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = '#333';
    notification.style.color = 'white';
    notification.style.padding = '15px';
    notification.style.borderRadius = '5px';
    notification.style.zIndex = '9999';
    notification.style.maxWidth = '300px';
    notification.style.textAlign = 'center'; // Center all content

    // Add message to notification
    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    messageElement.style.margin = '0 0 10px 0';
    notification.appendChild(messageElement);

    // If we have output, add the image and buttons to the notification
    if (output && typeof output === 'string' && output.startsWith('http')) {
      const imageContainer = document.createElement('div');
      imageContainer.style.position = 'relative';
      imageContainer.style.width = '100%';
      imageContainer.style.marginBottom = '10px';

      const image = document.createElement('img');
      image.src = output;
      image.alt = 'Try-on result';
      image.style.width = '100%';
      image.style.height = 'auto';
      image.style.borderRadius = '3px';
      image.style.cursor = 'pointer';

      // Add expand icon
      const expandIcon = document.createElement('div');
      expandIcon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 3 21 3 21 9"></polyline>
          <polyline points="9 21 3 21 3 15"></polyline>
        </svg>
      `;
      expandIcon.style.position = 'absolute';
      expandIcon.style.top = '5px';
      expandIcon.style.right = '5px';
      expandIcon.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      expandIcon.style.borderRadius = '50%';
      expandIcon.style.padding = '5px';
      expandIcon.style.cursor = 'pointer';

      image.addEventListener('click', () => createLightbox(output));
      expandIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        createLightbox(output);
      });

      imageContainer.appendChild(image);
      imageContainer.appendChild(expandIcon);
      notification.appendChild(imageContainer);

      // Create button container
      const buttonContainer = document.createElement('div');
      buttonContainer.style.display = 'flex';
      buttonContainer.style.justifyContent = 'center';
      buttonContainer.style.marginTop = '10px';

      // Create "Save image" button
      const saveButton = document.createElement('button');
      saveButton.textContent = 'Save image';
      saveButton.style.marginRight = '10px';
      saveButton.style.padding = '5px 10px';
      saveButton.style.backgroundColor = '#4CAF50';
      saveButton.style.color = 'white';
      saveButton.style.border = 'none';
      saveButton.style.borderRadius = '3px';
      saveButton.style.cursor = 'pointer';
      saveButton.onclick = () => {
        saveImage(output);
      };

      // Create "View product page" button
      const viewProductButton = document.createElement('button');
      viewProductButton.textContent = 'View product page';
      viewProductButton.style.padding = '5px 10px';
      viewProductButton.style.backgroundColor = '#008CBA';
      viewProductButton.style.color = 'white';
      viewProductButton.style.border = 'none';
      viewProductButton.style.borderRadius = '3px';
      viewProductButton.style.cursor = 'pointer';
      viewProductButton.onclick = () => {
        const jobInfo = getStoredJobInformation();
        if (jobInfo && jobInfo.productUrl) {
          window.location.href = jobInfo.productUrl;
        } else {
          console.error('Product URL not found');
        }
      };

      // Add buttons to the container
      buttonContainer.appendChild(saveButton);
      buttonContainer.appendChild(viewProductButton);

      // Add button container to the notification
      notification.appendChild(buttonContainer);
    }

    // Add close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'X';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '5px';
    closeButton.style.right = '5px';
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.color = 'white';
    closeButton.style.cursor = 'pointer';
    closeButton.onclick = () => {
      notification.remove();
      localStorage.setItem('notificationClosed', 'true');
      updateStatusIndicator('none');
    };
    notification.appendChild(closeButton);

    // Add notification to page
    document.body.appendChild(notification);

    console.log('Notification added to page');
  }

  // Global status checker (runs on all pages)
  function startGlobalStatusChecker() {
    console.log('Starting global status checker');
    
    // Check immediately on page load
    const jobInfo = getStoredJobInformation();
    const notificationClosed = localStorage.getItem('notificationClosed') === 'true';
    
    if (jobInfo && jobInfo.status === 'processing') {
      updateStatusIndicator('processing');
    } else if (jobInfo && jobInfo.status === 'completed' && !notificationClosed && !document.getElementById('try-on-notification')) {
      showNotification('Look how great you look!', jobInfo.output);
    }

    setInterval(() => {
      const jobInfo = getStoredJobInformation();
      const notificationClosed = localStorage.getItem('notificationClosed') === 'true';
      console.log('Checking stored job information:', jobInfo);
      if (jobInfo && jobInfo.status === 'processing') {
        console.log('Found processing job, checking status');
        updateStatusIndicator('processing');
        checkJobStatus(jobInfo.jobId);
      } else if (jobInfo && jobInfo.status === 'completed' && !notificationClosed && !document.getElementById('try-on-notification')) {
        console.log('Found completed job, showing notification');
        updateStatusIndicator('completed');
        showNotification('Look how great you look!', jobInfo.output);
      } else {
        updateStatusIndicator('none');
      }
    }, 5000); // Check every 5 seconds
  }

  // Move createLightbox function here, outside of any other function
  function createLightbox(imageSrc) {
    const lightbox = document.createElement('div');
    lightbox.style.position = 'fixed';
    lightbox.style.top = '0';
    lightbox.style.left = '0';
    lightbox.style.width = '100%';
    lightbox.style.height = '100%';
    lightbox.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    lightbox.style.display = 'flex';
    lightbox.style.alignItems = 'center';
    lightbox.style.justifyContent = 'center';
    lightbox.style.zIndex = '9999';

    const img = document.createElement('img');
    img.src = imageSrc;
    img.style.maxWidth = '90%';
    img.style.maxHeight = '90%';
    img.style.objectFit = 'contain';

    lightbox.appendChild(img);

    lightbox.addEventListener('click', () => {
      document.body.removeChild(lightbox);
    });

    document.body.appendChild(lightbox);
  }

  // Function to save image
  function saveImage(imageSrc) {
    fetch(imageSrc)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'virtual-try-on.jpg';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      })
      .catch(error => console.error('Error downloading image:', error));
  }

  // Add these functions outside of the isProductPage() check, so they're available globally

  function createStatusIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'try-on-status-indicator';
    indicator.style.position = 'fixed';
    indicator.style.bottom = '20px';
    indicator.style.right = '20px';
    indicator.style.backgroundColor = '#333';
    indicator.style.color = 'white';
    indicator.style.padding = '10px';
    indicator.style.borderRadius = '5px';
    indicator.style.zIndex = '9998';
    indicator.style.display = 'none';
    
    const statusText = document.createElement('span');
    statusText.textContent = 'Try-on in progress ';
    indicator.appendChild(statusText);
    
    const loadingDots = document.createElement('span');
    loadingDots.id = 'loading-dots';
    loadingDots.textContent = '...';
    indicator.appendChild(loadingDots);
    
    document.body.appendChild(indicator);
    return indicator;
  }

  function updateStatusIndicator(status) {
    const indicator = document.getElementById('try-on-status-indicator') || createStatusIndicator();
    const loadingDots = document.getElementById('loading-dots');
    
    if (status === 'processing') {
      indicator.style.display = 'block';
      animateDots(loadingDots);
    } else {
      indicator.style.display = 'none';
      stopAnimateDots(loadingDots);
    }
  }

  function animateDots(element) {
    let dots = 0;
    element.textContent = '';
    element.dataset.interval = setInterval(() => {
      dots = (dots + 1) % 4;
      element.textContent = '.'.repeat(dots);
    }, 500);
  }

  function stopAnimateDots(element) {
    clearInterval(element.dataset.interval);
    element.textContent = '...';
  }

  // Start the global status checker on all pages
  startGlobalStatusChecker();

  // Only proceed with product-specific code if we're on a product page
  if (isProductPage()) {
    console.log('On product page, initializing try-on widget');

    // Move imagePreview declaration to the top
    const imagePreview = document.createElement('img');
    imagePreview.id = 'imagePreview';
    imagePreview.style.maxWidth = '100%';
    imagePreview.style.maxHeight = '200px';
    imagePreview.style.display = 'none'; // Hidden by default

    // Update these selectors to match your page structure
    const productTitleElement = document.querySelector('.product-single__title, .product__title, h1.title');
    let productImageElement = document.querySelector('.product__image, .product-single__image, .featured-image');

    if (!productImageElement) {
      // If we couldn't find the image with common class names, try to find any image within the product container
      const productContainer = document.querySelector('.product, .product-single, #product-container');
      if (productContainer) {
        productImageElement = productContainer.querySelector('img');
      }
    }

    let productTitle = '';
    if (productTitleElement) {
      // Get all text content, including nested elements
      productTitle = productTitleElement.textContent
        // Replace newlines and extra spaces with a single space
        .replace(/\s+/g, ' ')
        // Trim leading and trailing whitespace
        .trim()
        // Split by spaces and take the first two words (assuming "Red T-Shirt" is the correct title)
        .split(' ').slice(0, 2).join(' ');
    }

    // If we still don't have a title, use a default
    if (!productTitle) {
      productTitle = 'Product';
      console.warn('Could not find product title. Using default.');
    }

    console.log('Product Title:', productTitle);

    let productImage = '';

    // Try to find the product image gallery container
    const imageGallery = document.querySelector('.product__images, .product-single__photos, #ProductPhotos, .product-images');

    if (imageGallery) {
      // If we found a gallery, select the first image inside it
      const firstImage = imageGallery.querySelector('img');
      if (firstImage && firstImage.src) {
        productImage = firstImage.src;
      }
    }

    // Create the try-on button
    const tryItOnButton = document.createElement('button');
    tryItOnButton.textContent = 'Try it on';
    tryItOnButton.style.marginTop = '10px';
    tryItOnButton.style.padding = '10px 20px';
    tryItOnButton.style.backgroundColor = '#4CAF50';
    tryItOnButton.style.color = 'white';
    tryItOnButton.style.border = 'none';
    tryItOnButton.style.borderRadius = '5px';
    tryItOnButton.style.cursor = 'pointer';

    // Create file input for user photo
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';

    // Create upload box
    const uploadBox = document.createElement('div');
    uploadBox.style.border = '2px dashed #ccc';
    uploadBox.style.borderRadius = '5px';
    uploadBox.style.padding = '20px';
    uploadBox.style.textAlign = 'center';
    uploadBox.style.marginTop = '10px';
    uploadBox.style.cursor = 'pointer';
    uploadBox.textContent = 'Click or drag and drop to upload your photo';

    // Create result container
    const resultContainer = document.createElement('div');
    resultContainer.id = 'resultContainer';
    resultContainer.style.marginTop = '20px';

    // Handle file selection
    function handleFileSelect(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          imagePreview.src = e.target.result;
          imagePreview.style.display = 'block';
          uploadBox.textContent = 'Click to change photo';
        };
        reader.readAsDataURL(file);
      }
    }

    fileInput.addEventListener('change', handleFileSelect);
    uploadBox.addEventListener('click', () => fileInput.click());

    // Handle drag and drop
    uploadBox.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadBox.style.backgroundColor = '#f0f0f0';
    });

    uploadBox.addEventListener('dragleave', () => {
      uploadBox.style.backgroundColor = '';
    });

    uploadBox.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadBox.style.backgroundColor = '';
      const file = e.dataTransfer.files[0];
      if (file) {
        fileInput.files = e.dataTransfer.files;
        handleFileSelect({ target: fileInput });
      }
    });

    // Function to call Replicate API
    async function callReplicateAPI() {
      if (!fileInput.files[0]) {
        alert('Please upload a photo first.');
        return;
      }

      const formData = new FormData();
      formData.append('image', fileInput.files[0]);
      formData.append('productImage', productImage);
      formData.append('productTitle', productTitle);

      try {
        const response = await fetch('https://shopify-virtual-tryon-app.vercel.app/api/try-on', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('API response:', data);

        if (data.jobId) {
          storeJobInformation(data.jobId, productImage, productTitle, window.location.href);
          pollJobStatus(data.jobId);
        } else {
          throw new Error('No job ID received from the API');
        }
      } catch (error) {
        console.error('Error calling API:', error);
        alert('An error occurred while processing your request. Please try again.');
      }
    }

    // Add event listener to try-on button
    tryItOnButton.addEventListener('click', callReplicateAPI);

    // Function to poll job status
    function pollJobStatus(jobId) {
      displayInitialWaitingMessage();
      updateStatusIndicator('processing');

      let pollCount = 0;
      const maxPolls = 60; // 5 minutes maximum polling time

      const pollInterval = setInterval(async () => {
        pollCount++;
        updateWaitingMessage(pollCount);

        try {
          const response = await fetch(`https://shopify-virtual-tryon-app.vercel.app/api/try-on?jobId=${jobId}`);
          
          if (!response.ok) {
            throw new Error(`Polling request failed with status ${response.status}`);
          }

          const data = await response.json();
          console.log('Polling response:', data);

          if (data.status === 'completed') {
            clearInterval(pollInterval);
            console.log('Job completed successfully:', data.output);
            updateStoredJobStatus('completed', data.output);
            displayResult(data.output);
            updateStatusIndicator('completed');
          } else if (data.status === 'failed') {
            clearInterval(pollInterval);
            console.error('Processing failed:', data.error);
            updateStoredJobStatus('failed');
            displayResult(`Error: Processing failed - ${data.error}`);
            updateStatusIndicator('none');
          } else if (data.status === 'processing') {
            console.log('Still processing...');
            if (pollCount >= maxPolls) {
              clearInterval(pollInterval);
              console.error('Polling timeout reached');
              updateStoredJobStatus('timeout');
              displayResult('Error: Processing timeout');
              updateStatusIndicator('none');
            }
          } else {
            clearInterval(pollInterval);
            console.error('Unexpected status:', data.status);
            updateStoredJobStatus('error');
            displayResult('Error: Unexpected response from server');
            updateStatusIndicator('none');
          }
        } catch (error) {
          console.error('Error polling job status:', error);
          clearInterval(pollInterval);
          updateStoredJobStatus('error');
          displayResult(`Error: Unable to get processing status - ${error.message}`);
          updateStatusIndicator('none');
        }
      }, 5000);
    }

    // Append elements to the page
    const addToCartButton = document.querySelector('button[name="add"]');
    if (addToCartButton) {
      addToCartButton.parentNode.insertBefore(tryItOnButton, addToCartButton.nextSibling);
      addToCartButton.parentNode.insertBefore(uploadBox, tryItOnButton);
      addToCartButton.parentNode.insertBefore(imagePreview, uploadBox);
      addToCartButton.parentNode.insertBefore(resultContainer, imagePreview.nextSibling);
    } else {
      console.warn('Could not find Add to Cart button. Widget placement may not be optimal.');
      document.body.appendChild(tryItOnButton);
      document.body.appendChild(uploadBox);
      document.body.appendChild(imagePreview);
      document.body.appendChild(resultContainer);
    }

    // Check for existing job
    checkExistingJob();
  }

  console.log('Try-on widget script initialization complete');
})();