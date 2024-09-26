console.log('Shopify try-on widget script started');

(function() {
  console.log('Shopify try-on widget script started');

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
  sectionSubtext.textContent = 'Upload a photo and see how this item looks on you, no dressing room required.';
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

    console.log('Try-on button clicked with:', { 
      productImage, 
      humanImg: humanImg ? 'Present' : 'Missing', 
      productTitle 
    });
    displayInitialWaitingMessage();
    initiateTryOn(productImage, humanImg, productTitle);
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
  const productForm = document.querySelector('.product-form');
  if (productForm && productForm.parentNode) {
    productForm.parentNode.insertBefore(widgetSection, productForm.nextSibling);
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

  async function initiateTryOn(productImage, humanImg, productTitle) {
    try {
      console.log('Initiating try-on with:', { 
        productImage, 
        humanImg: humanImg ? 'Present' : 'Missing', 
        productTitle 
      });
      if (!productImage) {
        throw new Error('Product image is missing');
      }
      const jobId = await callReplicateAPI(productImage, humanImg, productTitle);
      localStorage.setItem('tryOnRequest', JSON.stringify({
        jobId,
        productImage,
        humanImage: humanImg,
        productTitle,
        status: 'processing'
      }));
      startPolling(jobId);
    } catch (error) {
      console.error('Error initiating try-on:', error);
      displayResult('Error: ' + error.message);
    }
  }

  async function callReplicateAPI(garmImg, humanImg, garmentDes) {
    try {
      if (!garmImg || !humanImg) {
        throw new Error('Both garment and human images are required');
      }

      // Ensure garmImg is a valid URL
      if (!garmImg.startsWith('http://') && !garmImg.startsWith('https://')) {
        throw new Error('Invalid garment image URL');
      }

      // Convert the humanImg data URL to a Blob and create a temporary URL
      const response = await fetch(humanImg);
      const blob = await response.blob();
      const humanImgUrl = URL.createObjectURL(blob);

      const input = {
        garm_img: garmImg,
        human_img: humanImgUrl,
        garment_des: garmentDes || 'T-shirt',
        category: 'upper_body',
        crop: true,
      };

      console.log('Calling API with:', {
        ...input,
        garm_img: input.garm_img,
        human_img: 'Blob URL created',
      });

      const apiResponse = await fetch('https://shopify-virtual-tryon-app.vercel.app/api/try-on', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      
      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        throw new Error(`HTTP error! status: ${apiResponse.status}, message: ${errorText}`);
      }
      
      const result = await apiResponse.json();
      console.log('Full API response:', result);
      
      if (!result.jobId) {
        throw new Error('No jobId returned from API');
      }
      
      // Clean up the temporary URL
      URL.revokeObjectURL(humanImgUrl);
      
      return result.jobId;
    } catch (error) {
      console.error('Error calling Replicate API:', error);
      throw error;
    }
  }

  function startPolling(jobId) {
    let attempts = 0;
    const maxAttempts = 30; // 2.5 minutes at 5-second intervals

    const pollInterval = setInterval(async () => {
      try {
        attempts++;
        if (attempts > maxAttempts) {
          clearInterval(pollInterval);
          throw new Error('Polling timeout reached');
        }

        console.log(`Polling attempt ${attempts} for job ${jobId}`);
        const response = await fetch(`https://shopify-virtual-tryon-app.vercel.app/api/try-on?jobId=${jobId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Polling response:', data);
        
        if (data.status === 'completed') {
          clearInterval(pollInterval);
          const tryOnRequest = JSON.parse(localStorage.getItem('tryOnRequest'));
          tryOnRequest.status = 'completed';
          tryOnRequest.result = data.output;
          localStorage.setItem('tryOnRequest', JSON.stringify(tryOnRequest));
          showNotification('Your try-on image is ready! Click here to view it.');
        } else if (data.status === 'failed') {
          clearInterval(pollInterval);
          throw new Error(data.error || 'Try-on process failed');
        }
      } catch (error) {
        console.error('Error polling job status:', error);
        clearInterval(pollInterval);
        localStorage.removeItem('tryOnRequest');
        displayResult(`Error: ${error.message}. Please try again.`);
        showNotification('Error: ' + error.message + '. Please try again.');
      }
    }, 5000);
  }

  function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = '#333';
    notification.style.color = '#fff';
    notification.style.padding = '10px';
    notification.style.borderRadius = '5px';
    notification.style.cursor = 'pointer';
    notification.style.zIndex = '9999';
    notification.textContent = message;

    notification.addEventListener('click', () => {
      const tryOnRequest = JSON.parse(localStorage.getItem('tryOnRequest'));
      if (tryOnRequest && tryOnRequest.status === 'completed') {
        createLightbox(tryOnRequest.result);
      }
      document.body.removeChild(notification);
    });

    document.body.appendChild(notification);

    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 10000);
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
        Your try-on image is being generated.<br>
        You'll be notified when it's ready.<br>
        Feel free to continue browsing!
      </p>
    `;
  }

  // Add this at the end of the script
  document.addEventListener('DOMContentLoaded', () => {
    const tryOnRequest = JSON.parse(localStorage.getItem('tryOnRequest'));
    if (tryOnRequest) {
      if (tryOnRequest.status === 'processing') {
        startPolling(tryOnRequest.jobId);
      } else if (tryOnRequest.status === 'completed') {
        showNotification('Your try-on image is ready! Click here to view it.');
      }
    }
  });

  console.log('Try-on widget fully initialized');

  function displayResult(message) {
    const resultImage = document.getElementById('resultImage');
    resultImage.innerHTML = `<p style="color: red;">${message}</p>`;
  }
})();