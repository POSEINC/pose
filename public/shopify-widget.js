console.log('Shopify try-on widget script started');

(function() {
  console.log('Shopify try-on widget script started');

  // Function to determine if we're on a product page
  function isProductPage() {
    return !!document.querySelector('.product-single__title, .product__title, h1.title');
  }

  // Function to store job information
  function storeJobInformation(jobId, productImage, productTitle, productUrl, colorVariant) {
    const priceElement = document.querySelector('.price__regular .price-item--regular');
    const jobInfo = {
      jobId: jobId,
      productImage: productImage,
      productTitle: productTitle,
      productUrl: productUrl,
      colorVariant: colorVariant,
      price: priceElement ? priceElement.textContent.trim() : 'N/A',
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
    notification.style.textAlign = 'center';

    // Add message to notification
    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    messageElement.style.margin = '0 0 10px 0';
    notification.appendChild(messageElement);

    // If we have output, add the image and new elements to the notification
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

      // Update product summary
      const jobInfo = getStoredJobInformation();
      const productSummary = document.createElement('div');
      productSummary.style.marginBottom = '10px';
      productSummary.innerHTML = `
        <p style="margin: 0;">Price: ${jobInfo.price || 'N/A'}</p>
        <p style="margin: 0;">Color: ${jobInfo.colorVariant || 'N/A'}</p>
      `;
      notification.appendChild(productSummary);

      // Add size dropdown
      const sizeDropdown = document.createElement('select');
      sizeDropdown.style.marginBottom = '10px';
      sizeDropdown.style.width = '100%';
      sizeDropdown.style.padding = '5px';
      sizeDropdown.innerHTML = `
        <option value="">Select Size</option>
        <option value="S">Small</option>
        <option value="M">Medium</option>
        <option value="L">Large</option>
      `;
      notification.appendChild(sizeDropdown);

      // Create button container
      const buttonContainer = document.createElement('div');
      buttonContainer.style.display = 'flex';
      buttonContainer.style.justifyContent = 'space-between';
      buttonContainer.style.marginTop = '10px';

      // Create "Add to Cart" button
      const addToCartButton = document.createElement('button');
      addToCartButton.textContent = 'Add to Cart';
      addToCartButton.style.padding = '5px 10px';
      addToCartButton.style.backgroundColor = '#4CAF50';
      addToCartButton.style.color = 'white';
      addToCartButton.style.border = 'none';
      addToCartButton.style.borderRadius = '3px';
      addToCartButton.style.cursor = 'pointer';
      addToCartButton.style.flex = '2';
      addToCartButton.style.marginRight = '5px';
      addToCartButton.onclick = () => {
        // Add to cart functionality will be implemented later
        console.log('Add to cart clicked');
      };

      // Modify existing buttons
      const saveButton = document.createElement('button');
      saveButton.textContent = 'Save';
      saveButton.style.padding = '5px 10px';
      saveButton.style.backgroundColor = '#008CBA';
      saveButton.style.color = 'white';
      saveButton.style.border = 'none';
      saveButton.style.borderRadius = '3px';
      saveButton.style.cursor = 'pointer';
      saveButton.style.flex = '1';
      saveButton.style.marginRight = '5px';
      saveButton.onclick = () => {
        saveImage(output);
      };

      const viewProductButton = document.createElement('button');
      viewProductButton.textContent = 'View';
      viewProductButton.style.padding = '5px 10px';
      viewProductButton.style.backgroundColor = '#008CBA';
      viewProductButton.style.color = 'white';
      viewProductButton.style.border = 'none';
      viewProductButton.style.borderRadius = '3px';
      viewProductButton.style.cursor = 'pointer';
      viewProductButton.style.flex = '1';
      viewProductButton.onclick = () => {
        const jobInfo = getStoredJobInformation();
        if (jobInfo && jobInfo.productUrl) {
          window.location.href = jobInfo.productUrl;
        } else {
          console.error('Product URL not found');
        }
      };

      // Add buttons to the container
      buttonContainer.appendChild(addToCartButton);
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
      const customMessage = `Trying on ${jobInfo.productTitle} in ${jobInfo.colorVariant || 'selected color'}`;
      updateStatusIndicator('processing', customMessage);
    } else if (jobInfo && jobInfo.status === 'completed' && !notificationClosed && !document.getElementById('try-on-notification')) {
      showNotification('Look how great you look!', jobInfo.output);
    }

    setInterval(() => {
      const jobInfo = getStoredJobInformation();
      const notificationClosed = localStorage.getItem('notificationClosed') === 'true';
      console.log('Checking stored job information:', jobInfo);
      if (jobInfo && jobInfo.status === 'processing') {
        console.log('Found processing job, checking status');
        const customMessage = `Trying on ${jobInfo.productTitle} in ${jobInfo.colorVariant || 'selected color'}`;
        updateStatusIndicator('processing', customMessage);
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
    indicator.style.alignItems = 'center'; // Add this line
    
    const spinner = document.createElement('div');
    spinner.className = 'try-on-spinner';
    spinner.style.border = '2px solid #f3f3f3';
    spinner.style.borderTop = '2px solid #3498db';
    spinner.style.borderRadius = '50%';
    spinner.style.width = '16px';
    spinner.style.height = '16px';
    spinner.style.animation = 'spin 1s linear infinite';
    spinner.style.marginRight = '10px';
    spinner.style.display = 'none'; // Initially hidden
    
    const statusText = document.createElement('span');
    statusText.textContent = 'Try-on in progress...';
    
    indicator.appendChild(spinner);
    indicator.appendChild(statusText);
    
    // Add keyframe animation for the spinner
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(indicator);
    return indicator;
  }

  function updateStatusIndicator(status, customMessage = null) {
    const indicator = document.getElementById('try-on-status-indicator') || createStatusIndicator();
    const spinner = indicator.querySelector('.try-on-spinner');
    const statusText = indicator.querySelector('span');
    
    if (status === 'processing') {
      indicator.style.display = 'flex';
      spinner.style.display = 'block';
      statusText.textContent = customMessage || 'Try-on in progress...';
    } else {
      indicator.style.display = 'none';
      spinner.style.display = 'none';
    }
  }

  function getSelectedColorVariant() {
    const colorSelectors = [
      'select[name="Color"]',
      'input[name="Color"]:checked',
      '.swatch-element.color input:checked',
      '.color-swatch.active',
      '.color-swatch--selected'
    ];

    for (let selector of colorSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        if (element.tagName === 'SELECT') {
          return element.value;
        } else if (element.tagName === 'INPUT') {
          return element.value;
        } else {
          return element.getAttribute('data-value') || element.title;
        }
      }
    }

    return null; // No color variant found
  }

  // Add this new function
  function getSelectedVariantImageUrl() {
    const selectedColor = getSelectedColorVariant();
    if (!selectedColor) return null;

    const variantDataScript = document.querySelector('variant-radios script');
    
    if (variantDataScript) {
      try {
        const variantData = JSON.parse(variantDataScript.textContent);
        const selectedVariant = variantData.find(v => v.title.includes(selectedColor));
        if (selectedVariant && selectedVariant.featured_image) {
          return selectedVariant.featured_image.src;
        }
      } catch (e) {
        console.error('Error parsing variant data:', e);
      }
    }

    // If we couldn't find the variant image, return the current product image
    return productImage;
  }

  // Add this new function
  function getSelectedSizeVariant() {
    const sizeSelectors = [
      'select[name="Size"]',
      'input[name="Size"]:checked',
      '.swatch-element.size input:checked',
      '.single-option-selector__radio[name*="Size"]:checked',
      'select[name*="size"]',
      // Add more selectors as needed based on common Shopify themes
    ];

    for (let selector of sizeSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        return element.value;
      }
    }

    return null; // No size variant found
  }

  // Make both functions globally accessible for testing
  window.getSelectedColorVariant = getSelectedColorVariant;
  window.getSelectedVariantImageUrl = getSelectedVariantImageUrl;

  let variantObserver;
  let productTitle = ''; // Declare productTitle at this scope

  function setupVariantObserver() {
    // Get the section subtext element
    const sectionSubtext = document.querySelector('.try-on-widget-subtext');

    variantObserver = new MutationObserver(() => {
      const newColor = getSelectedColorVariant();
      const newSize = getSelectedSizeVariant();
      const newImageUrl = getSelectedVariantImageUrl();

      console.log('Selected Color:', newColor);
      console.log('Selected Size:', newSize);
      console.log('Updated product image:', newImageUrl);

      if (sectionSubtext) {
        let subtext = newColor
          ? `See how ${productTitle} in ${newColor} looks on you, no dressing room required.`
          : `See how ${productTitle} looks on you, no dressing room required.`;
        sectionSubtext.textContent = subtext;
        
        if (newImageUrl) {
          productImage = newImageUrl; // Update the productImage variable
        }
      }
    });

    const observeTargets = [
      document.querySelector('form[action="/cart/add"]'),
      document.querySelector('.product-single__variants'),
      document.querySelector('.product__variants'),
      document.querySelector('.product-form__variants')
    ].filter(Boolean); // Remove any null elements

    observeTargets.forEach(target => {
      if (target) {
        variantObserver.observe(target, { subtree: true, attributes: true, childList: true });
      }
    });

    // If no targets found, log a warning
    if (observeTargets.length === 0) {
      console.warn('Could not find product form or variant selectors to observe');
    }
  }

  // Add this new function
  function setUploadBoxState(isDisabled) {
    const uploadBox = document.querySelector('.try-on-widget-rectangle');
    const uploadButton = document.querySelector('.try-on-widget-button');
    
    if (uploadBox && uploadButton) {
      if (isDisabled) {
        uploadBox.classList.add('try-on-widget-upload-area-disabled');
        uploadButton.disabled = true;
      } else {
        uploadBox.classList.remove('try-on-widget-upload-area-disabled');
        uploadButton.disabled = false;
      }
    }
  }

  // Modify the displayInitialWaitingMessage function
  function displayInitialWaitingMessage() {
    const coloredRectangle = document.querySelector('.try-on-widget-rectangle');
    if (coloredRectangle) {
      coloredRectangle.innerHTML = `
        <div class="try-on-widget-spinner"></div>
        <p class="try-on-widget-message">Initializing try-on experience...</p>
        <p class="try-on-widget-submessage">This may take a few moments.</p>
      `;
    }
  }

  // Reset the upload photo button
  function resetUploadButton() {
    const uploadPhotoButton = document.querySelector('.try-on-widget button');
    if (uploadPhotoButton) {
      uploadPhotoButton.textContent = 'Upload a photo';
      uploadPhotoButton.disabled = false;
    }
  }

  // Modify the checkExistingJob function
  function checkExistingJob() {
    const jobInfo = getStoredJobInformation();
    if (jobInfo && jobInfo.status === 'processing') {
      console.log('Found existing job:', jobInfo.jobId);
      pollJobStatus(jobInfo.jobId);
      setUploadBoxState(true); // Disable upload box for existing job
    }
  }

  // Modify the pollJobStatus function
  function pollJobStatus(jobId) {
    console.log('Polling started for job:', jobId);
    let pollCount = 0;
    const maxPolls = 60; // 5 minutes maximum polling time

    const jobInfo = getStoredJobInformation();
    const customMessage = `Trying on ${jobInfo.productTitle} in ${jobInfo.colorVariant || 'selected color'}`;

    setTimeout(() => {
      const pollInterval = setInterval(async () => {
        pollCount++;
        console.log(`Polling attempt ${pollCount} for job ${jobId}`);

        updateStatusIndicator('processing', customMessage);

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
            showNotification('Look how great you look!', data.output);
            setUploadBoxState(false); // Enable the upload box
            resetUploadBox(); // Reset the upload box
          } else if (data.status === 'failed') {
            clearInterval(pollInterval);
            console.error('Processing failed:', data.error);
            updateStoredJobStatus('failed');
            showNotification('Virtual try-on processing failed. Please try again.');
            setUploadBoxState(false); // Enable the upload box
            resetUploadBox(); // Reset the upload box
          } else if (data.status === 'processing') {
            console.log('Still processing...');
            if (pollCount >= maxPolls) {
              clearInterval(pollInterval);
              console.error('Polling timeout reached');
              updateStoredJobStatus('timeout');
              showNotification('Error: Processing timeout. Please try again.');
              setUploadBoxState(false); // Enable the upload box
              resetUploadBox(); // Reset the upload box
            }
          } else {
            clearInterval(pollInterval);
            console.error('Unexpected status:', data.status);
            updateStoredJobStatus('error');
            showNotification('Error: Unexpected response from server. Please try again.');
            setUploadBoxState(false); // Enable the upload box
            resetUploadBox(); // Reset the upload box
          }
        } catch (error) {
          console.error('Error polling job status:', error);
          clearInterval(pollInterval);
          updateStoredJobStatus('error');
          showNotification(`Error: Unable to get processing status - ${error.message}`);
          setUploadBoxState(false); // Enable the upload box
          resetUploadBox(); // Reset the upload box
        }
      }, 5000);
    }, 3000);
  }

  // Add this function to reset the upload box
  function resetUploadBox() {
    const coloredRectangle = document.querySelector('.try-on-widget-rectangle');
    if (coloredRectangle) {
      coloredRectangle.innerHTML = `
        <p class="try-on-widget-subtext">See how ${productTitle} looks on you, no dressing room required.</p>
        <button class="try-on-widget-button">Upload a photo</button>
        <p class="try-on-widget-data-subtext">Your data is never shared or stored.</p>
      `;
      const uploadButton = coloredRectangle.querySelector('.try-on-widget-button');
      if (uploadButton) {
        uploadButton.addEventListener('click', (e) => {
          e.preventDefault();
          showQuickTips();
        });
      }
    }
  }

  // Define all styles in the style tag
  const style = document.createElement('style');
  style.textContent = `
    .try-on-widget-section {
      padding: 40px 0;
      margin: 40px 0;
      border-top: 1px solid #e8e8e8;
      border-bottom: 1px solid #e8e8e8;
      line-height: 1.25;
      text-align: center;
    }
    .try-on-widget-content-container {
      max-width: 600px;
      margin: 0 auto; 
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .try-on-widget-section-title {
      margin-top: 0;
      margin-bottom: 20px;
      position: relative;
      background-color: #ffffff;
      padding: 0 10px;
      z-index: 1;
    }
    .try-on-widget-upload-area {
      background-color: #f9f9f8;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 10px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      border: 1px solid #e0e0e0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 100%;
      max-width: 400px;
      height: 200px;
    }
    .try-on-widget-upload-button {
      width: 100%;
      max-width: 300px;
      height: 40px;
      padding: 0;
      margin: 20px 0 0 0;
      background-color: #000000;
      color: #ffffff;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
      font-size: 14px;
    }
    .try-on-widget-main-description {
      font-size: 14px;
      color: #333;
      margin: 0 0 10px 0;
      text-align: center;
      max-width: 300px;
    }
    .try-on-widget-privacy-notice {
      font-size: 10px;
      color: #666;
      margin: 5px 0 0 0;
      text-align: center;
    }
    .try-on-widget-powered-by {
      font-size: 10px;
      color: #666;
      margin: 2px 0 0 0;
      text-align: center;
    }
    .try-on-widget-processing-message {
      font-size: 16px;
      margin-bottom: 10px;
    }
    .try-on-widget-processing-submessage {
      font-size: 14px;
      color: #666;
    }
    .try-on-widget-upload-area-disabled {
      opacity: 0.5;
      pointer-events: none;
    }
    .try-on-widget-quick-tips-list {
      list-style-type: none;
      font-size: 10px;
      padding: 0;
      margin: 10px 0;
      text-align: center;
    }
  `;
  document.head.appendChild(style);

  // Simplified functions
  function showQuickTips() {
    const coloredRectangle = document.querySelector('.try-on-widget-rectangle');
    if (coloredRectangle) {
      coloredRectangle.innerHTML = `
        <h3>Quick pro tips</h3>
        <ul class="try-on-widget-quick-tips-list">
          <li><strong>Solo:</strong> be the only one in the photo.</li>
          <li><strong>Pose:</strong> stand naturally facing forward.</li>
          <li><strong>Full-body:</strong> use a head-to-toe photo.</li>
          <li><strong>Clothing:</strong> fitted items work better.</li>
        </ul>
        <button id="gotItButton" class="try-on-widget-button">Got it</button>
      `;
      document.getElementById('gotItButton').addEventListener('click', () => {
        photoUpload.click();
      });
    }
  }

  function showWaitingMessage(message = 'Processing your image...', submessage = 'This may take a few moments.') {
    const coloredRectangle = document.querySelector('.try-on-widget-rectangle');
    if (coloredRectangle) {
      coloredRectangle.innerHTML = `
        <div class="try-on-widget-spinner"></div>
        <p class="try-on-widget-processing-message">${message}</p>
        <p class="try-on-widget-processing-submessage">${submessage}</p>
      `;
    }
  }

  function displayResult(output) {
    const coloredRectangle = document.querySelector('.try-on-widget-rectangle');
    if (coloredRectangle) {
      if (typeof output === 'string' && output.startsWith('http')) {
        coloredRectangle.innerHTML = `
          <img src="${output}" alt="Try-on result" class="try-on-widget-result-image">
          <button id="tryAgainButton" class="try-on-widget-button">Try another photo</button>
        `;
        document.getElementById('tryAgainButton').addEventListener('click', () => {
          resetUploadBox();
          showQuickTips();
        });
      } else {
        coloredRectangle.innerHTML = `
          <p>${output}</p>
          <button id="tryAgainButton" class="try-on-widget-button">Try again</button>
        `;
        document.getElementById('tryAgainButton').addEventListener('click', () => {
          resetUploadBox();
          showQuickTips();
        });
      }
    }
  }

  // Only proceed with product-specific code if we're on a product page
  if (isProductPage()) {
   
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

    if (productTitleElement) {
      // Get all text content, including nested elements
      productTitle = productTitleElement.textContent
        // Replace newlines and extra spaces with a single space
        .replace(/\s+/g, ' ')
        // Trim leading and trailing whitespace
        .trim();
      
      // Remove any duplicate occurrences of the title
      const titleParts = productTitle.split(' ');
      const uniqueParts = [...new Set(titleParts)];
      productTitle = uniqueParts.join(' ');
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
        console.log('Selected first product image:', productImage);
      } else {
        console.error('No images found in the product gallery');
      }
    } else {
      // If we couldn't find a gallery, fall back to the previous method
      if (productImageElement && productImageElement.src) {
        productImage = productImageElement.src;
        console.log('Selected product image:', productImage);
      } else {
        console.error('Product image element not found. Please check the page structure and update the selector.');
      }
    }

    console.log('Product Image:', productImage);

    const colorVariant = getSelectedColorVariant();

    // Create the widget section
    const widgetSection = document.createElement('section');
    widgetSection.className = 'try-on-widget-section';

    // Create a container for the widget content
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'try-on-widget-content-container';

    // Section title
    const sectionTitle = document.createElement('h2');
    sectionTitle.className = 'try-on-widget-section-title';
    sectionTitle.textContent = 'See yourself wearing it';

    // Create the colored rectangle
    const coloredRectangle = document.createElement('div');
    coloredRectangle.className = 'try-on-widget-upload-area';

    // Modify the "Upload a photo" button creation and styling
    const uploadPhotoButton = document.createElement('button');
    uploadPhotoButton.textContent = 'Upload a photo';
    uploadPhotoButton.className = 'try-on-widget-upload-button';

    // Add subtext
    const sectionSubtext = document.createElement('p');
    sectionSubtext.className = 'try-on-widget-main-description';
    const initialColor = getSelectedColorVariant();
    sectionSubtext.textContent = initialColor
      ? `See how ${productTitle} in ${initialColor} looks on you, no dressing room required.`
      : `See how ${productTitle} looks on you, no dressing room required.`;

    // Create short subtext
    const dataSubtext = document.createElement('p');
    dataSubtext.className = 'try-on-widget-privacy-notice';
    dataSubtext.textContent = 'Your data is never shared or stored.';

    // Add "POWERED BY" text
    const poweredBy = document.createElement('p');
    poweredBy.className = 'try-on-widget-powered-by';
    poweredBy.innerHTML = 'POWERED BY <strong>FITTING ROOM®</strong>';

    // Append elements to the colored rectangle
    coloredRectangle.appendChild(sectionSubtext);
    coloredRectangle.appendChild(uploadPhotoButton);
    coloredRectangle.appendChild(dataSubtext);

    // Append elements to the widget container
    widgetContainer.appendChild(sectionTitle);
    widgetContainer.appendChild(coloredRectangle);
    widgetContainer.appendChild(poweredBy);

    // Append the container to the section
    widgetSection.appendChild(widgetContainer);

    // Insert the widget section after the product form
    const productFormElement = document.querySelector('.product-form');
    if (productFormElement && productFormElement.parentNode) {
      productFormElement.parentNode.insertBefore(widgetSection, productFormElement.nextSibling);
      console.log('Try-on widget section inserted into DOM');
    } else {
      console.error('Could not find the product form');
      return;
    }

    // Create hidden file input
    const photoUpload = document.createElement('input');
    photoUpload.type = 'file';
    photoUpload.id = 'photoUpload';
    photoUpload.accept = 'image/*';
    photoUpload.style.display = 'none';
    document.body.appendChild(photoUpload);

    // Modify the click event for the upload button
    uploadPhotoButton.addEventListener('click', (e) => {
      e.preventDefault();
      showQuickTips();
    });

    // Add event listener for file selection
    photoUpload.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleFileUpload(e.target.files[0]);
      }
    });

    // Modify the handleFileUpload function
    function handleFileUpload(file) {
      console.log('handleFileUpload function called');
      const reader = new FileReader();
      reader.onload = function(e) {
        console.log('FileReader onload event triggered');
        const humanImg = e.target.result;
        console.log('Image uploaded:', humanImg.substring(0, 50) + '...');
        
        // Update the rectangle content to show processing
        showWaitingMessage();
        
        // Call the API
        callReplicateAPI(humanImg, {
          product_title: productTitle,
          color: getSelectedColorVariant(),
          size: getSelectedSizeVariant()
        });
      };
      reader.onerror = function(error) {
        console.error('Error reading file:', error);
        // Add visual feedback for error
        uploadPhotoButton.textContent = 'Error uploading image. Try again.';
        uploadPhotoButton.style.backgroundColor = '#ffebee';
        uploadPhotoButton.style.borderColor = '#f44336';
        uploadPhotoButton.style.color = '#f44336';
      };
      reader.readAsDataURL(file);
    }

    // Function to call Replicate API
    async function callReplicateAPI(humanImg, garmentDes) {
      console.log('Calling Replicate API...');
      // Get the most recent product image URL
      const currentProductImage = getSelectedVariantImageUrl() || productImage;
      console.log('Garment Image:', currentProductImage);
      console.log('Human Image:', humanImg.substring(0, 50) + '...');
      console.log('Garment Description:', productTitle);
      
      try {
        const garmImgUrl = currentProductImage.startsWith('//') ? 'https:' + currentProductImage : currentProductImage;
        const humanImgUrl = humanImg.startsWith('data:') ? humanImg : new URL(humanImg, window.location.origin).href;

        const response = await fetch('https://shopify-virtual-tryon-app.vercel.app/api/try-on', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            garm_img: garmImgUrl, 
            human_img: humanImgUrl, 
            garment_des: productTitle  // Use productTitle directly as garment_des
          }),
        });

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        console.log('API Response:', data);

        if (data.status === 'processing') {
          console.log('Starting polling for job:', data.jobId);
          storeJobInformation(data.jobId, currentProductImage, productTitle, window.location.href, getSelectedColorVariant());
          pollJobStatus(data.jobId);
        } else {
          console.error('Unexpected response from API:', data);
          displayResult('Error: Unexpected response from server');
        }
      } catch (error) {
        console.error('Error calling API:', error);
        displayResult(`Error: ${error.message}`);
      }
    }

    // Check for existing job and set initial upload box state
    const jobInfo = getStoredJobInformation();
    if (jobInfo && jobInfo.status === 'processing') {
      setUploadBoxState(true);
    }

    console.log('Try-on widget fully initialized');

    // Call setupVariantObserver after the widget is initialized
    setupVariantObserver();
    console.log('Current color variant:', getSelectedColorVariant());
    console.log('Current size variant:', getSelectedSizeVariant());
  }

  // Start the global status checker on all pages
  startGlobalStatusChecker();

  console.log('Try-on widget script initialization complete');
})();