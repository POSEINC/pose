(function() {
  console.log('Shopify widget script started');

  // Create the widget section
  const widgetSection = document.createElement('div');
  widgetSection.style.display = 'flex';
  widgetSection.style.justifyContent = 'space-between';
  widgetSection.style.alignItems = 'flex-start';
  widgetSection.style.padding = '20px';
  widgetSection.style.marginTop = '20px';
  widgetSection.style.border = '1px solid #e8e8e8';

  // Left side: Example images
  const exampleImages = document.createElement('div');
  exampleImages.style.width = '30%';
  exampleImages.innerHTML = '<h3>Example Images</h3><img src="/path/to/example1.jpg" alt="Example 1" style="max-width: 100%; margin-bottom: 10px;"><img src="/path/to/example2.jpg" alt="Example 2" style="max-width: 100%;">';
  widgetSection.appendChild(exampleImages);

  // Middle: Upload box and Try it on button
  const uploadSection = document.createElement('div');
  uploadSection.style.width = '30%';
  uploadSection.style.display = 'flex';
  uploadSection.style.flexDirection = 'column';
  uploadSection.style.alignItems = 'center';

  const uploadBox = document.createElement('div');
  uploadBox.id = 'uploadBox';
  uploadBox.style.width = '100%';
  uploadBox.style.height = '150px';
  uploadBox.style.border = '2px dashed #4CAF50';
  uploadBox.style.display = 'flex';
  uploadBox.style.alignItems = 'center';
  uploadBox.style.justifyContent = 'center';
  uploadBox.style.cursor = 'pointer';
  uploadBox.innerHTML = '<p>Click to upload or drag and drop an image here</p>';
  uploadBox.addEventListener('click', () => photoUpload.click());

  const photoUpload = document.createElement('input');
  photoUpload.type = 'file';
  photoUpload.id = 'photoUpload';
  photoUpload.accept = 'image/*';
  photoUpload.style.display = 'none';
  photoUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  });

  const tryItOnButton = document.createElement('button');
  tryItOnButton.textContent = 'Try it on';
  tryItOnButton.className = 'button button--full-width button--primary';
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
  uploadSection.appendChild(photoUpload);
  uploadSection.appendChild(tryItOnButton);
  widgetSection.appendChild(uploadSection);

  // Right side: Result container
  const resultContainer = document.createElement('div');
  resultContainer.id = 'resultContainer';
  resultContainer.style.width = '30%';
  resultContainer.innerHTML = '<h3>Result</h3>';
  widgetSection.appendChild(resultContainer);

  // Insert the widget section after the product images
  const productMediaContainer = document.querySelector('.product__media-container');
  if (productMediaContainer && productMediaContainer.parentNode) {
    productMediaContainer.parentNode.insertBefore(widgetSection, productMediaContainer.nextSibling);
    console.log('Widget section inserted into DOM');
  } else {
    console.error('Could not find the product media container');
    return;
  }

  const productTitle = document.querySelector('.product__title').textContent;
  const productImage = document.querySelector('.product__image img').src;

  const imagePreview = document.createElement('img');
  imagePreview.id = 'imagePreview';
  imagePreview.style.maxWidth = '100%';
  imagePreview.style.maxHeight = '150px';
  imagePreview.style.display = 'none'; // Hidden by default

  function handleFileUpload(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const humanImg = e.target.result;
      console.log('Image uploaded:', humanImg);

      // Display the uploaded image preview
      imagePreview.src = humanImg;
      imagePreview.style.display = 'block';
      tryItOnButton.disabled = false; // Enable the "Try it on" button
      uploadBox.innerHTML = ''; // Clear the upload box
      uploadBox.appendChild(imagePreview); // Add the preview to the upload box
    };
    reader.readAsDataURL(file);
  }

  async function callReplicateAPI(garmImg, humanImg, garmentDes) {
    // Call the custom API endpoint
    const response = await fetch('/api/try-on', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        garmImg,
        humanImg,
        garmentDes
      })
    });

    const result = await response.json();
    if (result && result.status === 'processing') {
      checkJobStatus(result.jobId);
    } else {
      console.error('Error from API:', result);
      alert('An error occurred while processing the image.');
    }
  }

  async function checkJobStatus(jobId) {
    const interval = setInterval(async () => {
      const response = await fetch(`/api/try-on?jobId=${jobId}`);
      const result = await response.json();

      if (result.status === 'completed') {
        clearInterval(interval);
        displayResult(result.output);
      } else if (result.status === 'failed') {
        clearInterval(interval);
        console.error('Error from API:', result);
        alert('An error occurred while processing the image.');
      }
    }, 5000); // Check every 5 seconds
  }

  function displayResult(outputUrl) {
    resultContainer.innerHTML = `<h3>Result</h3><img src="${outputUrl}" alt="Try-on result" style="max-width: 100%;">`;
  }

  console.log('Try-on widget fully initialized');
})();
