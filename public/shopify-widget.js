(function() {
  console.log('Shopify widget script started');

  // Create a container for our widget
  const container = document.createElement('div');
  container.id = 'shopify-try-on-widget';
  console.log('Widget container created');
  
  // Find the element we want to insert our widget after
  const referenceNode = document.querySelector('.product__info-wrapper');
  if (referenceNode && referenceNode.parentNode) {
    referenceNode.parentNode.insertBefore(container, referenceNode.nextSibling);
    console.log('Widget container inserted into DOM');
  } else {
    console.error('Could not find a suitable location to insert the widget');
    return;
  }

  // Add debug element
  const debugElement = document.createElement('div');
  debugElement.textContent = 'Widget script loaded';
  debugElement.style.backgroundColor = 'red';
  debugElement.style.color = 'white';
  debugElement.style.padding = '10px';
  debugElement.style.margin = '10px 0';
  document.body.appendChild(debugElement);

  // Load React and ReactDOM
  const script1 = document.createElement('script');
  script1.src = 'https://unpkg.com/react@17/umd/react.production.min.js';
  const script2 = document.createElement('script');
  script2.src = 'https://unpkg.com/react-dom@17/umd/react-dom.production.min.js';

  // Load our widget bundle
  const script3 = document.createElement('script');
  script3.src = 'https://shopify-virtual-tryon-app.vercel.app/api/widget-bundle';

  document.body.appendChild(script1);
  document.body.appendChild(script2);
  document.body.appendChild(script3);

  console.log('Scripts appended to body');

  // Initialize the widget once everything is loaded
  script3.onload = function() {
    console.log('Widget bundle loaded');
    if (typeof TryOnWidget !== 'undefined' && TryOnWidget.init) {
      const product = {
        id: meta.product.id,
        name: meta.product.title,
        image: meta.product.featured_image
      };
      console.log('Initializing widget with product:', product);
      TryOnWidget.init(document.getElementById('shopify-try-on-widget'), product);
    } else {
      console.error('TryOnWidget not found or init method not available');
    }
  };
})();
