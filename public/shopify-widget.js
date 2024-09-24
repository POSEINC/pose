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
  const productTitleElement = document.querySelector('.product-single__title');
  const productImageElement = document.querySelector('.product__image');

  let productTitle = 'Product';
  let productImage = '';

  if (productTitleElement) {
    productTitle = productTitleElement.textContent;
  } else {
    console.warn('Product title element not found');
  }

  if (productImageElement) {
    productImage = productImageElement.src;
  } else {
    console.warn('Product image element not found');
  }

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
  sectionTitle.textContent = 'Virtual Try-On';
  sectionTitle.style.textAlign = 'center';
  sectionTitle.style.marginBottom = '30px';

  // Left side: Example images
  const exampleImages = document.createElement('div');
  exampleImages.style.width = '30%';
  exampleImages.innerHTML = `
    <div style="text-align: center; margin-bottom: 20px;">
      <img src="https://shopify-virtual-tryon-app.vercel.app/images/before-example.jpg" alt="Before Example" style="max-width: 100%; height: auto; margin-bottom: 10px;">
      <p>Before</p>
    </div>
    <div style="text-align: center;">
      <img src="https://shopify-virtual-tryon-app.vercel.app/images/after-example.jpg" alt="After Example" style="max-width: 100%; height: auto; margin-bottom: 10px;">
      <p>After</p>
    </div>
  `;
  widgetContainer.appendChild(exampleImages);

  // Middle: Upload box and Try it on button
  const uploadSection = document.createElement('div');
  uploadSection.style.width = '30%';
  uploadSection.style.display = 'flex';
  uploadSection.style.flexDirection = 'column';
  uploadSection.style.alignItems = 'center';

  const uploadBox = document.createElement('div');
  uploadBox.id = 'uploadBox';
  uploadBox.style.width = '100%';
  uploadBox.style.height = '200px';
  uploadBox.style.border = '2px dashed #4CAF50';
  uploadBox.style.display = 'flex';
  uploadBox.style.alignItems = 'center';
  uploadBox.style.justifyContent = 'center';
  uploadBox.style.cursor = 'pointer';
  uploadBox.style.position = 'relative';
  uploadBox.innerHTML = '<p>Click to upload or drag and drop an image here</p>';
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
  tryItOnButton.addEventListener('click', async function() {
    const humanImg = imagePreview.src;
    if (humanImg) {
      await callReplicateAPI(productImage, humanImg, productTitle);
    } else {
      alert('Please upload an image first.');
    }
  });

  uploadSection.appendChild(uploadBox);
  uploadSection.appendChild(photoUpload); // Ensure this line is present
  uploadSection.appendChild(tryItOnButton);
  widgetContainer.appendChild(uploadSection);

  // Right side: Result container
  const resultContainer = document.createElement('div');
  resultContainer.id = 'resultContainer';
  resultContainer.style.width = '30%';
  resultContainer.innerHTML = '<h3>Result</h3><div id="resultImage" style="width: 100%; height: 200px; background-color: #f0f0f0; display: flex; align-items: center; justify-content: center;"><p>Result will appear here</p></div>';
  widgetContainer.appendChild(resultContainer);

  // Append the container to the section
  widgetSection.appendChild(sectionTitle);
  widgetSection.appendChild(widgetContainer);

  // Add these debug logs
  console.log('Product form found:', !!productForm);
  console.log('Product form parent:', productForm ? productForm.parentNode : 'Not found');

  // Then replace the existing widget insertion code with this:
  if (productForm && productForm.parentNode) {
    productForm.parentNode.insertBefore(widgetSection, productForm.nextSibling);
    console.log('Try-on widget section inserted into DOM');
  } else {
    console.error('Could not find the product form. Inserting widget at the end of the body.');
    document.body.appendChild(widgetSection);
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
    // Placeholder for API call
    console.log('Calling Replicate API...');
    console.log('Garment Image:', garmImg);
    console.log('Human Image:', humanImg);
    console.log('Garment Description:', garmentDes);
    
    // Simulating API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Placeholder result - replace this with actual API call when ready
    displayResult(humanImg); // Using uploaded image as placeholder result
  }

  function displayResult(outputUrl) {
    const resultImage = document.getElementById('resultImage');
    resultImage.innerHTML = `<img src="${outputUrl}" alt="Try-on result" style="max-width: 100%; max-height: 200px;">`;
  }

  console.log('Try-on widget fully initialized');
})();