"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import { usePathname } from "next/navigation";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FlowTourLauncher } from "./components/FlowTourLauncher";
import { TourLayer } from "./components/TourLayer";
import { getFlow, getFlowsForRoute, getVisibleSteps } from "./flows";
import { GET_USER_FLOW_LAYOUT, UPSERT_USER_FLOW_LAYOUT } from "./gql";
import { markAutoShown, wasAutoShown } from "./seenStorage";
import { useUserRole } from "./useUserRole";
import {
  FlowDefinition,
  FlowProgressStatus,
  FlowStatus,
  UpsertUserFlowLayoutInput,
  UserFlowLayout,
  UserFlowLayoutQueryData,
} from "./interface";

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

const TRANSITION_MS = 200;

export const FlowTourProvider = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const role = useUserRole();

  const { data, loading } = useQuery<UserFlowLayoutQueryData>(
    GET_USER_FLOW_LAYOUT,
    { fetchPolicy: "cache-and-network" }
  );
  const [upsertFlow] = useMutation(UPSERT_USER_FLOW_LAYOUT);

  const [activeFlowKey, setActiveFlowKey] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  // Índices (na lista visível) pulados em runtime — alvo ausente/vazio ou gating de
  // item. Descontados da numeração exibida (sem buraco no "X de N").
  const [skipped, setSkipped] = useState<Set<number>>(new Set());
  // Durante o fade-out a camada continua montada (isExiting) por ~200ms antes de sair.
  const [closing, setClosing] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Troca de step: fade-out do atual e, após a transição, monta o próximo (fade-in
  // na nova posição). Evita que a caixa/spotlight "deslize" entre steps.
  const [transitioning, setTransitioning] = useState(false);
  const stepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Sentido da última navegação (1 = avançar, -1 = voltar). Usado para auto-pular um
  // step cujo alvo nunca monta, seguindo a direção em que o usuário estava indo.
  const directionRef = useRef(1);

  const progressByKey = useMemo(() => {
    const map = new Map<string, UserFlowLayout>();
    data?.userFlowLayout?.data?.forEach((item) => map.set(item.flowKey, item));
    return map;
  }, [data]);

  const activeFlow = activeFlowKey ? getFlow(activeFlowKey) : undefined;
  // Steps visíveis para o role atual. Todo o motor opera sobre esta lista.
  const visibleSteps = useMemo(
    () => (activeFlow ? getVisibleSteps(activeFlow, role) : []),
    [activeFlow, role]
  );
  const total = visibleSteps.length;

  const persist = useCallback(
    (
      flowKey: string,
      version: number,
      status: FlowStatus,
      lastStep: number
    ) => {
      const input: UpsertUserFlowLayoutInput = {
        flowKey,
        status,
        lastStep,
        version,
      };
      upsertFlow({
        variables: { input },
        refetchQueries: [{ query: GET_USER_FLOW_LAYOUT }],
      })
        .then((res) => {
          // O back responde no envelope { status, code, ... }; status false = não salvou.
          const result = (
            res.data as { upsertUserFlowLayout?: { status?: boolean } } | null
          )?.upsertUserFlowLayout;
          if (result && result.status === false) {
            console.warn(
              "[flowTour] progresso NÃO salvo no back:",
              result,
              input
            );
          }
        })
        .catch((error) => {
          // Falha de rede não quebra a navegação; o tour já rodou. Logamos.
          console.warn(
            "[flowTour] erro ao salvar progresso no back:",
            error,
            input
          );
        });
    },
    [upsertFlow]
  );

  // Inicia o fade-out: mantém montado com isExiting e só desmonta após a transição.
  const stop = useCallback(() => {
    setClosing(true);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setActiveFlowKey(null);
      setActiveIndex(0);
      setClosing(false);
    }, TRANSITION_MS);
  }, []);

  const startFlow = useCallback(
    (flowKey: string, atIndex = 0) => {
      const flow = getFlow(flowKey);
      if (!flow) return;
      // Clampa no nº de steps visíveis para o role (não no total bruto da definição).
      const steps = getVisibleSteps(flow, role);
      if (steps.length === 0) return;
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
      setClosing(false);
      setTransitioning(false);
      directionRef.current = 1;
      // Pré-calcula os steps que já dá pra saber que serão pulados, para o total já
      // sair certo. O que não der pra saber aqui é ajustado em runtime.
      const initialSkipped = new Set<number>();
      if (typeof document !== "undefined") {
        steps.forEach((s, i) => {
          const missingRequired =
            s.requireSelector && !document.querySelector(s.requireSelector);
          const blockedByPresent =
            s.skipIfSelector && document.querySelector(s.skipIfSelector);
          if (missingRequired || blockedByPresent) initialSkipped.add(i);
        });
      }
      setSkipped(initialSkipped);
      setActiveFlowKey(flowKey);
      setActiveIndex(Math.min(Math.max(atIndex, 0), steps.length - 1));
    },
    [role]
  );

  // Fade-out do step atual → troca de índice → fade-in do próximo na nova posição.
  // `durationMs` permite avanço quase imediato ao PULAR um step.
  const goToStep = useCallback(
    (
      resolveIndex: (current: number) => number,
      durationMs: number = TRANSITION_MS
    ) => {
      setTransitioning(true);
      if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
      stepTimerRef.current = setTimeout(() => {
        setActiveIndex((index) => resolveIndex(index));
        setTransitioning(false);
      }, durationMs);
    },
    []
  );

  const handleClose = useCallback(() => {
    // Fechou no meio → pending + last_step (retoma na próxima visita).
    if (activeFlow)
      persist(activeFlow.key, activeFlow.version, "pending", activeIndex);
    stop();
  }, [activeFlow, activeIndex, persist, stop]);

  const handleNext = useCallback(() => {
    if (!activeFlow || transitioning) return;
    directionRef.current = 1;
    if (activeIndex >= total - 1) {
      persist(activeFlow.key, activeFlow.version, "completed", activeIndex);
      stop();
      return;
    }
    goToStep((index) => index + 1);
  }, [activeFlow, activeIndex, total, persist, stop, goToStep, transitioning]);

  const handlePrev = useCallback(() => {
    if (transitioning) return;
    directionRef.current = -1;
    goToStep((index) => Math.max(0, index - 1));
  }, [goToStep, transitioning]);

  // Alvo do step atual não montou (gating de item / modo de edição): pula no sentido
  // da navegação em vez de prender o usuário num overlay sem caixa.
  const handleTargetMissing = useCallback(() => {
    if (!activeFlow || transitioning) return;
    setSkipped((prev) => {
      const next = new Set(prev);
      next.add(activeIndex);
      return next;
    });
    if (directionRef.current >= 0) {
      if (activeIndex >= total - 1) {
        persist(activeFlow.key, activeFlow.version, "completed", activeIndex);
        stop();
        return;
      }
      goToStep((index) => index + 1, 0);
      return;
    }
    if (activeIndex <= 0) {
      if (total > 1) {
        directionRef.current = 1;
        goToStep((index) => index + 1, 0);
      } else {
        stop();
      }
      return;
    }
    goToStep((index) => index - 1, 0);
  }, [activeFlow, activeIndex, total, persist, stop, goToStep, transitioning]);

  // Step apareceu de fato — desmarca um eventual pré-cálculo de "pulado" deste índice.
  const handleTargetFound = useCallback(() => {
    setSkipped((prev) => {
      if (!prev.has(activeIndex)) return prev;
      const next = new Set(prev);
      next.delete(activeIndex);
      return next;
    });
  }, [activeIndex]);

  // Status agregado de um fluxo para a biblioteca: novo / em andamento / concluído.
  const getFlowProgress = useCallback(
    (
      flow: FlowDefinition
    ): { status: FlowProgressStatus; lastStep: number } => {
      const progress = progressByKey.get(flow.key);
      if (!progress || progress.version < flow.version)
        return { status: "new", lastStep: 0 };
      if (progress.status === "completed")
        return { status: "completed", lastStep: 0 };
      if (progress.status === "pending")
        return { status: "pending", lastStep: progress.lastStep };
      return { status: "new", lastStep: 0 };
    },
    [progressByKey]
  );

  // Auto-start dos fluxos com autoStart na rota atual (uma vez por rota).
  const autoStartedRoutesRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (loading || autoStartedRoutesRef.current.has(pathname)) return;

    const candidates = getFlowsForRoute(pathname, role).filter(
      (flow) => flow.autoStart
    );
    autoStartedRoutesRef.current.add(pathname);
    if (candidates.length === 0) return;

    // Auto-start dispara só na 1ª vez por versão. Suprime se houver QUALQUER registro
    // da versão atual no back OU se já foi auto-exibido neste navegador (guard local).
    const toRun = candidates.find((flow) => {
      const progress = progressByKey.get(flow.key);
      const seenOnServer = !!progress && progress.version >= flow.version;
      return !seenOnServer && !wasAutoShown(flow.key, flow.version);
    });
    if (!toRun) return;

    const timeout = setTimeout(() => {
      markAutoShown(toRun.key, toRun.version);
      persist(toRun.key, toRun.version, "pending", 0);
      startFlow(toRun.key, 0);
    }, 400);
    return () => clearTimeout(timeout);
  }, [pathname, role, loading, progressByKey, persist, startFlow]);

  const step = visibleSteps[activeIndex];

  // Numeração exibida descontando os steps já pulados.
  const skippedBefore = Array.from(skipped).filter(
    (index) => index < activeIndex
  ).length;
  const displayTotal = Math.max(1, total - skipped.size);
  const displayCurrent = Math.min(
    displayTotal,
    activeIndex + 1 - skippedBefore
  );

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
          isExiting={closing || transitioning}
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
