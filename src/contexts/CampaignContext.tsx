'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface Reward {
    id: string;
    title: string;
    description?: string | null;
    minAmount: number;
    estimatedDelivery?: string | null;
    availability?: 'AVAILABLE' | 'DEVELOPMENT';
}

type DonationType = 'general' | 'reward';

interface CampaignContextType {
    showPaymentModal: boolean;
    donationType: DonationType;
    selectedReward: Reward | null;
    openGeneralDonation: () => void;
    openRewardDonation: (reward: Reward) => void;
    restoreDonation: (donationType: DonationType, reward: Reward | null) => void;
    closeModal: () => void;
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

export function useCampaignContext() {
    const context = useContext(CampaignContext);
    if (!context) {
        throw new Error('useCampaignContext must be used within a CampaignProvider');
    }
    return context;
}

interface CampaignProviderProps {
    children: ReactNode;
}

export function CampaignProvider({ children }: CampaignProviderProps) {
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [donationType, setDonationType] = useState<DonationType>('general');
    const [selectedReward, setSelectedReward] = useState<Reward | null>(null);

    const openGeneralDonation = () => {
        setDonationType('general');
        setSelectedReward(null);
        setShowPaymentModal(true);
    };

    const openRewardDonation = (reward: Reward) => {
        setDonationType('reward');
        setSelectedReward(reward);
        setShowPaymentModal(true);
    };

    const restoreDonation = (type: DonationType, reward: Reward | null) => {
        setDonationType(type);
        setSelectedReward(type === 'reward' ? reward : null);
        setShowPaymentModal(true);
    };

    const closeModal = () => {
        setShowPaymentModal(false);
        setSelectedReward(null);
    };

    return (
        <CampaignContext.Provider
            value={{
                showPaymentModal,
                donationType,
                selectedReward,
                openGeneralDonation,
                openRewardDonation,
                restoreDonation,
                closeModal,
            }}
        >
            {children}
        </CampaignContext.Provider>
    );
}