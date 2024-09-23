(function() {
  console.log('Shopify try-on widget script started');

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
  widgetContainer.style.flexDirection = 'column';
  widgetContainer.style.alignItems = 'center';

  // Section title
  const sectionTitle = document.createElement('h2');
  sectionTitle.className = 'section-header__title';
  sectionTitle.textContent = 'Virtual Try-On';
  sectionTitle.style.textAlign = 'center';
  sectionTitle.style.marginBottom = '30px';

  // Upload section
  const uploadSection = document.createElement('div');
  uploadSection.style.width = '100%';
  uploadSection.style.maxWidth = '400px';
  uploadSection.style.display = 'flex';
  uploadSection.style.flexDirection = 'column';
  uploadSection.style.alignItems = 'center';
  uploadSection.style.marginBottom = '30px';

  const uploadBox = document.createElement('div');
  uploadBox.id = 'uploadBox';
  uploadBox.style.width = '100%';
  uploadBox.style.height = '200px';
  uploadBox.style.border = '2px dashed #4CAF50';
  uploadBox.style.display = 'flex';
  uploadBox.style.flexDirection = 'column';
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
  uploadSection.appendChild(photoUpload);
  uploadSection.appendChild(tryItOnButton);

  // Result container
  const resultContainer = document.createElement('div');
  resultContainer.id = 'resultContainer';
  resultContainer.style.width = '100%';
  resultContainer.style.display = 'flex';
  resultContainer.style.flexDirection = 'column';
  resultContainer.style.alignItems = 'center';

  // Append elements to the widget
  widgetContainer.appendChild(uploadSection);
  widgetContainer.appendChild(resultContainer);
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

  const productTitle = document.querySelector('.product-single__title').textContent;
  const productImage = document.querySelector('.product__image').src;

  const imagePreview = document.createElement('img');
  imagePreview.id = 'imagePreview';
  imagePreview.style.maxWidth = '100%';
  imagePreview.style.maxHeight = '200px';
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

      // Add a "Replace Image" button
      const replaceButton = document.createElement('button');
      replaceButton.textContent = 'Replace Image';
      replaceButton.className = 'btn btn--small';
      replaceButton.style.marginTop = '10px';
      replaceButton.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent triggering uploadBox click
        photoUpload.click();
      });
      uploadBox.appendChild(replaceButton);
    };
    reader.readAsDataURL(file);
  }

  async function callReplicateAPI(garmImg, humanImg, garmentDes) {
    // Placeholder for API call
    console.log('Calling Replicate API...');
    // Simulating API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    // Placeholder result
    displayResult(humanImg); // Using uploaded image as placeholder result
  }

  function displayResult(outputUrl) {
    const resultContainer = document.getElementById('resultContainer');
    resultContainer.innerHTML = '<h3>Result</h3>';

    const comparisonContainer = document.createElement('div');
    comparisonContainer.style.display = 'flex';
    comparisonContainer.style.justifyContent = 'space-between';
    comparisonContainer.style.width = '100%';
    comparisonContainer.style.maxWidth = '800px';

    const beforeContainer = document.createElement('div');
    beforeContainer.style.width = '48%';
    beforeContainer.style.textAlign = 'center';

    const afterContainer = document.createElement('div');
    afterContainer.style.width = '48%';
    afterContainer.style.textAlign = 'center';

    const beforeImg = document.createElement('img');
    beforeImg.src = imagePreview.src;
    beforeImg.style.width = '100%';
    beforeImg.style.height = 'auto';

    const afterImg = document.createElement('img');
    afterImg.src = outputUrl;
    afterImg.style.width = '100%';
    afterImg.style.height = 'auto';

    const beforeLabel = document.createElement('p');
    beforeLabel.textContent = 'Before';
    beforeLabel.style.marginTop = '5px';

    const afterLabel = document.createElement('p');
    afterLabel.textContent = 'After';
    afterLabel.style.marginTop = '5px';

    beforeContainer.appendChild(beforeImg);
    beforeContainer.appendChild(beforeLabel);

    afterContainer.appendChild(afterImg);
    afterContainer.appendChild(afterLabel);

    comparisonContainer.appendChild(beforeContainer);
    comparisonContainer.appendChild(afterContainer);

    resultContainer.appendChild(comparisonContainer);
  }

  console.log('Try-on widget fully initialized');
})();