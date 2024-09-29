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

// Add this function near the top of your script, with other utility functions
async function getProductData(productUrl) {
  try {
    const response = await fetch(productUrl + '.js');
    if (!response.ok) {
      throw new Error('Failed to fetch product data');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching product data:', error);
    return null;
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

      // Fetch product data and populate size dropdown
      if (jobInfo && jobInfo.productUrl) {
        getProductData(jobInfo.productUrl).then(productData => {
          if (productData) {
            const sizesAvailability = getSizesAvailability(productData, jobInfo.colorVariant);
            
            // Create and populate size dropdown
            const sizeDropdown = document.createElement('select');
            sizeDropdown.style.marginBottom = '10px';
            sizeDropdown.style.width = '100%';
            sizeDropdown.style.padding = '5px';
            sizeDropdown.innerHTML = '<option value="">Select Size</option>';
            sizesAvailability.forEach(({ size, available }) => {
              sizeDropdown.innerHTML += `<option value="${size}" ${available ? '' : 'disabled'}>${size}${available ? '' : ' (Out of Stock)'}</option>`;
            });
            notification.appendChild(sizeDropdown);

            // Add to Cart button
            const addToCartButton = document.createElement('button');
            addToCartButton.textContent = 'Add to Cart';
            addToCartButton.style.padding = '5px 10px';
            addToCartButton.style.backgroundColor = '#4CAF50';
            addToCartButton.style.color = 'white';
            addToCartButton.style.border = 'none';
            addToCartButton.style.borderRadius = '3px';
            addToCartButton.style.cursor = 'pointer';
            addToCartButton.onclick = () => {
              const selectedSize = sizeDropdown.value;
              if (!selectedSize) {
                alert('Please select a size');
                return;
              }
              // Here you would call a function to add the item to the cart
              console.log('Adding to cart:', jobInfo.productTitle, 'Size:', selectedSize, 'Color:', jobInfo.colorVariant);
            };
            notification.appendChild(addToCartButton);
          } else {
            console.error('Failed to fetch product data');
            const errorMessage = document.createElement('p');
            errorMessage.textContent = 'Unable to load size information. Please try again later.';
            errorMessage.style.color = 'red';
            notification.appendChild(errorMessage);
          }
        }).catch(error => {
          console.error('Error in getProductData:', error);
        });
      } else {
        console.error('No product URL found in job info');
      }
    }

    // Add close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.marginTop = '10px';
    closeButton.style.padding = '5px 10px';
    closeButton.style.backgroundColor = '#ccc';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '3px';
    closeButton.style.cursor = 'pointer';
    closeButton.onclick = () => notification.remove();
    notification.appendChild(closeButton);

    // Add notification to the page
    document.body.appendChild(notification);
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
    const sectionSubtext = document.querySelector('.section-header__subtext');

    variantObserver = new MutationObserver(() => {
      const newColor = getSelectedColorVariant();
      const newSize = getSelectedSizeVariant();
      const newImageUrl = getSelectedVariantImageUrl();

      console.log('Selected Color:', newColor);
      console.log('Selected Size:', newSize);
      console.log('Updated product image:', newImageUrl);

      if (newColor && sectionSubtext) {
        let subtext = `Upload a photo and see how ${productTitle} in ${newColor} looks on you, no dressing room required.`;
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

  // Only proceed with product-specific code if we're on a product page
  if (isProductPage()) {
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
    widgetSection.className = 'try-on-widget';
    widgetSection.style.padding = '40px 0';
    widgetSection.style.margin = '40px 0';
    widgetSection.style.borderTop = '1px solid #e8e8e8';
    widgetSection.style.borderBottom = '1px solid #e8e8e8';
    widgetSection.style.lineHeight = '1.25'; // Add this line to set consistent line spacing

    // Create a container for the widget content
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'page-width';
    widgetContainer.style.display = 'flex';
    widgetContainer.style.justifyContent = 'space-between';
    widgetContainer.style.alignItems = 'flex-start';

    // Section title
    const sectionTitle = document.createElement('h2');
    sectionTitle.className = 'section-header__title';
    sectionTitle.textContent = 'See Yourself Wearing It';
    sectionTitle.style.textAlign = 'center';
    sectionTitle.style.marginBottom = '10px'; // Reduced margin to accommodate subtext

    // Add subtext
    const sectionSubtext = document.createElement('p');
    sectionSubtext.className = 'section-header__subtext';
    sectionSubtext.textContent = colorVariant
      ? `Upload a photo and see how ${productTitle} in ${colorVariant} looks on you, no dressing room required.`
      : `Upload a photo and see how ${productTitle} looks on you, no dressing room required.`;
    sectionSubtext.style.textAlign = 'center';
    sectionSubtext.style.marginBottom = '20px';
    sectionSubtext.style.fontSize = '0.9em';
    sectionSubtext.style.color = '#666';

    // Append the title and subtext to the widget section
    widgetSection.appendChild(sectionTitle);
    widgetSection.appendChild(sectionSubtext);

    // Upload box and Try it on button
    const uploadSection = document.createElement('div');
    uploadSection.style.width = '45%';
    uploadSection.style.display = 'flex';
    uploadSection.style.flexDirection = 'column';
    uploadSection.style.alignItems = 'center';

    // Update the upload box creation
    const uploadBox = document.createElement('div');
    uploadBox.id = 'uploadBox';
    uploadBox.style.width = '100%';
    uploadBox.style.height = '200px';
    uploadBox.style.border = '2px dashed #808080';
    uploadBox.style.display = 'flex';
    uploadBox.style.flexDirection = 'column';
    uploadBox.style.alignItems = 'center';
    uploadBox.style.justifyContent = 'center';
    uploadBox.style.cursor = 'pointer';
    uploadBox.style.position = 'relative';
    uploadBox.style.textAlign = 'center';

    // Create a paragraph element for the main text
    const uploadText = document.createElement('p');
    uploadText.textContent = 'Click to add a photo of yourself';
    uploadText.style.margin = '0 0 10px 0';
    uploadText.style.padding = '10px';
    uploadText.style.maxWidth = '100%';
    uploadText.style.wordWrap = 'break-word';

    // Create an info icon
    const infoIcon = document.createElement('span');
    infoIcon.innerHTML = '&#9432;'; // Info symbol
    infoIcon.style.position = 'absolute';
    infoIcon.style.top = '10px';
    infoIcon.style.right = '10px';
    infoIcon.style.fontSize = '20px';
    infoIcon.style.cursor = 'pointer';
    infoIcon.title = 'Click for photo tips';

    // Add the text and info icon to the upload box
    uploadBox.appendChild(uploadText);
    uploadBox.appendChild(infoIcon);

    // Create a tooltip for quick tips
    const tooltip = document.createElement('div');
    tooltip.style.display = 'none';
    tooltip.style.position = 'absolute';
    tooltip.style.backgroundColor = '#f9f9f9';
    tooltip.style.border = '1px solid #ccc';
    tooltip.style.padding = '10px';
    tooltip.style.borderRadius = '5px';
    tooltip.style.maxWidth = '250px';
    tooltip.style.zIndex = '1000';
    tooltip.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    tooltip.innerHTML = `
      <p style="margin: 0 0 10px 0; font-weight: bold;">Photo Tips:</p>
      <ul style="margin: 0; padding-left: 20px;">
        <li>Ensure you're the only person in the photo</li>
        <li>Use a full-body photo, from head to toe</li>
        <li>Stand in a natural, relaxed pose facing the camera</li>
        <li>Wear fitted clothing that shows your body shape</li>
      </ul>
    `;

    // Add the tooltip to the document body
    document.body.appendChild(tooltip);

    // Show/hide tooltip on info icon click
    infoIcon.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent triggering the file upload
      const rect = infoIcon.getBoundingClientRect();
      tooltip.style.display = tooltip.style.display === 'none' ? 'block' : 'none';
      tooltip.style.top = `${rect.bottom + window.scrollY + 5}px`;
      tooltip.style.left = `${rect.left + window.scrollX - 125}px`; // Center the tooltip
    });

    // Hide tooltip when clicking outside
    document.addEventListener('click', (e) => {
      if (e.target !== infoIcon) {
        tooltip.style.display = 'none';
      }
    });

    // Create a modal for first-time users
    const modal = document.createElement('div');
    modal.style.display = 'none';
    modal.style.position = 'fixed';
    modal.style.zIndex = '1001';
    modal.style.left = '0';
    modal.style.top = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.overflow = 'auto';
    modal.style.backgroundColor = 'rgba(0,0,0,0.4)';

    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = '#fefefe';
    modalContent.style.margin = '15% auto';
    modalContent.style.padding = '20px';
    modalContent.style.border = '1px solid #888';
    modalContent.style.width = '80%';
    modalContent.style.maxWidth = '600px';
    modalContent.innerHTML = `
      <h2 style="text-align: center;">Tips for the Best Try-On Experience</h2>
      <ul>
        <li>Ensure you're the only person in the photo</li>
        <li>Use a full-body photo, from head to toe</li>
        <li>Stand in a natural, relaxed pose facing the camera</li>
        <li>Wear fitted clothing that shows your body shape</li>
      </ul>
      <div style="text-align: center; margin-top: 20px;">
        <button id="closeModal" style="padding: 10px 20px; cursor: pointer;">Got it!</button>
        <label style="display: block; margin-top: 10px;">
          <input type="checkbox" id="dontShowAgain"> Don't show this again
        </label>
      </div>
    `;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Close modal functionality
    document.getElementById('closeModal').addEventListener('click', () => {
      modal.style.display = 'none';
      if (document.getElementById('dontShowAgain').checked) {
        localStorage.setItem('dontShowTryOnTips', 'true');
      }
      // Trigger file upload dialog after closing the modal
      photoUpload.click();
    });

    // Show modal on first interaction, if not disabled
    let modalShown = false;
    uploadBox.addEventListener('click', (e) => {
      e.preventDefault(); // Prevent default click behavior
      if (!modalShown && localStorage.getItem('dontShowTryOnTips') !== 'true') {
        modal.style.display = 'block';
        modalShown = true;
      } else {
        // If modal has been shown before or is disabled, directly trigger file upload
        photoUpload.click();
      }
    });

    const photoUpload = document.createElement('input');
    photoUpload.type = 'file';
    photoUpload.id = 'photoUpload';
    photoUpload.accept = 'image/*';
    photoUpload.style.display = 'none';
    photoUpload.addEventListener('change', (event) => {
      console.log('File input change event triggered'); // Debug log
      const file = event.target.files[0];
      if (file) {
        console.log('File selected:', file.name); // Debug log
        handleFileUpload(file);
      } else {
        console.log('No file selected'); // Debug log
      }
    });

    const tryItOnButton = document.createElement('button');
    tryItOnButton.textContent = 'Try it on';
    tryItOnButton.className = 'btn';
    tryItOnButton.style.marginTop = '10px';
    tryItOnButton.disabled = true; // Initially disabled

    tryItOnButton.addEventListener('click', () => {
      if (!productImage) {
        console.error('Product image not found. Unable to proceed with try-on.');
        displayResult('Error: Product image not found. Please refresh the page or contact support.');
        return;
      }

      const humanImg = imagePreview.src;
      if (!humanImg) {
        console.error('Human image not uploaded');
        displayResult('Error: Please upload an image first');
        return;
      }

      displayInitialWaitingMessage();
      callReplicateAPI(humanImg, productTitle);
    });

    uploadSection.appendChild(uploadBox);
    uploadSection.appendChild(photoUpload);
    uploadSection.appendChild(tryItOnButton);
    widgetContainer.appendChild(uploadSection);

    // Result container
    const resultContainer = document.createElement('div');
    resultContainer.id = 'resultContainer';
    resultContainer.style.width = '45%';

    const resultImage = document.createElement('div');
    resultImage.id = 'resultImage';
    resultImage.style.width = '100%';
    resultImage.style.height = '200px';
    resultImage.style.backgroundColor = '#f0f0f0';
    resultImage.style.display = 'flex';
    resultImage.style.alignItems = 'center';
    resultImage.style.justifyContent = 'center';
    resultImage.style.textAlign = 'center';
    resultImage.style.padding = '20px'; // Add padding
    resultImage.style.boxSizing = 'border-box'; // Ensure padding doesn't increase overall size

    const resultText = document.createElement('p');
    resultText.textContent = 'Your virtual try-on will show here';
    resultText.style.margin = '0';
    resultText.style.padding = '10px';
    resultText.style.maxWidth = '100%';
    resultText.style.wordWrap = 'break-word';

    resultImage.appendChild(resultText);
    resultContainer.appendChild(resultImage);

    widgetContainer.appendChild(resultContainer);

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

    function handleFileUpload(file) {
      console.log('handleFileUpload function called');
      const reader = new FileReader();
      reader.onload = function(e) {
        console.log('FileReader onload event triggered');
        const humanImg = e.target.result;
        console.log('Image uploaded:', humanImg.substring(0, 50) + '...');

        // Display the uploaded image preview
        imagePreview.src = humanImg;
        imagePreview.style.display = 'block';
        imagePreview.style.maxWidth = '100%';
        imagePreview.style.maxHeight = '180px';
        imagePreview.style.objectFit = 'contain';
        tryItOnButton.disabled = false;
        
        // Clear the upload box and add the preview
        uploadBox.innerHTML = '';
        uploadBox.appendChild(imagePreview);

        console.log('Image preview added to uploadBox');

        // Add a "Replace Image" button
        const replaceButton = document.createElement('button');
        replaceButton.textContent = 'Replace Image';
        replaceButton.className = 'btn btn--small';
        replaceButton.style.position = 'absolute';
        replaceButton.style.top = '10px';
        replaceButton.style.right = '10px';
        replaceButton.style.zIndex = '10';
        replaceButton.addEventListener('click', (e) => {
          e.stopPropagation();
          photoUpload.click();
        });
        uploadBox.appendChild(replaceButton);
      };
      reader.onerror = function(error) {
        console.error('Error reading file:', error);
        // Add visual feedback for error
        uploadBox.style.border = '2px solid #f44336';
        uploadBox.style.backgroundColor = '#ffebee';
        uploadBox.innerHTML = '<p style="color: #f44336;">Error uploading image. Please try again.</p>';
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
      console.log('Garment Description:', JSON.stringify(garmentDes));
      
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
            garment_des: garmentDes 
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

    // Function to poll job status
    function pollJobStatus(jobId) {
      console.log('Polling started for job:', jobId);
      let pollCount = 0;
      const maxPolls = 60; // 5 minutes maximum polling time

      const customMessage = `Trying on ${productTitle} in ${getSelectedColorVariant() || 'selected color'}`;

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
              displayResult(data.output);
            } else if (data.status === 'failed') {
              clearInterval(pollInterval);
              console.error('Processing failed:', data.error);
              updateStoredJobStatus('failed');
              displayResult(`Error: Processing failed - ${data.error}`);
            } else if (data.status === 'processing') {
              console.log('Still processing...');
              if (pollCount >= maxPolls) {
                clearInterval(pollInterval);
                console.error('Polling timeout reached');
                updateStoredJobStatus('timeout');
                displayResult('Error: Processing timeout');
              }
            } else {
              clearInterval(pollInterval);
              console.error('Unexpected status:', data.status);
              updateStoredJobStatus('error');
              displayResult('Error: Unexpected response from server');
            }
          } catch (error) {
            console.error('Error polling job status:', error);
            clearInterval(pollInterval);
            updateStoredJobStatus('error');
            displayResult(`Error: Unable to get processing status - ${error.message}`);
          }
        }, 5000);
      }, 3000);
    }

    // Function to check for existing job
    function checkExistingJob() {
      const jobInfo = getStoredJobInformation();
      if (jobInfo && jobInfo.status === 'processing') {
        console.log('Found existing job:', jobInfo.jobId);
        pollJobStatus(jobInfo.jobId);
      }
    }

    // Call this function at the end of your script
    checkExistingJob();

    const waitingMessages = [
      "Get ready to strike a pose - your new look is loading!",
      "Fashion magic in progress...",
      "You're going to look great in this.",
      "Summoning the style gods...",
      "Transforming pixels into your perfect look.",
      "Channeling your inner supermodel...",
      "Sprinkling some virtual fairy dust on your outfit...",
      "Turning up the fashion volume to eleven...",
      "Buffing the digital runway for your grand entrance...",
      "You're about to see yourself in a whole new light.",
      "Tailoring pixels to perfection, just for you.",
      "Your mirror's about to get jealous.",
      "Hold onto your socks, if you're still wearing any.",
      "Ironing out the virtual wrinkles.",
      "This will be worth the wait.",
      "Prepare to be amazed by your new style.",
      "Stitching pixels... almost there!",
      "Prepare to be amazed by your new style.",
      "Excitement is just a few seconds away..."
    ];

    function updateWaitingMessage(pollCount) {
      const messageIndex = pollCount % waitingMessages.length;
      const message = waitingMessages[messageIndex];
      const resultImage = document.getElementById('resultImage');
      
      // Reset styles for resultImage
      resultImage.style.padding = '20px';
      resultImage.style.backgroundColor = '#f0f0f0';
      resultImage.style.display = 'flex';
      resultImage.style.alignItems = 'center';
      resultImage.style.justifyContent = 'center';
      resultImage.style.textAlign = 'center';
      resultImage.style.boxSizing = 'border-box';

      resultImage.innerHTML = `<p style="margin: 0;">${message}</p>`;
    }

    function displayResult(output) {
      const resultImage = document.getElementById('resultImage');
      const resultContainer = document.getElementById('resultContainer');

      // Clear any existing message
      const existingMessage = resultContainer.querySelector('p');
      if (existingMessage) {
        existingMessage.remove();
      }

      if (typeof output === 'string' && output.startsWith('http')) {
        resultImage.style.padding = '0'; // Remove padding for images
        resultImage.innerHTML = `
          <div style="position: relative; display: inline-block;">
            <img src="${output}" alt="Try-on result" style="max-width: 100%; max-height: 200px; display: block; margin: 0 auto; cursor: pointer;">
            <div class="expand-icon" style="position: absolute; top: 10px; right: 10px; background-color: rgba(255, 255, 255, 0.7); border-radius: 50%; padding: 5px; cursor: pointer;">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 3 21 3 21 9"></polyline>
                <polyline points="9 21 3 21 3 15"></polyline>
              </svg>
            </div>
          </div>
        `;
        resultImage.querySelector('img').addEventListener('click', () => createLightbox(output));
        resultImage.querySelector('.expand-icon').addEventListener('click', () => createLightbox(output));
        // Create a new paragraph for the message
        const messageParagraph = document.createElement('p');
        messageParagraph.textContent = 'Look how good you look!';
        messageParagraph.style.textAlign = 'center';
        messageParagraph.style.marginTop = '10px';
        messageParagraph.style.fontFamily = getComputedStyle(tryItOnButton).fontFamily;
        messageParagraph.style.fontSize = getComputedStyle(tryItOnButton).fontSize;
        messageParagraph.style.fontWeight = getComputedStyle(tryItOnButton).fontWeight;
        messageParagraph.style.color = getComputedStyle(tryItOnButton).color;
        // Append the message to the resultContainer instead of the resultImage
        resultContainer.appendChild(messageParagraph);
      } else if (Array.isArray(output) && output.length > 0 && output[0].startsWith('http')) {
        resultImage.style.padding = '0'; // Remove padding for images
        resultImage.innerHTML = `
          <div style="position: relative; display: inline-block;">
            <img src="${output[0]}" alt="Try-on result" style="max-width: 100%; max-height: 200px; display: block; margin: 0 auto; cursor: pointer;">
            <div class="expand-icon" style="position: absolute; top: 10px; right: 10px; background-color: rgba(255, 255, 255, 0.7); border-radius: 50%; padding: 5px; cursor: pointer;">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 3 21 3 21 9"></polyline>
                <polyline points="9 21 3 21 3 15"></polyline>
              </svg>
            </div>
          </div>
        `;
        resultImage.querySelector('img').addEventListener('click', () => createLightbox(output[0]));
        resultImage.querySelector('.expand-icon').addEventListener('click', () => createLightbox(output[0]));
        // Create a new paragraph for the message
        const messageParagraph = document.createElement('p');
        messageParagraph.textContent = 'Look how great you look!';
        messageParagraph.style.textAlign = 'center';
        messageParagraph.style.marginTop = '10px';
        messageParagraph.style.fontFamily = getComputedStyle(tryItOnButton).fontFamily;
        messageParagraph.style.fontSize = getComputedStyle(tryItOnButton).fontSize;
        messageParagraph.style.fontWeight = getComputedStyle(tryItOnButton).fontWeight;
        messageParagraph.style.color = getComputedStyle(tryItOnButton).color;
        // Append the message to the resultContainer instead of the resultImage
        resultContainer.appendChild(messageParagraph);
      } else {
        // Reset styles for text content
        resultImage.style.padding = '20px';
        resultImage.style.backgroundColor = '#f0f0f0';
        resultImage.style.display = 'flex';
        resultImage.style.alignItems = 'center';
        resultImage.style.justifyContent = 'center';
        resultImage.style.textAlign = 'center';
        resultImage.style.boxSizing = 'border-box';

        if (typeof output === 'object' && output.error) {
          resultImage.innerHTML = `
            <p style="color: red; text-align: center; margin: 0;">Error: ${output.error}</p>
            <p style="text-align: center; margin: 10px 0 0 0;">Oops, something went wrong. Please try again.</p>
          `;
        } else {
          resultImage.innerHTML = `
            <p style="text-align: center; margin: 0;">${JSON.stringify(output)}</p>
            <p style="text-align: center; margin: 10px 0 0 0;">Hmm, that didn't work as expected. Let's try again!</p>
          `;
        }
      }
    }

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

    function displayInitialWaitingMessage() {
      const resultImage = document.getElementById('resultImage');
      const resultContainer = document.getElementById('resultContainer');

      // Reset styles for resultImage
      resultImage.style.padding = '20px';
      resultImage.style.backgroundColor = '#f0f0f0';
      resultImage.style.display = 'flex';
      resultImage.style.alignItems = 'center';
      resultImage.style.justifyContent = 'center';
      resultImage.style.textAlign = 'center';
      resultImage.style.boxSizing = 'border-box';

      // Clear any existing content in resultImage
      resultImage.innerHTML = '';

      // Clear any existing messages in resultContainer
      const existingMessage = resultContainer.querySelector('p');
      if (existingMessage) {
        existingMessage.remove();
      }

      // Display the new waiting message
      resultImage.innerHTML = `
        <p style="text-align: center; margin: 0;">
          Generation takes 60-90 seconds.<br>
          Feel free to browse the site - we'll notify you when it's ready!
        </p>
      `;
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