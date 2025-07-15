import React from 'react';
import { Platform } from 'react-native';
import { Head } from 'expo-router';

interface WebHeadProps {
  title?: string;
  description?: string;
  image?: string;
  favicon?: string;
}

/**
 * WebHead - A component for managing web-specific head metadata
 * Improves SEO and social sharing capabilities
 */
export default function WebHead({
  title = 'RoadSide+ | Roadside Assistance Dashboard',
  description = 'Manage your roadside assistance services with our comprehensive dashboard',
  image = '/images/Main Brand Logo.png',
  favicon = '/images/Main Brand Logo.png'
}: WebHeadProps) {
  // Only render on web platform
  if (Platform.OS !== 'web') {
    return null;
  }

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      
      {/* Favicon */}
      <link rel="icon" type="image/png" sizes="32x32" href={favicon} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Mobile viewport optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      
      {/* PWA capabilities */}
      <meta name="theme-color" content="#0f172a" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      
      {/* Preconnect to important domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    </Head>
  );
}
