import { create } from "zustand";
import type { ArchitectureResponse, Provider, ServiceCategory } from "@/lib/schemas";

interface SelectedServices {
  [categoryName: string]: Provider;
}

interface ArchitectureState {
  isLoading: boolean;
  error: string | null;
  architectureData: ArchitectureResponse | null;
  selectedServices: SelectedServices;
  totalMonthlyCost: number;

  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setArchitectureData: (data: ArchitectureResponse) => void;
  selectService: (categoryName: string, provider: Provider) => void;
  reset: () => void;
}

function computeDefaultSelections(
  categories: ServiceCategory[]
): SelectedServices {
  const selections: SelectedServices = {};
  for (const category of categories) {
    const cheapest = category.services.reduce((prev, curr) =>
      curr.monthlyEstimatedCost < prev.monthlyEstimatedCost ? curr : prev
    );
    selections[category.categoryName] = cheapest.provider;
  }
  return selections;
}

function computeTotalCost(
  categories: ServiceCategory[],
  selectedServices: SelectedServices
): number {
  return categories.reduce((total, category) => {
    const selectedProvider = selectedServices[category.categoryName];
    const service = category.services.find((s) => s.provider === selectedProvider);
    return total + (service?.monthlyEstimatedCost ?? 0);
  }, 0);
}

export const useArchitectureStore = create<ArchitectureState>((set, get) => ({
  isLoading: false,
  error: null,
  architectureData: null,
  selectedServices: {},
  totalMonthlyCost: 0,

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  setArchitectureData: (data) => {
    const defaultSelections = computeDefaultSelections(data.categories);
    const totalCost = computeTotalCost(data.categories, defaultSelections);
    set({
      architectureData: data,
      selectedServices: defaultSelections,
      totalMonthlyCost: totalCost,
      isLoading: false,
      error: null,
    });
  },

  selectService: (categoryName, provider) => {
    const { architectureData, selectedServices } = get();
    if (!architectureData) return;

    const newSelections = { ...selectedServices, [categoryName]: provider };
    const newTotal = computeTotalCost(architectureData.categories, newSelections);

    set({
      selectedServices: newSelections,
      totalMonthlyCost: newTotal,
    });
  },

  reset: () =>
    set({
      isLoading: false,
      error: null,
      architectureData: null,
      selectedServices: {},
      totalMonthlyCost: 0,
    }),
}));
