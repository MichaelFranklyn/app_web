"use client";

import { createContext, ReactNode, useContext } from "react";

import { FlowTourLauncher } from "./components/FlowTourLauncher";
import { TourLayer } from "./components/TourLayer";
import { FlowDefinition, FlowProgressStatus } from "./interface";
import { useFlowTourEngine } from "./useFlowTourEngine";

interface FlowTourContextValue {
  startFlow: (flowKey: string, atIndex?: number) => void;
  // Status agregado + onde retomar, para a biblioteca de fluxos do lançador.
  getFlowProgress: (flow: FlowDefinition) => {
    status: FlowProgressStatus;
    lastStep: number;
  };
  activeFlowKey: string | null;
}

const FlowTourContext = createContext<FlowTourContextValue | null>(null);

export const useFlowTourLauncher = () => {
  const context = useContext(FlowTourContext);
  if (!context)
    throw new Error("useFlowTourLauncher must be used within FlowTourProvider");
  return context;
};

export const FlowTourProvider = ({ children }: { children: ReactNode }) => {
  const {
    startFlow,
    getFlowProgress,
    activeFlowKey,
    activeFlow,
    step,
    activeIndex,
    total,
    displayCurrent,
    displayTotal,
    isExiting,
    handlePrev,
    handleNext,
    handleClose,
    handleTargetMissing,
    handleTargetFound,
  } = useFlowTourEngine();

  return (
    <FlowTourContext.Provider
      value={{ startFlow, getFlowProgress, activeFlowKey }}
    >
      {children}

      <FlowTourLauncher />

      {activeFlow && step && (
        <TourLayer
          key={`${activeFlow.key}-${activeIndex}`}
          step={step}
          current={displayCurrent}
          total={displayTotal}
          isFirst={activeIndex === 0}
          isLast={activeIndex === total - 1}
          isExiting={isExiting}
          onPrev={handlePrev}
          onNext={handleNext}
          onClose={handleClose}
          onTargetMissing={handleTargetMissing}
          onTargetFound={handleTargetFound}
        />
      )}
    </FlowTourContext.Provider>
  );
};
