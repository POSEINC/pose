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

  const uploadBox = document.createElement('div');
  uploadBox.id = 'uploadBox';
  uploadBox.style.width = '100%';
  uploadBox.style.height = '200px';
  uploadBox.style.border = '2px dashed #808080'; // Changed to a medium gray
  uploadBox.style.display = 'flex';
  uploadBox.style.alignItems = 'center';
  uploadBox.style.justifyContent = 'center';
  uploadBox.style.cursor = 'pointer';
  uploadBox.style.position = 'relative';
  uploadBox.style.textAlign = 'center'; // Ensure text is centered horizontally

  // Create a paragraph element for the text
  const uploadText = document.createElement('p');
  uploadText.textContent = 'Click to add a photo of yourself';
  uploadText.style.margin = '0'; // Remove default margins
  uploadText.style.padding = '10px'; // Add some padding for better appearance
  uploadText.style.maxWidth = '100%'; // Ensure text doesn't overflow
  uploadText.style.wordWrap = 'break-word'; // Allow long words to break

  // Add the text to the upload box
  uploadBox.appendChild(uploadText);

  uploadBox.addEventListener('click', () => {
    console.log('Upload box clicked'); // Debug log
    photoUpload.click();
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

    displayInitialWaitingMessage(); // Move this here
    callReplicateAPI(productImage, humanImg, productTitle);
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

  async function callReplicateAPI(garmImg, humanImg, garmentDes) {
    console.log('Calling Replicate API...');
    console.log('Garment Image:', garmImg);
    console.log('Human Image:', humanImg.substring(0, 50) + '...'); // Log only the first 50 characters of the base64 string
    console.log('Garment Description:', JSON.stringify(garmentDes)); // Use JSON.stringify to see exact string content
    
    try {
      // Remove displayInitialWaitingMessage() from here
      
      // Make sure the images are valid URLs or base64 strings
      const garmImgUrl = garmImg.startsWith('data:') ? garmImg : new URL(garmImg, window.location.origin).href;
      const humanImgUrl = humanImg.startsWith('data:') ? humanImg : new URL(humanImg, window.location.origin).href;

      // Make a POST request to your API endpoint
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

  const waitingMessages = [
    "This will be worth the wait.",
    "You're going to look great in this.",
    "Stitching pixels... almost there!",
    "Prepare to be amazed by your new style.",
    "Excitement is just a few seconds away...",
    "Fashion magic in progress...",
    "Transforming pixels into your perfect look.",
    "You're about to see yourself in a whole new light.",
    "Your mirror's about to get jealous.",
    "Hold onto your socks, if you're still wearing any.",
    "Ironing out the virtual wrinkles.",
    "Preparing to make your reflection jealous.",
    "Channeling your inner supermodel...",
    "Summoning the style gods..."
  ];

  function pollJobStatus(jobId) {
    console.log('Polling started for job:', jobId);
    let pollCount = 0;
    const maxPolls = 60; // 5 minutes maximum polling time

    // Add a delay before starting to show cycling messages
    setTimeout(() => {
      const pollInterval = setInterval(async () => {
        pollCount++;
        console.log(`Polling attempt ${pollCount} for job ${jobId}`);

        // Update message
        updateWaitingMessage(pollCount - 1); // Subtract 1 to start from the first message

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
            displayResult(data.output);
          } else if (data.status === 'failed') {
            clearInterval(pollInterval);
            console.error('Processing failed:', data.error);
            displayResult(`Error: Processing failed - ${data.error}`);
          } else if (data.status === 'processing') {
            console.log('Still processing...');
            if (pollCount >= maxPolls) {
              clearInterval(pollInterval);
              console.error('Polling timeout reached');
              displayResult('Error: Processing timeout');
            }
          } else {
            clearInterval(pollInterval);
            console.error('Unexpected status:', data.status);
            displayResult('Error: Unexpected response from server');
          }
        } catch (error) {
          console.error('Error polling job status:', error);
          clearInterval(pollInterval);
          displayResult(`Error: Unable to get processing status - ${error.message}`);
        }
      }, 5000); // Poll every 5 seconds
    }, 3000); // Wait for 3 seconds before starting to cycle messages
  }

  function updateWaitingMessage(pollCount) {
    const messageIndex = pollCount % waitingMessages.length;
    const message = waitingMessages[messageIndex];
    const resultImage = document.getElementById('resultImage');
    resultImage.innerHTML = `<p>${message}</p>`;
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
      resultImage.style.padding = '20px'; // Keep padding for text content
      if (typeof output === 'object' && output.error) {
        resultImage.innerHTML = `
          <p style="color: red; text-align: center;">Error: ${output.error}</p>
          <p style="text-align: center;">Oops, something went wrong. Please try again.</p>
        `;
      } else {
        resultImage.innerHTML = `
          <p style="text-align: center;">${JSON.stringify(output)}</p>
          <p style="text-align: center;">Hmm, that didn't work as expected. Let's try again!</p>
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
        Image generation may take 45-60 seconds.<br>
        Feel free to browse, but please stay on this product page.
      </p>
    `;
  }

  console.log('Try-on widget fully initialized');
})();