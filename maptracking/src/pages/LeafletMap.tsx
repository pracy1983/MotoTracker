import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

import 'leaflet/dist/leaflet.css';
import '@fortawesome/fontawesome-svg-core/styles.css';
import Head from 'next/head';

// Dynamically import LeafletMap on the client side
const LeafletMap = dynamic(() => import('../_map'), { ssr: false });

const IndexPage = () => {
  return (
    <div>
      <Head>
        <link rel="stylesheet" href="/styles.css" />
      </Head>
      <LeafletMap />
      {/* Add other content or components as needed */}
    </div>
  );
};

export default IndexPage;
