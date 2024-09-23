(function() {
  console.log('Shopify widget script started');

  // Create the "See Me In This" button
  const tryOnButton = document.createElement('button');
  tryOnButton.textContent = 'See Me In This';
  tryOnButton.style.marginBottom = '10px';
  tryOnButton.className = 'button button--full-width button--primary';
  tryOnButton.type = 'button'; // Ensure it's not a submit button

  // Find the "Add to Cart" button
  const addToCartButton = document.querySelector('button[name="add"]');
  if (addToCartButton && addToCartButton.parentNode) {
    addToCartButton.parentNode.insertBefore(tryOnButton, addToCartButton);
    console.log('Try-on button inserted into DOM');
  } else {
    console.error('Could not find the Add to Cart button');
    return;
  }

  // Create a modal for the photo upload and try-on feature
  const modal = document.createElement('div');
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100%';
  modal.style.height = '100%';
  modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  modal.style.display = 'none'; // Hidden by default
  modal.style.zIndex = '1000'; // Ensure it appears above other content
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';

  const modalContent = document.createElement('div');
  modalContent.style.backgroundColor = 'white';
  modalContent.style.padding = '20px';
  modalContent.style.border = '1px solid #888';
  modalContent.style.width = '80%';
  modalContent.style.maxWidth = '600px';
  modalContent.style.position = 'relative';

  const closeButton = document.createElement('button');
  closeButton.innerHTML = '&times;';
  closeButton.style.position = 'absolute';
  closeButton.style.top = '10px';
  closeButton.style.right = '10px';
  closeButton.style.fontSize = '20px';
  closeButton.style.border = 'none';
  closeButton.style.background = 'none';
  closeButton.style.cursor = 'pointer';
  closeButton.addEventListener('click', function() {
    modal.style.display = 'none'; // Hide the modal
  });

  const productTitle = document.querySelector('.product__title').textContent;

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

  modalContent.appendChild(closeButton);
  modalContent.appendChild(uploadBox);
  modalContent.appendChild(photoUpload);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  // Event listener for the "See Me In This" button
  tryOnButton.addEventListener('click', function(event) {
    event.preventDefault();
    event.stopPropagation();
    modal.style.display = 'flex'; // Show the modal
  });

  // Close the modal when clicking outside of it
  modal.addEventListener('click', function(event) {
    if (event.target === modal) {
      modal.style.display = 'none'; // Hide the modal
    }
  });

  function handleFileUpload(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const humanImg = e.target.result;
      console.log('Image uploaded:', humanImg);
      // Add your image processing logic here
    };
    reader.readAsDataURL(file);
  }

  console.log('Try-on widget fully initialized');
})();
