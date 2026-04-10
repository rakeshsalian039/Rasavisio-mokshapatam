// ═══ AUTH HOOK + DATABASE SERVICE ═══
//
// useAuth() — React hook for Google/Apple sign-in
// GameDB — Service for saving/loading game data
//
// Usage in components:
//   const { user, profile, signInGoogle, signInApple, signOut, loading } = useAuth();
//   await GameDB.saveGame(user.id, gameData);
//   const history = await GameDB.getHistory(user.id);

import { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabaseClient";
import { error as logError } from "../utils/logger";

// ═══ AUTH HOOK ═══
export function useAuth() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
      setLoading(false);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) await loadProfile(session.user.id);
        else setProfile(null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    setProfile(data);
  };

  const signInGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin }
    });
    if (error) logError("Google sign-in error:", error);
  }, []);

  const signInApple = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: { redirectTo: window.location.origin }
    });
    if (error) logError("Apple sign-in error:", error);
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await loadProfile(user.id);
  }, [user]);

  return { user, profile, signInGoogle, signInApple, signOut, loading, refreshProfile };
}

// ═══ GAME DATABASE SERVICE ═══
export const GameDB = {
  // Save a completed game
  async saveGame(userId, gameData) {
    if (!userId) return null;
    try {
      // 1. Insert game history
      const { data: game, error: gameErr } = await supabase
        .from("game_history")
        .insert({
          user_id: userId,
          duration_seconds: gameData.duration || 0,
          total_turns: gameData.turns || 0,
          character_name: gameData.characterName || "Seeker",
          character_icon: gameData.characterIcon || "🔱",
          opponent_type: gameData.opponentType || "yama",
          result: gameData.result || "quit",
          final_square: gameData.finalSquare || 1,
          final_punya: gameData.punya || 0,
          final_papa: gameData.papa || 0,
          snakes_hit: gameData.snakesHit || 0,
          ladders_climbed: gameData.laddersClimbed || 0,
          dharma_cards_faced: gameData.dharmaFaced || 0,
          riddles_correct: gameData.riddlesCorrect || 0,
          riddles_wrong: gameData.riddlesWrong || 0,
          highest_square: gameData.highestSquare || 1,
          ashtanga_reached: gameData.ashtangaReached || false,
          moksha_rejected: gameData.mokshaRejected || 0,
        })
        .select()
        .single();
      
      if (gameErr) throw gameErr;

      // 2. Update profile stats
      const isWin = gameData.result === "moksha_win" || gameData.result === "karma_win";
      const { error: profErr } = await supabase.rpc("update_profile_stats", {
        p_user_id: userId,
        p_punya: gameData.punya || 0,
        p_papa: gameData.papa || 0,
        p_is_win: isWin,
        p_is_moksha: gameData.result === "moksha_win",
        p_is_karma: gameData.result === "karma_win",
        p_highest: gameData.highestSquare || 1,
        p_snakes: gameData.snakesHit || 0,
        p_ladders: gameData.laddersClimbed || 0,
        p_riddles_c: gameData.riddlesCorrect || 0,
        p_riddles_w: gameData.riddlesWrong || 0,
        p_character: gameData.characterName || "Seeker",
      });

      // Fallback if RPC doesn't exist yet — direct update
      if (profErr) {
        await supabase
          .from("profiles")
          .update({
            total_games: supabase.sql`total_games + 1`,
            total_wins: isWin ? supabase.sql`total_wins + 1` : undefined,
            total_punya_earned: supabase.sql`total_punya_earned + ${gameData.punya || 0}`,
            total_papa_earned: supabase.sql`total_papa_earned + ${gameData.papa || 0}`,
            last_played_at: new Date().toISOString(),
          })
          .eq("id", userId);
      }

      return game;
    } catch (err) {
      logError("Save game error:", err);
      return null;
    }
  },

  // Get user's game history (last 20 games)
  async getHistory(userId, limit = 20) {
    if (!userId) return [];
    const { data } = await supabase
      .from("game_history")
      .select("*")
      .eq("user_id", userId)
      .order("played_at", { ascending: false })
      .limit(limit);
    return data || [];
  },

  // Get leaderboard
  async getLeaderboard(limit = 50) {
    const { data } = await supabase
      .from("leaderboard")
      .select("*")
      .limit(limit);
    return data || [];
  },

  // Get user stats summary
  async getStats(userId) {
    if (!userId) return null;
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    return data;
  },
};
