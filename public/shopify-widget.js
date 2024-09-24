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

  let productTitle = productTitleElement ? productTitleElement.textContent.trim() : 'Product';
  let productImage = '';

  if (productImageElement && productImageElement.src) {
    productImage = productImageElement.src;
  } else {
    console.error('Product image element not found. Please check the page structure and update the selector.');
  }

  console.log('Product Title:', productTitle);
  console.log('Product Image:', productImage);

  // Create the widget section
  const widgetSection = document.createElement('section');
  widgetSection.className = 'try-on-widget';
  widgetSection.style.padding = '40px 0';
  widgetSection.style.margin = '40px 0';
  widgetSection.style.borderTop = '1px solid #e8e8e8';
  widgetSection.style.borderBottom = '1px solid #e8e8e8';

  // Create a container for the widget content
  const widgetContainer = document.createElement('div');
  widgetContainer.className = 'page-width';
  widgetContainer.style.display = 'flex';
  widgetContainer.style.justifyContent = 'space-between';
  widgetContainer.style.alignItems = 'flex-start';

  // Section title
  const sectionTitle = document.createElement('h2');
  sectionTitle.className = 'section-header__title';
  sectionTitle.textContent = 'See How This Looks on You';
  sectionTitle.style.textAlign = 'center';
  sectionTitle.style.marginBottom = '30px';

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
  uploadText.textContent = 'Click or drag to add photo of yourself';
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
  widgetSection.appendChild(sectionTitle);
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
    console.log('handleFileUpload function called'); // Debug log
    const reader = new FileReader();
    reader.onload = function(e) {
      console.log('FileReader onload event triggered'); // Debug log
      const humanImg = e.target.result;
      console.log('Image uploaded:', humanImg.substring(0, 50) + '...'); // Log first 50 chars of base64 string

      // Display the uploaded image preview
      imagePreview.src = humanImg;
      imagePreview.style.display = 'block';
      imagePreview.style.maxWidth = '100%';
      imagePreview.style.maxHeight = '180px'; // Adjust this value as needed
      imagePreview.style.objectFit = 'contain';
      tryItOnButton.disabled = false; // Enable the "Try it on" button
      
      // Clear the upload box and add the preview
      uploadBox.innerHTML = '';
      uploadBox.appendChild(imagePreview);

      console.log('Image preview added to uploadBox'); // Debug log

      // Add a "Replace Image" button
      const replaceButton = document.createElement('button');
      replaceButton.textContent = 'Replace Image';
      replaceButton.className = 'btn btn--small';
      replaceButton.style.position = 'absolute';
      replaceButton.style.top = '10px';
      replaceButton.style.right = '10px';
      replaceButton.style.zIndex = '10'; // Ensure the button is above the image
      replaceButton.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent triggering uploadBox click
        photoUpload.click();
      });
      uploadBox.appendChild(replaceButton);

      // Add visual feedback
      uploadBox.style.border = '2px solid #4CAF50';
      uploadBox.style.backgroundColor = '#e8f5e9';

      // Add confirmation message
      const confirmationMessage = document.createElement('p');
      confirmationMessage.textContent = 'Image uploaded successfully!';
      confirmationMessage.style.color = '#4CAF50';
      confirmationMessage.style.position = 'absolute';
      confirmationMessage.style.bottom = '10px';
      confirmationMessage.style.left = '50%';
      confirmationMessage.style.transform = 'translateX(-50%)';
      confirmationMessage.style.zIndex = '10'; // Ensure the message is above the image
      uploadBox.appendChild(confirmationMessage);
    };
    reader.onerror = function(error) {
      console.error('Error reading file:', error); // Debug log for errors
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
    console.log('Human Image:', humanImg);
    console.log('Garment Description:', garmentDes);
    
    try {
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

  function pollJobStatus(jobId) {
    console.log('Polling started for job:', jobId);
    let pollCount = 0;
    const maxPolls = 60; // 5 minutes maximum polling time

    const pollInterval = setInterval(async () => {
      pollCount++;
      console.log(`Polling attempt ${pollCount} for job ${jobId}`);

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
  }

  function displayResult(output) {
    const resultImage = document.getElementById('resultImage');
    if (typeof output === 'string' && output.startsWith('http')) {
      resultImage.innerHTML = `<img src="${output}" alt="Try-on result" style="max-width: 100%; max-height: 200px;">`;
    } else if (Array.isArray(output) && output.length > 0 && output[0].startsWith('http')) {
      // The API might return an array of URLs
      resultImage.innerHTML = `<img src="${output[0]}" alt="Try-on result" style="max-width: 100%; max-height: 200px;">`;
    } else if (typeof output === 'object' && output.error) {
      resultImage.innerHTML = `<p>Error: ${output.error}</p>`;
    } else {
      resultImage.innerHTML = `<p>${JSON.stringify(output)}</p>`;
    }
  }

  console.log('Try-on widget fully initialized');
})();