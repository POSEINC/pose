(function() {
  console.log('Shopify widget script started');

  // Create the "See Me In This" button
  const tryOnButton = document.createElement('button');
  tryOnButton.textContent = 'See Me In This';
  tryOnButton.style.marginBottom = '10px';
  tryOnButton.className = 'button button--full-width button--primary';

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
  modal.style.display = 'none';
  modal.style.position = 'fixed';
  modal.style.zIndex = '1000';
  modal.style.left = '0';
  modal.style.top = '0';
  modal.style.width = '100%';
  modal.style.height = '100%';
  modal.style.backgroundColor = 'rgba(0,0,0,0.5)';

  const modalContent = document.createElement('div');
  modalContent.style.backgroundColor = '#fefefe';
  modalContent.style.margin = '15% auto';
  modalContent.style.padding = '20px';
  modalContent.style.border = '1px solid #888';
  modalContent.style.width = '80%';
  modalContent.style.maxWidth = '500px';

  modalContent.innerHTML = `
    <h2>Upload Your Photo</h2>
    <input type="file" id="photoUpload" accept="image/*">
    <button id="submitPhoto">Try On</button>
    <div id="tryOnResult"></div>
  `;

  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  // Event listener for the "See Me In This" button
  tryOnButton.addEventListener('click', function() {
    modal.style.display = 'block';
  });

  // Close the modal when clicking outside of it
  modal.addEventListener('click', function(event) {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });

  // Handle photo upload and try-on
  document.getElementById('submitPhoto').addEventListener('click', async function() {
    const fileInput = document.getElementById('photoUpload');
    if (fileInput.files && fileInput.files[0]) {
      const reader = new FileReader();
      reader.onload = async function(e) {
        const humanImg = e.target.result;
        const garmImg = document.querySelector('.product__media img').src;
        const garmentDes = document.querySelector('.product__title').textContent;

        document.getElementById('tryOnResult').innerHTML = 'Processing...';

        console.log('Sending data to API:', { garmImg, humanImg, garmentDes });

        try {
          console.log('Attempting to fetch from API...');
          const response = await fetch('https://shopify-virtual-tryon-app.vercel.app/api/try-on', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Origin': window.location.origin
            },
            body: JSON.stringify({ garmImg, humanImg, garmentDes }),
          });

          console.log('Fetch response received:', response);

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
          }

          const data = await response.json();
          document.getElementById('tryOnResult').innerHTML = `
            <p>Here's how you might look in this item:</p>
            <img src="${data.output}" style="max-width: 100%; height: auto;">
          `;
        } catch (error) {
          console.error('Detailed error:', error);
          document.getElementById('tryOnResult').innerHTML = `An error occurred while processing the image: ${error.message}`;
          if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
            console.log('This might be a CORS issue or the server is not responding');
          }
        }
      };
      reader.readAsDataURL(fileInput.files[0]);
    } else {
      alert('Please select a photo first.');
    }
  });

  console.log('Try-on widget fully initialized');
})();
