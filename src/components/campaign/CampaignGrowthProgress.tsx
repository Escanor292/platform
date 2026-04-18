'use client';

import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { SeedlingTree, GrowingTree, MatureTree, FruitingTree } from './TreeStages';

interface CampaignGrowthProgressProps {
  currentAmount: number;
  goalAmount: number;
  showTree?: boolean;
  showAnimatedHead?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact';
  className?: string;
}

type Size = 'sm' | 'md' | 'lg';
type Variant = 'default' | 'compact';
type StageId = 'seedling' | 'growing' | 'mature' | 'fruiting';
type TreeComponent = React.ComponentType<{ className?: string }>;

type StageMeta = {
  id: StageId;
  label: string;
  textColor: string;
  fillGradient: string;
  glowGradient: string;
  orbGradient: string;
  orbGlow: string;
  Tree: TreeComponent;
};

type SizeConfig = {
  cardPadding: string;
  amountClass: string;
  percentClass: string;
  labelClass: string;
  targetClass: string;
  barHeight: string;
  orbSize: string;
  treeZoneWidth: string;
  treeWrapHeight: string;
  treeSize: string;
  infoMaxWidth: string;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const STAGES: Record<StageId, StageMeta> = {
  seedling: {
    id: 'seedling',
    label: 'Mầm hy vọng',
    textColor: 'text-emerald-600',
    fillGradient: 'from-emerald-400 via-green-500 to-emerald-600',
    glowGradient: 'from-emerald-300/0 via-emerald-400/20 to-green-500/0',
    orbGradient: 'from-white via-emerald-50 to-emerald-100',
    orbGlow: 'shadow-[0_0_30px_rgba(52,211,153,0.35)]',
    Tree: SeedlingTree,
  },
  growing: {
    id: 'growing',
    label: 'Đang lớn mạnh',
    textColor: 'text-green-600',
    fillGradient: 'from-emerald-400 via-green-500 to-lime-500',
    glowGradient: 'from-emerald-300/0 via-green-400/22 to-lime-400/0',
    orbGradient: 'from-white via-green-50 to-lime-100',
    orbGlow: 'shadow-[0_0_34px_rgba(74,222,128,0.36)]',
    Tree: GrowingTree,
  },
  mature: {
    id: 'mature',
    label: 'Sắp đơm trái',
    textColor: 'text-emerald-700',
    fillGradient: 'from-emerald-500 via-green-500 to-lime-400',
    glowGradient: 'from-emerald-300/0 via-lime-300/24 to-lime-200/0',
    orbGradient: 'from-white via-lime-50 to-emerald-100',
    orbGlow: 'shadow-[0_0_36px_rgba(132,204,22,0.34)]',
    Tree: MatureTree,
  },
  fruiting: {
    id: 'fruiting',
    label: 'Đã kết trái',
    textColor: 'text-emerald-700',
    fillGradient: 'from-emerald-500 via-lime-500 to-amber-400',
    glowGradient: 'from-emerald-300/0 via-amber-300/24 to-yellow-200/0',
    orbGradient: 'from-white via-amber-50 to-yellow-100',
    orbGlow: 'shadow-[0_0_40px_rgba(250,204,21,0.36)]',
    Tree: FruitingTree,
  },
};

const SIZE_MAP: Record<Size, SizeConfig> = {
  sm: {
    cardPadding: 'px-5 py-4',
    amountClass: 'text-base',
    percentClass: 'text-base',
    labelClass: 'text-[9px]',
    targetClass: 'text-xs',
    barHeight: 'h-2',
    orbSize: 'w-2.5 h-2.5',
    treeZoneWidth: 'w-8',
    treeWrapHeight: 'h-14',
    treeSize: 'w-8 h-11',
    infoMaxWidth: 'max-w-[80px]',
  },
  md: {
    cardPadding: 'px-6 py-5',
    amountClass: 'text-xl',
    percentClass: 'text-xl',
    labelClass: 'text-[9px]',
    targetClass: 'text-sm',
    barHeight: 'h-2.5',
    orbSize: 'w-3 h-3',
    treeZoneWidth: 'w-10',
    treeWrapHeight: 'h-16',
    treeSize: 'w-10 h-14',
    infoMaxWidth: 'max-w-[100px]',
  },
  lg: {
    cardPadding: 'px-8 py-6',
    amountClass: 'text-2xl',
    percentClass: 'text-2xl',
    labelClass: 'text-[10px]',
    targetClass: 'text-base',
    barHeight: 'h-3',
    orbSize: 'w-3.5 h-3.5',
    treeZoneWidth: 'w-12',
    treeWrapHeight: 'h-20',
    treeSize: 'w-12 h-17',
    infoMaxWidth: 'max-w-[120px]',
  },
};

function getStage(rawProgress: number): StageMeta {
  if (rawProgress >= 100) return STAGES.fruiting;
  if (rawProgress >= 66) return STAGES.mature;
  if (rawProgress >= 33) return STAGES.growing;
  return STAGES.seedling;
}

function TreeZone({
  stage,
  size,
  reducedMotion,
  sizeVariant,
}: {
  stage: StageMeta;
  size: SizeConfig;
  reducedMotion: boolean;
  sizeVariant: Size;
}) {
  const Tree = stage.Tree;
  const bottomClass = sizeVariant === 'lg' ? 'bottom-3' : 'bottom-1';

  return (
    <div className={`${size.treeZoneWidth} flex shrink-0 items-end justify-start`}>
      <div className={`relative ${size.treeWrapHeight} w-full`}>
        <motion.div
          className={`absolute ${bottomClass} left-0`}
          animate={
            reducedMotion
              ? undefined
              : {
                  y: [0, -1.5, 0],
                  rotate: [0, -0.4, 0.4, 0],
                }
          }
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Tree className={`${size.treeSize} drop-shadow-sm`} />
        </motion.div>
      </div>
    </div>
  );
}

function ProgressHead({
  stage,
  size,
  completed,
  reducedMotion,
}: {
  stage: StageMeta;
  size: SizeConfig;
  completed: boolean;
  reducedMotion: boolean;
}) {
  return (
    <div className="absolute right-0 top-0 bottom-0 w-6 overflow-visible">
      {/* Growing tip - organic pulsing */}
      <motion.div
        className="absolute right-0 top-0 bottom-0 w-full"
        animate={reducedMotion ? undefined : {
          scaleX: [1, 1.12, 1],
          scaleY: [1, 1.06, 1],
        }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Strong radial glow at tip - main energy source */}
        <motion.div
          className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/30 rounded-full blur-xl"
          animate={reducedMotion ? undefined : {
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        {/* Secondary glow ring */}
        <motion.div
          className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 rounded-full blur-lg"
          animate={reducedMotion ? undefined : {
            scale: [1, 1.3, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.3,
          }}
        />

        {/* Bright core at tip */}
        <motion.div
          className="absolute right-0 top-0 bottom-0 w-full bg-gradient-to-l from-white/40 via-white/15 to-transparent rounded-r-full"
          animate={reducedMotion ? undefined : {
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        {/* Sharp edge highlight */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-3/4 bg-gradient-to-l from-white/70 to-transparent rounded-r-full" />

        {/* Energy burst rays */}
        {!reducedMotion && (
          <>
            {/* Top ray */}
            <motion.div
              className="absolute right-0 top-[20%] h-[1.5px] w-5 bg-gradient-to-r from-white/40 to-transparent rounded-full"
              animate={{
                width: ['16px', '24px', '16px'],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.1,
              }}
            />
            {/* Middle ray */}
            <motion.div
              className="absolute right-0 top-[50%] h-[2px] w-6 bg-gradient-to-r from-white/50 to-transparent rounded-full"
              animate={{
                width: ['20px', '28px', '20px'],
                opacity: [0.4, 0.7, 0.4],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            {/* Bottom ray */}
            <motion.div
              className="absolute right-0 top-[80%] h-[1.5px] w-5 bg-gradient-to-r from-white/40 to-transparent rounded-full"
              animate={{
                width: ['16px', '24px', '16px'],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.4,
              }}
            />
          </>
        )}

        {/* Energy particles bursting out */}
        {!reducedMotion && (
          <>
            <motion.div
              className="absolute right-0 top-[20%] w-1.5 h-1.5 rounded-full bg-white/60"
              animate={{
                x: [0, 12, 18],
                y: [0, -6, -10],
                opacity: [0, 0.7, 0],
                scale: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                ease: 'easeOut',
                delay: 0.2,
              }}
            />
            <motion.div
              className="absolute right-0 top-[50%] w-2 h-2 rounded-full bg-white/70"
              animate={{
                x: [0, 16, 22],
                y: [0, 0, 0],
                opacity: [0, 0.8, 0],
                scale: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                ease: 'easeOut',
                delay: 0.5,
              }}
            />
            <motion.div
              className="absolute right-0 top-[80%] w-1.5 h-1.5 rounded-full bg-white/60"
              animate={{
                x: [0, 12, 18],
                y: [0, 6, 10],
                opacity: [0, 0.7, 0],
                scale: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                ease: 'easeOut',
                delay: 0.8,
              }}
            />
          </>
        )}
      </motion.div>
    </div>
  );
}

function CompactProgress({
  currentAmount,
  visualProgress,
  rawProgress,
  stage,
  size,
  showAnimatedHead,
  reducedMotion,
  className,
}: {
  currentAmount: number;
  visualProgress: number;
  rawProgress: number;
  stage: StageMeta;
  size: SizeConfig;
  showAnimatedHead: boolean;
  reducedMotion: boolean;
  className: string;
}) {
  const formatProgress = (progress: number) => {
    if (progress >= 1000) return `${(progress / 1000).toFixed(1)}K%`;
    return `${progress.toFixed(0)}%`;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-bold text-slate-700">{formatCurrency(currentAmount)}</div>
        <div className={`text-sm font-black ${stage.textColor}`}>{formatProgress(rawProgress)}</div>
      </div>

      <div className="relative">
        {/* Outer glow effect */}
        {visualProgress > 0 && (
          <motion.div
            className={`absolute left-0 top-1/2 h-[200%] -translate-y-1/2 rounded-full bg-gradient-to-r ${stage.glowGradient} blur-lg`}
            style={{ width: `${visualProgress}%` }}
            animate={
              reducedMotion
                ? undefined
                : { opacity: [0.12, 0.22, 0.12], scale: [1, 1.008, 1] }
            }
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        <div className={`relative w-full rounded-full border border-slate-200 bg-slate-100 ${size.barHeight} overflow-visible`}>
          <motion.div
            initial={false}
            animate={{ width: `${visualProgress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`relative h-full rounded-full bg-gradient-to-r ${stage.fillGradient} overflow-visible`}
          >
            {/* Top highlight */}
            <div className="absolute inset-0 rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.3),rgba(255,255,255,0)_50%)]" />
            
            {/* Soft glow along the edges - makes bar feel alive */}
            <motion.div
              className="absolute inset-x-0 top-0 h-full bg-gradient-to-b from-white/15 to-transparent rounded-full"
              animate={reducedMotion ? undefined : {
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.div
              className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-white/10 to-transparent rounded-full"
              animate={reducedMotion ? undefined : {
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.5,
              }}
            />
            
            {/* Pulsing veins/energy flow inside bar */}
            {!reducedMotion && visualProgress > 5 && (
              <>
                <motion.div
                  className="absolute left-0 top-[35%] h-[1px] bg-gradient-to-r from-white/0 via-white/60 to-white/0"
                  style={{ width: '100%' }}
                  animate={{
                    opacity: [0.3, 0.7, 0.3],
                    scaleX: [0.8, 1, 0.8],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
                <motion.div
                  className="absolute left-0 top-[65%] h-[1px] bg-gradient-to-r from-white/0 via-white/50 to-white/0"
                  style={{ width: '100%' }}
                  animate={{
                    opacity: [0.2, 0.6, 0.2],
                    scaleX: [0.9, 1, 0.9],
                  }}
                  transition={{
                    duration: 2.3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 0.5,
                  }}
                />
              </>
            )}
            
            {/* Shimmer effect 1 - fast */}
            {!reducedMotion && visualProgress > 5 && (
              <motion.div
                className="absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ['-100%', '300%'] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                  repeatDelay: 1,
                }}
              />
            )}
            
            {/* Shimmer effect 2 - slow */}
            {!reducedMotion && visualProgress > 10 && (
              <motion.div
                className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ['-120%', '320%'] }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: 'linear',
                  delay: 0.5,
                }}
              />
            )}

            {/* Flowing particles effect - like cells */}
            {!reducedMotion && visualProgress > 15 && (
              <>
                <motion.div
                  className="absolute top-[20%] w-1 h-1 rounded-full bg-white/50"
                  animate={{ 
                    x: ['-10%', '110%'],
                    opacity: [0, 0.8, 0.8, 0],
                    scale: [0.5, 1, 1, 0.5],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 0.3,
                  }}
                />
                <motion.div
                  className="absolute top-[60%] w-1 h-1 rounded-full bg-white/50"
                  animate={{ 
                    x: ['-10%', '110%'],
                    opacity: [0, 0.8, 0.8, 0],
                    scale: [0.5, 1, 1, 0.5],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 1,
                  }}
                />
                <motion.div
                  className="absolute top-[40%] w-1 h-1 rounded-full bg-white/40"
                  animate={{ 
                    x: ['-10%', '110%'],
                    opacity: [0, 0.7, 0.7, 0],
                    scale: [0.5, 1, 1, 0.5],
                  }}
                  transition={{
                    duration: 2.8,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 1.8,
                  }}
                />
              </>
            )}

            {/* Breathing/pulsing effect - like living organism */}
            {!reducedMotion && visualProgress > 0 && (
              <motion.div
                className={`absolute inset-0 rounded-full bg-gradient-to-r ${stage.fillGradient} opacity-0`}
                animate={{ 
                  opacity: [0, 0.2, 0],
                  scale: [1, 1.01, 1],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            )}

            {showAnimatedHead && visualProgress > 0 && (
              <ProgressHead
                stage={stage}
                size={size}
                completed={rawProgress >= 100}
                reducedMotion={reducedMotion}
              />
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export const CampaignGrowthProgress: React.FC<CampaignGrowthProgressProps> = ({
  currentAmount,
  goalAmount,
  showTree = true,
  showAnimatedHead = true,
  size = 'md',
  variant = 'default',
  className = '',
}) => {
  const reducedMotion = Boolean(useReducedMotion());
  const sizeConfig = SIZE_MAP[size];

  const rawProgress = useMemo(() => {
    if (goalAmount <= 0) return 0;
    return (currentAmount / goalAmount) * 100;
  }, [currentAmount, goalAmount]);

  const visualProgress = clamp(rawProgress, 0, 100);
  const stage = getStage(rawProgress);

  if (variant === 'compact') {
    return (
      <CompactProgress
        currentAmount={currentAmount}
        visualProgress={visualProgress}
        rawProgress={rawProgress}
        stage={stage}
        size={sizeConfig}
        showAnimatedHead={showAnimatedHead}
        reducedMotion={reducedMotion}
        className={className}
      />
    );
  }

  return (
    <div
      className={`rounded-2xl bg-white shadow-sm border border-slate-100 ${sizeConfig.cardPadding} ${className}`}
    >
      {/* 3-column grid: amount column | info column | tree column */}
      <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] gap-x-1 items-start">
        {/* Row 1: Amount block */}
        <div className="min-w-0">
          <div
            className={`${sizeConfig.amountClass} truncate font-bold leading-tight text-slate-900`}
          >
            {formatCurrency(currentAmount)}
          </div>
          <div
            className={`${sizeConfig.labelClass} mt-1 font-semibold uppercase tracking-wider text-slate-400`}
          >
            Đã huy động
          </div>
        </div>

        {/* Row 1: Percent block */}
        <div className="text-right pr-3">
          <div
            className={`${sizeConfig.percentClass} font-bold leading-tight ${stage.textColor}`}
          >
            {rawProgress >= 1000 ? `${(rawProgress / 1000).toFixed(1)}K%` : `${rawProgress.toFixed(1)}%`}
          </div>
          <div
            className={`${sizeConfig.labelClass} mt-1 font-semibold uppercase tracking-wider ${stage.textColor}`}
          >
            {stage.label}
          </div>
        </div>

        {/* Row 1-3: Tree zone (spans multiple rows) */}
        <div className="row-span-3 flex items-center justify-start -ml-4">
          {showTree ? (
            <TreeZone stage={stage} size={sizeConfig} reducedMotion={reducedMotion} sizeVariant={size} />
          ) : (
            <div className={sizeConfig.treeZoneWidth} />
          )}
        </div>

        {/* Row 2: Progress bar (spans 2 columns) */}
        <div className="col-span-2 mt-2">
          <div className="relative">
            {/* Outer glow effect */}
            {visualProgress > 0 && (
              <motion.div
                className={`absolute left-0 top-1/2 h-[180%] -translate-y-1/2 rounded-full bg-gradient-to-r ${stage.glowGradient} blur-lg`}
                style={{ width: `${visualProgress}%` }}
                animate={
                  reducedMotion
                    ? undefined
                    : { opacity: [0.08, 0.16, 0.08], scale: [1, 1.005, 1] }
                }
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}

            <div
              className={`relative w-full rounded-full border border-slate-200 bg-slate-50 ${sizeConfig.barHeight} overflow-visible`}
            >
              <motion.div
                initial={false}
                animate={{ width: `${visualProgress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={`relative h-full rounded-full bg-gradient-to-r ${stage.fillGradient} overflow-visible`}
              >
                {/* Top highlight */}
                <div className="absolute inset-0 rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.3),rgba(255,255,255,0)_50%)]" />
                
                {/* Soft glow along the edges - makes bar feel alive */}
                <motion.div
                  className="absolute inset-x-0 top-0 h-full bg-gradient-to-b from-white/15 to-transparent rounded-full"
                  animate={reducedMotion ? undefined : {
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
                <motion.div
                  className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-white/10 to-transparent rounded-full"
                  animate={reducedMotion ? undefined : {
                    opacity: [0.2, 0.4, 0.2],
                  }}
                  transition={{
                    duration: 2.8,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 0.5,
                  }}
                />
                
                {/* Pulsing veins/energy flow inside bar */}
                {!reducedMotion && visualProgress > 5 && (
                  <>
                    <motion.div
                      className="absolute left-0 top-[35%] h-[1px] bg-gradient-to-r from-white/0 via-white/60 to-white/0"
                      style={{ width: '100%' }}
                      animate={{
                        opacity: [0.3, 0.7, 0.3],
                        scaleX: [0.8, 1, 0.8],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                    <motion.div
                      className="absolute left-0 top-[65%] h-[1px] bg-gradient-to-r from-white/0 via-white/50 to-white/0"
                      style={{ width: '100%' }}
                      animate={{
                        opacity: [0.2, 0.6, 0.2],
                        scaleX: [0.9, 1, 0.9],
                      }}
                      transition={{
                        duration: 2.3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: 0.5,
                      }}
                    />
                  </>
                )}

                {/* Shimmer effect 1 - fast */}
                {!reducedMotion && visualProgress > 5 && (
                  <motion.div
                    className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ['-100%', '300%'] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'linear',
                      repeatDelay: 1,
                    }}
                  />
                )}
                
                {/* Shimmer effect 2 - slow */}
                {!reducedMotion && visualProgress > 10 && (
                  <motion.div
                    className="absolute inset-y-0 w-28 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ['-120%', '320%'] }}
                    transition={{
                      duration: 3.5,
                      repeat: Infinity,
                      ease: 'linear',
                      delay: 0.5,
                    }}
                  />
                )}

                {/* Flowing particles effect - like cells */}
                {!reducedMotion && visualProgress > 15 && (
                  <>
                    <motion.div
                      className="absolute top-[25%] w-1.5 h-1.5 rounded-full bg-white/50"
                      animate={{ 
                        x: ['-10%', '110%'],
                        opacity: [0, 0.8, 0.8, 0],
                        scale: [0.5, 1, 1, 0.5],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: 0.3,
                      }}
                    />
                    <motion.div
                      className="absolute top-[65%] w-1.5 h-1.5 rounded-full bg-white/50"
                      animate={{ 
                        x: ['-10%', '110%'],
                        opacity: [0, 0.8, 0.8, 0],
                        scale: [0.5, 1, 1, 0.5],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: 1,
                      }}
                    />
                    <motion.div
                      className="absolute top-[45%] w-1 h-1 rounded-full bg-white/40"
                      animate={{ 
                        x: ['-10%', '110%'],
                        opacity: [0, 0.7, 0.7, 0],
                        scale: [0.5, 1, 1, 0.5],
                      }}
                      transition={{
                        duration: 2.8,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: 1.8,
                      }}
                    />
                  </>
                )}

                {/* Breathing/pulsing effect - like living organism */}
                {!reducedMotion && visualProgress > 0 && (
                  <motion.div
                    className={`absolute inset-0 rounded-full bg-gradient-to-r ${stage.fillGradient} opacity-0`}
                    animate={{ 
                      opacity: [0, 0.2, 0],
                      scale: [1, 1.01, 1],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                )}

                {showAnimatedHead && visualProgress > 0 && (
                  <ProgressHead
                    stage={stage}
                    size={sizeConfig}
                    completed={rawProgress >= 100}
                    reducedMotion={reducedMotion}
                  />
                )}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Row 3: Footer - Target label */}
        <div className="mt-3">
          <div
            className={`${sizeConfig.labelClass} font-semibold uppercase tracking-wider text-slate-400`}
          >
            Mục tiêu
          </div>
        </div>

        {/* Row 3: Footer - Target amount */}
        <div className="mt-3 text-right pr-3">
          <div className={`${sizeConfig.targetClass} font-semibold text-slate-600`}>
            {formatCurrency(goalAmount)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignGrowthProgress;
