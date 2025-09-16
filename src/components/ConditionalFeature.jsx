import React from 'react';
import FeatureFlags from '@/lib/featureFlags';

const ConditionalFeature = ({ flag, children }) => {
  if (FeatureFlags[flag]) {
    return <>{children}</>;
  }
  return null;
};

export default ConditionalFeature;