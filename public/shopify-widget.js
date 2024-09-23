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

  // Example images
  const exampleContainer = document.createElement('div');
  exampleContainer.style.display = 'flex';
  exampleContainer.style.justifyContent = 'space-between';
  exampleContainer.style.width = '100%';
  exampleContainer.style.maxWidth = '800px';
  exampleContainer.style.marginBottom = '30px';

  const beforeExample = document.createElement('div');
  beforeExample.style.width = '48%';
  beforeExample.style.textAlign = 'center';
  beforeExample.innerHTML = '<img src="/path/to/before-example.jpg" alt="Before Example" style="width: 100%; height: auto;"><p>Before</p>';

  const afterExample = document.createElement('div');
  afterExample.style.width = '48%';
  afterExample.style.textAlign = 'center';
  afterExample.innerHTML = '<img src="/path/to/after-example.jpg" alt="After Example" style="width: 100%; height: auto;"><p>After</p>';

  exampleContainer.appendChild(beforeExample);
  exampleContainer.appendChild(afterExample);

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
  resultContainer.style.maxWidth = '800px';
  resultContainer.style.display = 'flex';
  resultContainer.style.justifyContent = 'space-between';
  resultContainer.style.marginTop = '30px';

  const userImageContainer = document.createElement('div');
  userImageContainer.style.width = '48%';
  userImageContainer.style.textAlign = 'center';
  userImageContainer.innerHTML = '<h3>Your Image</h3><div id="userImagePlaceholder" style="width: 100%; height: 300px; background-color: #f0f0f0; display: flex; align-items: center; justify-content: center;"><p>Your image will appear here</p></div>';

  const outputImageContainer = document.createElement('div');
  outputImageContainer.style.width = '48%';
  outputImageContainer.style.textAlign = 'center';
  outputImageContainer.innerHTML = '<h3>Result</h3><div id="outputImagePlaceholder" style="width: 100%; height: 300px; background-color: #f0f0f0; display: flex; align-items: center; justify-content: center;"><p>Try-on result will appear here</p></div>';

  resultContainer.appendChild(userImageContainer);
  resultContainer.appendChild(outputImageContainer);

  // Append elements to the widget
  widgetContainer.appendChild(exampleContainer);
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
  imagePreview.style.maxHeight = '300px';
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
      
      const userImagePlaceholder = document.getElementById('userImagePlaceholder');
      userImagePlaceholder.innerHTML = '';
      userImagePlaceholder.appendChild(imagePreview);

      // Add a "Replace Image" button
      const replaceButton = document.createElement('button');
      replaceButton.textContent = 'Replace Image';
      replaceButton.className = 'btn btn--small';
      replaceButton.style.marginTop = '10px';
      replaceButton.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent triggering uploadBox click
        photoUpload.click();
      });
      userImagePlaceholder.appendChild(replaceButton);
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
    const outputImagePlaceholder = document.getElementById('outputImagePlaceholder');
    outputImagePlaceholder.innerHTML = '';
    
    const resultImage = document.createElement('img');
    resultImage.src = outputUrl;
    resultImage.style.maxWidth = '100%';
    resultImage.style.maxHeight = '300px';
    
    outputImagePlaceholder.appendChild(resultImage);
  }

  console.log('Try-on widget fully initialized');
})();