(function() {
  // Create a container for our widget
  const container = document.createElement('div');
  container.id = 'shopify-try-on-widget';
  
  // Find the element we want to insert our widget after
  const referenceNode = document.querySelector('.product__info-wrapper');
  if (referenceNode && referenceNode.parentNode) {
    referenceNode.parentNode.insertBefore(container, referenceNode.nextSibling);
  } else {
    console.error('Could not find a suitable location to insert the widget');
    return;
  }

  // Load React and ReactDOM
  const script1 = document.createElement('script');
  script1.src = 'https://unpkg.com/react@17/umd/react.production.min.js';
  const script2 = document.createElement('script');
  script2.src = 'https://unpkg.com/react-dom@17/umd/react-dom.production.min.js';

  // Load our widget bundle
  const script3 = document.createElement('script');
  script3.src = 'https://shopify-virtual-tryon-app.vercel.app/widget-bundle.js';

  document.body.appendChild(script1);
  document.body.appendChild(script2);
  document.body.appendChild(script3);

  // Initialize the widget once everything is loaded
  script3.onload = function() {
    if (typeof TryOnWidget !== 'undefined' && TryOnWidget.init) {
      const product = {
        id: meta.product.id,
        name: meta.product.title,
        image: meta.product.featured_image
      };
      TryOnWidget.init(document.getElementById('shopify-try-on-widget'), product);
    } else {
      console.error('TryOnWidget not found or init method not available');
    }
  };
})();
