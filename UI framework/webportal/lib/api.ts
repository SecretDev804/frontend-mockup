const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://3w4cqxw8y1.execute-api.eu-north-1.amazonaws.com/dev";

export type UserStatus = {
  user_id: string;
  status: string;
  sl_avatar_key?: string | null;
  sl_avatar_name?: string | null;
  great_beyond_points?: number;
  tokens?: number;
  rare_tokens?: number;
  vbucks?: number;
};

export async function fetchUserStatus(cognitoSub: string): Promise<UserStatus> {
  const response = await fetch(`${apiBaseUrl}/user/status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cognito_sub: cognitoSub }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error || "Failed to fetch user status.");
  }

  return response.json();
}

// Creature Types
export type BreedingStatus =
  | "not_eligible"
  | "too_young"
  | "ready"
  | "breeding"
  | "cooldown";

export type DecorativeType = "forever" | "eternalz" | "babiez" | null;

export type CreatureLocation = "sl" | "vorest" | "sl_inventory" | "lost";

export type Creature = {
  creature_id: string;
  name: string;
  creature_type: string; // Goobiez, Fuggiez, Friend, Family, Stranger, Babiez, Forever
  age: number;
  munchiez: number; // 0-100
  delivery_days: number; // countdown to next delivery
  is_alive: boolean;
  is_decorative: boolean;
  decorative_type: DecorativeType;
  can_breed: boolean;
  can_send_to_gb: boolean;
  is_hungry: boolean;
  death_reason: string | null;
  death_date: string | null;
  sent_to_beyond: boolean;
  breeding_status: BreedingStatus;
  breeding_cooldown_days: number;
  birth_date: string;
  owner_key: string;
  sl_object_key: string;
  total_active_seconds?: number;
  last_active_timestamp?: string;
  location?: CreatureLocation;
  vorest_entered_at?: string;
  is_paired?: boolean;
  paired_with?: string | null;
};

export type CreatureSummary = {
  total: number;
  alive: number;
  dead: number;
  hungry: number;
  breeding_ready: number;
};


export type PaginationParams = {
  page?: number; // 1-indexed, default: 1
  pageSize?: number; // default: 25, max: 100
};

export type PaginationMeta = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type CreatureListResponse = {
  success: boolean;
  creatures: Creature[];
  summary: CreatureSummary;
  pagination?: PaginationMeta; // Optional for backward compatibility
};

export type CreatureFilters = {
  is_alive?: boolean;
  is_decorative?: boolean;
  creature_type?: string;
  can_breed?: boolean;
};

export type CreatureSort = {
  field: "name" | "age" | "munchiez" | "creature_type" | "birth_date";
  order: "asc" | "desc";
};

// Creature API Functions
export async function fetchCreatureList(
  ownerKey: string,
  filters?: CreatureFilters,
  sort?: CreatureSort,
  pagination?: PaginationParams
): Promise<CreatureListResponse> {
  const response = await fetch(`${apiBaseUrl}/creature/list`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      owner_key: ownerKey,
      filters,
      sort,
      ...(pagination && { page: pagination.page, pageSize: pagination.pageSize }),
    }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error || "Failed to fetch creatures.");
  }

  return response.json();
}

export async function fetchCreatureStats(creatureId: string): Promise<Creature> {
  const response = await fetch(`${apiBaseUrl}/creature/stats`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ creature_id: creatureId }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error || "Failed to fetch creature stats.");
  }

  return response.json();
}


export type MailboxItem = {
  item_id: string;
  item_type: string;
  source_creature_name: string;
  source_creature_type?: string | null;
  delivered_at: string;
};

export type Mailbox = {
  user_uuid: string;
  items: MailboxItem[];
  item_count: number;
  capacity: number;
  is_full: boolean;
  has_items: boolean;
};

export type MailboxResponse = {
  mailbox: Mailbox;
};


export async function fetchMailbox(ownerKey: string): Promise<MailboxResponse> {
  const response = await fetch(`${apiBaseUrl}/mailbox/get`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      owner_key: ownerKey,
      source: "web", // Request full item list for web clients
    }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error || "Failed to fetch mailbox.");
  }

  return response.json();
}


export type FoodItem = {
  food_id: string;
  name: string;
  sl_region: string;
  total_feedings: number;
  remaining_feedings: number;
  munchiez_per_feeding: number;
  is_depleted: boolean;
  is_active: boolean;
  access_mode: "owner" | "all" | "group";
  total_feedings_given: number;
  creatures_fed_count: number;
  last_feeding_at: string | null;
  created_at: string;
};

export type FoodFilters = {
  is_active?: boolean;
  is_depleted?: boolean;
  access_mode?: string;
};

export type FoodSort = {
  field: "name" | "remaining_feedings" | "created_at" | "last_feeding_at";
  order: "asc" | "desc";
};

export type FoodSummary = {
  total: number;
  active: number;
  depleted: number;
  inStorage: number;
};

export type FoodListResponse = {
  success: boolean;
  food_items: FoodItem[];
  summary: FoodSummary;
  pagination?: PaginationMeta; // Optional for backward compatibility
};


export async function fetchFoodList(
  ownerKey: string,
  filters?: FoodFilters,
  sort?: FoodSort,
  pagination?: PaginationParams
): Promise<FoodListResponse> {
  const response = await fetch(`${apiBaseUrl}/food/list`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      owner_key: ownerKey,
      filters,
      sort,
      ...(pagination && { page: pagination.page, pageSize: pagination.pageSize }),
    }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error || "Failed to fetch food items.");
  }

  return response.json();
}


export type PedestalBreedingInfo = {
  parent1_name: string;
  parent2_name: string;
  end_date: string;
  success_rate: number;
};

export type PedestalItem = {
  pedestal_id: string;
  name: string;
  sl_region: string;
  status: "available" | "breeding" | "consumed";
  breeding_id?: string;
  breeding_info?: PedestalBreedingInfo;
  consumed_at?: string;
  created_at: string;
};

export type PedestalSummary = {
  total: number;
  available: number;
  breeding: number;
  consumed: number;
};

export type PedestalListResponse = {
  success: boolean;
  pedestals: PedestalItem[];
  summary: PedestalSummary;
};


export async function fetchPedestalList(
  ownerKey: string
): Promise<PedestalListResponse> {
  const response = await fetch(`${apiBaseUrl}/pedestal/list`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      owner_key: ownerKey,
    }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error || "Failed to fetch pedestals.");
  }

  return response.json();
}


export type TransactionType = "earned" | "spent";
export type TransactionSource =
  | "great_beyond"
  | "token_conversion"
  | "admin"
  | "purchase"
  | "hut_factory"
  | "food_purchase";

export type Transaction = {
  transaction_id: string;
  type: TransactionType;
  source: TransactionSource;
  amount: number;
  balance_after: number;
  source_details?: {
    creature_id?: string;
    creature_name?: string;
    creature_type?: string;
    death_reason?: string;
    is_decorative?: boolean;
    decorative_type?: string;
    memorial_won?: boolean;
    memorial_type?: string;
  };
  created_at: string;
};

export type TransactionHistoryResponse = {
  transactions: Transaction[];
  count: number;
  lastKey: string | null;
};

export type RedeemTokensRequest = {
  owner_key: string;
  token_type: "token" | "rare_token";
  quantity: number;
};

export type RedeemTokensResponse = {
  success: boolean;
  tokens_redeemed: number;
  points_added: number;
  new_balance: {
    great_beyond_points: number;
    tokens: number;
    rare_tokens: number;
  };
};


export async function fetchTransactionHistory(
  userId: string,
  limit: number = 20,
  lastKey?: string
): Promise<TransactionHistoryResponse> {
  const params = new URLSearchParams({
    user_id: userId,
    limit: limit.toString(),
  });
  if (lastKey) {
    params.set("lastKey", lastKey);
  }

  const response = await fetch(
    `${apiBaseUrl}/points/history?${params.toString()}`
  );

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error || "Failed to fetch transaction history.");
  }

  return response.json();
}

export async function redeemTokens(
  ownerKey: string,
  tokenType: "token" | "rare_token",
  quantity: number
): Promise<RedeemTokensResponse> {
  const response = await fetch(`${apiBaseUrl}/tokens/redeem`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      owner_key: ownerKey,
      token_type: tokenType,
      quantity,
    }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error || "Failed to redeem tokens.");
  }

  return response.json();
}


export type BoosterType = "resurrect" | "forever" | "eternalz";

export type BoosterItem = {
  booster_id: string;
  booster_type: BoosterType;
  sl_region: string;
  status: "active" | "consumed";
  target_creature_id: string | null;
  target_creature_name: string | null;
  consumed_at: string | null;
  created_at: string;
};

export type BoosterSummary = {
  total: number;
  active: number;
  consumed: number;
};

export type BoosterFilters = {
  booster_type?: string;
  status?: string;
};

export type BoosterListResponse = {
  success: boolean;
  boosters: BoosterItem[];
  summary: BoosterSummary;
};


export async function fetchBoosterList(
  ownerKey: string,
  filters?: BoosterFilters
): Promise<BoosterListResponse> {
  const response = await fetch(`${apiBaseUrl}/booster/list`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ owner_key: ownerKey, filters }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error || "Failed to fetch boosters.");
  }

  return response.json();
}


export type RenameCreatureResponse = {
  message: string;
  creature_id: string;
  name: string;
};

export async function renameCreature(
  creatureId: string,
  newName: string,
  ownerKey: string
): Promise<RenameCreatureResponse> {
  const response = await fetch(`${apiBaseUrl}/creature/rename`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      creature_id: creatureId,
      owner_key: ownerKey,
      new_name: newName,
    }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error || "Failed to rename creature.");
  }

  return response.json();
}


export type ClaimMailboxItemResponse = {
  message: string;
  claimed_item: MailboxItem;
  remaining_count: number;
};

export type ClaimAllMailboxResponse = {
  message: string;
  claimed_items: Array<{
    item_id: string;
    item_type: string;
    source_creature_name: string;
  }>;
  claimed_count: number;
  remaining_count: number;
};

export async function claimMailboxItem(
  ownerKey: string,
  itemId: string
): Promise<ClaimMailboxItemResponse> {
  const response = await fetch(`${apiBaseUrl}/mailbox/claim`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      owner_key: ownerKey,
      item_id: itemId,
    }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error || "Failed to claim mailbox item.");
  }

  return response.json();
}

export async function claimAllMailboxItems(
  ownerKey: string
): Promise<ClaimAllMailboxResponse> {
  const response = await fetch(`${apiBaseUrl}/mailbox/claim`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      owner_key: ownerKey,
      claim_all: true,
    }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error || "Failed to claim mailbox items.");
  }

  return response.json();
}


export type SendToGreatBeyondResponse = {
  success: boolean;
  creature_name: string;
  creature_type: string;
  is_decorative: boolean;
  decorative_type: string | null;
  death_reason: string;
  points_awarded: number;
  total_points: number;
  memorial_won: boolean;
  memorial_type: string | null;
  memorial_delivered: boolean;
  rez_memorial: boolean;
};

export async function sendToGreatBeyond(
  creatureId: string,
  ownerKey: string
): Promise<SendToGreatBeyondResponse> {
  const response = await fetch(`${apiBaseUrl}/creature/send-to-beyond`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      creature_id: creatureId,
      owner_key: ownerKey,
    }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(
      errBody.error || "Failed to send creature to Great Beyond."
    );
  }

  return response.json();
}


export type BreedingParent = {
  id: string;
  name: string;
  type: string;
  owner?: string;
};

export type BreedingTimeRemaining = {
  days: number;
  hours: number;
  isReady: boolean;
};

export type ActiveBreeding = {
  id: string;
  parent1: BreedingParent;
  parent2: BreedingParent;
  startDate: string;
  endDate: string;
  successRate: number;
  compatibility: number;
  status: "in_progress";
  usedPedestal: boolean;
  timeRemaining: BreedingTimeRemaining;
};

export type CompletedBreeding = {
  id: string;
  parent1: { id: string; name: string; type: string };
  parent2: { id: string; name: string; type: string };
  startDate: string;
  endDate: string;
  completedDate: string;
  status: "completed" | "failed" | "cancelled";
  result: {
    successful: boolean;
    reason: string | null;
    offspring: Array<{
      id: string;
      name: string;
      type: string;
      rarity: string;
    }> | null;
  };
};

export type BreedingSessionsResponse = {
  success: boolean;
  activeBreedings: ActiveBreeding[];
  completedBreedings: CompletedBreeding[];
  totalBreedings: number;
};

export type CancelBreedingResponse = {
  success: boolean;
  message: string;
  breeding_id: string;
  parent1_id: string;
  parent2_id: string;
};


export async function fetchBreedingSessions(
  ownerKey: string,
  status?: "in_progress" | "completed" | "failed" | "cancelled" | "all"
): Promise<BreedingSessionsResponse> {
  const params = new URLSearchParams({ owner_key: ownerKey });
  if (status) {
    params.set("status", status);
  }

  const response = await fetch(
    `${apiBaseUrl}/breeding?${params.toString()}`
  );

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error || "Failed to fetch breeding sessions.");
  }

  return response.json();
}

export async function cancelBreeding(
  breedingId: string,
  ownerKey: string
): Promise<CancelBreedingResponse> {
  const response = await fetch(
    `${apiBaseUrl}/breeding/${breedingId}/cancel`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ owner_key: ownerKey }),
    }
  );

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error || "Failed to cancel breeding.");
  }

  return response.json();
}

// Store / Marketplace
export type PurchaseStoreItemResponse = {
  success: boolean;
  message: string;
  item_id: string;
  quantity: number;
  points_spent: number;
  new_balance: number;
};

export async function purchaseStoreItem(
  ownerKey: string,
  itemId: string,
  quantity: number
): Promise<PurchaseStoreItemResponse> {
  const response = await fetch(`${apiBaseUrl}/store/purchase`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      owner_key: ownerKey,
      item_id: itemId,
      quantity,
    }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error || "Failed to purchase item.");
  }

  return response.json();
}

// ═══════════════════════════════════════════════════════════════════
// VOREST (Virtual Forest) Types & API Functions
// ═══════════════════════════════════════════════════════════════════

// Vorest Food
export type VorestFoodItem = {
  food_id: string;
  name: string;
  total_feedings: number;
  remaining_feedings: number;
  munchiez_per_feeding: number;
  is_depleted: boolean;
  total_feedings_given: number;
  purchased_with: "vbucks" | "gbp";
  purchase_price: number;
  created_at: string;
  updated_at: string;
  last_feeding_at: string | null;
};

export type VorestFoodSummary = {
  total: number;
  active: number;
  depleted: number;
};

export type VorestFoodListResponse = {
  success: boolean;
  food_items: VorestFoodItem[];
  summary: VorestFoodSummary;
};

export type PurchaseVorestFoodResponse = {
  success: boolean;
  food_id: string;
  name: string;
  remaining_feedings: number;
  currency_spent: number;
  new_balance: number;
};

export type ConsumeVorestFoodResponse = {
  success: boolean;
  creature_id: string;
  food_id: string;
  new_munchiez: number;
  remaining_feedings: number;
};

// Vorest Boosters
export type VorestBoosterType = "resurrect" | "forever" | "eternalz";

export type VorestBooster = {
  booster_id: string;
  booster_type: VorestBoosterType;
  is_used: boolean;
  purchased_with: "vbucks" | "gbp";
  purchase_price: number;
  applied_to?: string | null;
  created_at: string;
  used_at?: string | null;
};

export type VorestBoosterSummary = {
  total: number;
  unused: number;
  used_by_type: Record<string, number>;
};

export type VorestBoosterListResponse = {
  success: boolean;
  boosters: VorestBooster[];
  summary: VorestBoosterSummary;
};

export type PurchaseVorestBoosterResponse = {
  success: boolean;
  booster_id: string;
  booster_type: VorestBoosterType;
  currency_spent: number;
  new_balance: number;
};

export type ApplyVorestBoosterResponse = {
  success: boolean;
  creature_id: string;
  booster_type: VorestBoosterType;
  effect_applied: string;
};

// Vorest Transfer
export type SendToVorestResponse = {
  success: boolean;
  creature_id: string;
  creature_name: string;
  creature_type: string;
  location: "vorest";
  transfer_id: string;
};

export type RetrieveFromVorestResponse = {
  success: boolean;
  creature_id: string;
  creature_name: string;
  creature_type: string;
  age: number;
  munchiez: number;
  total_active_seconds: number;
  location: "sl";
  transfer_id: string;
};

// Vbucks
export type VbucksTransaction = {
  transaction_id: string;
  type: "purchased" | "spent";
  amount: number;
  balance_after: number;
  source: string;
  source_details?: Record<string, unknown>;
  created_at: string;
};

export type VbucksBalanceResponse = {
  vbucks: number;
  recent_transactions: VbucksTransaction[];
};

// Vorest API Functions
export async function fetchVorestCreatureList(
  ownerKey: string,
  filters?: CreatureFilters,
  sort?: CreatureSort,
  pagination?: PaginationParams
): Promise<CreatureListResponse> {
  const response = await fetch(`${apiBaseUrl}/vorest/creatures/list`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      owner_key: ownerKey,
      filters,
      sort,
      ...(pagination && { page: pagination.page, pageSize: pagination.pageSize }),
    }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error || "Failed to fetch Vorest creatures.");
  }

  return response.json();
}

export async function fetchVorestFoodList(
  ownerKey: string
): Promise<VorestFoodListResponse> {
  const response = await fetch(`${apiBaseUrl}/vorest/food/list`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ owner_key: ownerKey }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error || "Failed to fetch Vorest food.");
  }

  return response.json();
}

export async function purchaseVorestFood(
  ownerKey: string,
  currency: "vbucks" | "gbp",
  quantity: number = 1
): Promise<PurchaseVorestFoodResponse> {
  const response = await fetch(`${apiBaseUrl}/vorest/food/purchase`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ owner_key: ownerKey, currency, quantity }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error || "Failed to purchase Vorest food.");
  }

  return response.json();
}

export async function consumeVorestFood(
  foodId: string,
  creatureId: string,
  ownerKey: string
): Promise<ConsumeVorestFoodResponse> {
  const response = await fetch(`${apiBaseUrl}/vorest/food/consume`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      food_id: foodId,
      creature_id: creatureId,
      owner_key: ownerKey,
    }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error || "Failed to feed Vorest creature.");
  }

  return response.json();
}

export async function sendCreatureToVorest(
  creatureId: string,
  ownerKey: string
): Promise<SendToVorestResponse> {
  const response = await fetch(`${apiBaseUrl}/creature/send-to-vorest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      creature_id: creatureId,
      owner_key: ownerKey,
    }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error || "Failed to send creature to Vorest.");
  }

  return response.json();
}

