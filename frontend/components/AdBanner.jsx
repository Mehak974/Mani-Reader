'use client';
import React from 'react';

/**
 * Auto-Reloading Premium Iframe Ad Banner Component (468x60)
 */
export default function AdBanner() {
  const [refreshKey, setRefreshKey] = React.useState(0);

  // Auto reload ads every 10 seconds to maximize impressions
  React.useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="ad-container-wrapper" style={{ margin: '16px auto', display: 'flex', justifyContent: 'center', width: '100%', overflow: 'hidden', minHeight: '60px' }}>
      <div key={`iframe-ad-${refreshKey}`} style={{ display: 'flex', justifyContent: 'center', width: '100%', overflow: 'hidden' }}>
        <iframe
          src="about:blank"
          title="Advertisement"
          style={{ border: 'none', width: '468px', height: '60px', overflow: 'hidden' }}
          ref={(iframe) => {
            if (!iframe) return;
            const doc = iframe.contentDocument || iframe.contentWindow.document;
            doc.open();
            doc.write(`
              <html>
                <body style="margin:0;padding:0;display:flex;justify-content:center;align-items:center;background:transparent;overflow:hidden;">
                  <script>
                    atOptions = {
                      'key' : '448b00c4da75ea8f5084afe1e2f607dd',
                      'format' : 'iframe',
                      'height' : 60,
                      'width' : 468,
                      'params' : {}
                    };
                  </script>
                  <script src="https://wraththreat.com/448b00c4da75ea8f5084afe1e2f607dd/invoke.js"></script>
                </body>
              </html>
            `);
            doc.close();
          }}
        />
      </div>
    </div>
  );
}
