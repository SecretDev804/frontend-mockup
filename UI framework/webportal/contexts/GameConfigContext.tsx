"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { fetchGameConfig, type GameConfig } from "@/lib/api";

const DEFAULT_CONFIG: GameConfig = {
  creature_max_age: 100,
  age_increase_per_day: 1,
  munchiez_max: 100,
  munchiez_decrease: 10,
  munchiez_death: 0,
  munchiez_warning: 20,
  food_restore: 25,
  delivery_interval: 12,
  breeding_min_age: 4,
  breeding_cooldown: 4,
  breeding_duration_days: 3,
  babiez_chance_base: 10,
  babiez_chance_pedestal: 75,
  great_beyond_points_per_age: 1,
  starvation_death_points: 25,
  memorial_chance: 5,
  gb_points_babiez: 200,
  gb_points_forever: 1000,
  gb_points_hut: 1000,
  container_gb_points: 50,
  resurrect_munchiez_reset: 20,
  resurrect_cooldown_days: 3,
  resurrect_max_per_creature: 3,
  drop_goobiez_friend: 30,
  drop_goobiez_family: 30,
  drop_goobiez_stranger: 5,
  drop_goobiez_fuggiez: 5,
  drop_goobiez_babiez: 1,
  drop_goobiez_token: 10,
  drop_goobiez_rare_token: 0.5,
  drop_goobiez_slox: 10,
  drop_goobiez_monthly: 8.5,
  drop_fuggiez_fuggiez: 60,
  drop_fuggiez_stranger: 5,
  drop_fuggiez_babiez: 5,
  drop_fuggiez_goobiez: 1,
  drop_fuggiez_token: 10,
  drop_fuggiez_rare_token: 0.5,
  drop_fuggiez_slox: 10,
  drop_fuggiez_monthly: 8.5,
  mailbox_capacity: 20,
  mailbox_items_expire: false,
  hut_creature_cost: 5000,
  stats_poll_interval: 300,
  inactive_threshold: 600,
  slox_rotation_days: 90,
  slox_items_count: 12,
  food_total_feedings: 12,
  food_munchiez_per_feeding: 30,
  food_cost_points: 2000,
  food_feeding_threshold: 70,
  food_feeding_range: 20,
  // Vorest config
  vorest_food_total_feedings: 12,
  vorest_food_munchiez_per_feeding: 30,
  vorest_food_price_vbucks: 50,
  vorest_food_price_gbp: 500,
  vorest_resurrect_price_vbucks: 200,
  vorest_resurrect_price_gbp: 2000,
  vorest_forever_price_vbucks: 300,
  vorest_forever_price_gbp: 3000,
  vorest_eternalz_price_vbucks: 150,
  vorest_eternalz_price_gbp: 1500,
  vbucks_per_linden: 1,
};

type GameConfigContextType = {
  cfg: (key: string) => number | boolean;
  isLoading: boolean;
};

const GameConfigContext = createContext<GameConfigContextType | null>(null);

export function GameConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<GameConfig>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchGameConfig()
      .then((data) => setConfig({ ...DEFAULT_CONFIG, ...data }))
      .catch(() => setConfig(DEFAULT_CONFIG))
      .finally(() => setIsLoading(false));
  }, []);

  const cfg = useCallback(
    (key: string): number | boolean => {
      if (key in config) return config[key];
      if (key in DEFAULT_CONFIG) return DEFAULT_CONFIG[key];
      return 0;
    },
    [config]
  );

  const value = useMemo<GameConfigContextType>(
    () => ({ cfg, isLoading }),
    [cfg, isLoading]
  );

  return (
    <GameConfigContext.Provider value={value}>
      {children}
    </GameConfigContext.Provider>
  );
}

export function useGameConfig(): GameConfigContextType {
  const ctx = useContext(GameConfigContext);
  if (!ctx) {
    throw new Error("useGameConfig must be used within a GameConfigProvider");
  }
  return ctx;
}