export async function retrieveCreatureFromVorest(
  creatureId: string,
  ownerKey: string
): Promise<RetrieveFromVorestResponse> {
  const response = await fetch(`${apiBaseUrl}/creature/retrieve-from-vorest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      creature_id: creatureId,
      owner_key: ownerKey,
    }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error || "Failed to retrieve creature from Vorest.");
  }

  return response.json();
}

export async function startVorestBreeding(
  parent1Id: string,
  parent2Id: string,
  ownerKey: string
): Promise<{ success: boolean; breeding_id: string }> {
  const response = await fetch(`${apiBaseUrl}/vorest/breeding/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      parent1_id: parent1Id,
      parent2_id: parent2Id,
      owner_key: ownerKey,
    }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error || "Failed to start Vorest breeding.");
  }

  return response.json();
}

export async function fetchVbucksBalance(
  ownerKey: string
): Promise<VbucksBalanceResponse> {
  const response = await fetch(`${apiBaseUrl}/vbucks/balance`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ owner_key: ownerKey }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error || "Failed to fetch Vbucks balance.");
  }

  return response.json();
}

export async function fetchVorestBoosterList(
  ownerKey: string
): Promise<VorestBoosterListResponse> {
  const response = await fetch(`${apiBaseUrl}/vorest/booster/list`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ owner_key: ownerKey }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error || "Failed to fetch Vorest boosters.");
  }

  return response.json();
}

export async function purchaseVorestBooster(
  ownerKey: string,
  boosterType: VorestBoosterType,
  currency: "vbucks" | "gbp"
): Promise<PurchaseVorestBoosterResponse> {
  const response = await fetch(`${apiBaseUrl}/vorest/booster/purchase`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      owner_key: ownerKey,
      booster_type: boosterType,
      currency,
    }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error || "Failed to purchase Vorest booster.");
  }

  return response.json();
}

export async function applyVorestBooster(
  boosterId: string,
  creatureId: string,
  ownerKey: string
): Promise<ApplyVorestBoosterResponse> {
  const response = await fetch(`${apiBaseUrl}/vorest/booster/apply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      booster_id: boosterId,
      creature_id: creatureId,
      owner_key: ownerKey,
    }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error || "Failed to apply Vorest booster.");
  }

  return response.json();
}

// Game Config
export type GameConfig = Record<string, number | boolean>;

export async function fetchGameConfig(): Promise<GameConfig> {
  const response = await fetch(`${apiBaseUrl}/config/get`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch game config.");
  }

  const data = await response.json();
  return data.config;
}
