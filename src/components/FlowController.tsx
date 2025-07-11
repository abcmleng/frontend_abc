import React, { useState } from 'react';
import { useFlowConfig } from '../hooks/useFlowConfig';

interface FlowControllerProps {
  userId: string;
  onComplete: () => void;
}

export const FlowController: React.FC<FlowControllerProps> = ({ userId, onComplete }) => {
  const { flowConfig, loading, error } = useFlowConfig(userId);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (loading) {
    return <div>Loading flow configuration...</div>;
  }

  if (error) {
    return <div>Error loading flow configuration: {error.message}</div>;
  }

  if (!flowConfig || flowConfig.length === 0) {
    return <div>No flow configuration available.</div>;
  }

  const currentStep = flowConfig[currentStepIndex];

  const goToNextStep = () => {
    if (currentStepIndex < flowConfig.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      onComplete();
    }
  };

  // Render the current step component based on the step identifier
  // For demonstration, we just render the step name and a Next button
  // You should replace this with actual page components and logic

  return (
    <div>
      <h2>Current Step: {currentStep}</h2>
      <button onClick={goToNextStep}>Next</button>
    </div>
  );
};
