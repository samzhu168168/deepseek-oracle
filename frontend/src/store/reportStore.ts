import { create } from 'zustand';
import type { FullReportData } from '../components/LicenseKeyModal';

interface ReportState {
  // Modal states
  emailUnlocked: boolean;
  fullReportData: FullReportData | null;
  licenseModalOpen: boolean;
  emailGateModalOpen: boolean;
  paywallModalOpen: boolean;
  
  // Actions
  setEmailUnlocked: (unlocked: boolean) => void;
  setFullReportData: (data: FullReportData | null) => void;
  setLicenseModalOpen: (open: boolean) => void;
  setEmailGateModalOpen: (open: boolean) => void;
  setPaywallModalOpen: (open: boolean) => void;
  
  // Reset all modals
  resetModals: () => void;
}

export const useReportStore = create<ReportState>((set) => ({
  // Initial state
  emailUnlocked: false,
  fullReportData: null,
  licenseModalOpen: false,
  emailGateModalOpen: false,
  paywallModalOpen: false,
  
  // Actions
  setEmailUnlocked: (unlocked: boolean) => set({ emailUnlocked: unlocked }),
  setFullReportData: (data: FullReportData | null) => set({ fullReportData: data }),
  setLicenseModalOpen: (open: boolean) => set({ licenseModalOpen: open }),
  setEmailGateModalOpen: (open: boolean) => set({ emailGateModalOpen: open }),
  setPaywallModalOpen: (open: boolean) => set({ paywallModalOpen: open }),
  
  resetModals: () => set({
    licenseModalOpen: false,
    emailGateModalOpen: false,
    paywallModalOpen: false,
  }),
}));
