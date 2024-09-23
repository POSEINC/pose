import { TryOnWidget } from '../../app/components/TryOnWidget';

export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/javascript');
  res.status(200).send(`
    const TryOnWidget = ${TryOnWidget.toString()};
    window.TryOnWidget = {
      init: function(container, product) {
        ReactDOM.render(
          React.createElement(TryOnWidget, {
            productImage: product.image,
            initialTryOnImage: null,
            productName: product.name
          }),
          container
        );
      }
    };
  `);
}
