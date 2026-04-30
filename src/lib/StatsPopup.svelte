<script lang="ts">
  import { onMount } from "svelte";
  import { dbService } from "./firebase";
  import { fade, scale } from "svelte/transition";

  export let onClose: () => void;

  let isLoading = true;
  let totalTokens = 0;
  let prizesList: string[] = [];
  let lastResetDate: Date | null = null;
  let isResetting = false;

  const playerId = localStorage.getItem("playerName") || "Learner";

  async function loadData() {
    isLoading = true;
    try {
      const [profileRes, recordsRes] = await Promise.all([
        dbService.getPlayerProfile(playerId),
        dbService.getPlayerRecords(playerId)
      ]);

      if (profileRes.success && profileRes.data.lastResetDate) {
        lastResetDate = profileRes.data.lastResetDate.toDate();
      } else {
        lastResetDate = null; // No reset yet, count everything
      }

      if (recordsRes.success && recordsRes.data) {
        let tokens = 0;
        let prizes: string[] = [];

        recordsRes.data.forEach((record: any) => {
          let recordDate = record.date?.toDate ? record.date.toDate() : new Date();

          if (!lastResetDate || recordDate > lastResetDate) {
            tokens += record.tokens || 0;
            if (Array.isArray(record.prizes)) {
              prizes = [...prizes, ...record.prizes];
            }
          }
        });

        totalTokens = tokens;
        prizesList = prizes.filter(p => p && p !== "No prize unlocked yet");
      }
    } catch (e) {
      console.error(e);
    }
    isLoading = false;
  }

  async function handleReset() {
    if (confirm("Are you sure you want to reset your token and prize count? (This won't delete past records, only resets the active count on this device).")) {
      isResetting = true;
      await dbService.resetPlayerCount(playerId);
      await loadData();
      isResetting = false;
    }
  }

  onMount(() => {
    loadData();
  });
</script>

<div class="backdrop" transition:fade={{ duration: 200 }} on:click={onClose}>
  <div class="panel" transition:scale={{ duration: 200, start: 0.95 }} on:click|stopPropagation>
    <header>
      <h2>Your Rewards Bank</h2>
      <button class="close-btn" on:click={onClose}>&times;</button>
    </header>

    <div class="content">
      {#if isLoading}
        <div class="loading">Loading data from Firebase...</div>
      {:else}
        <div class="stats-card tokens-card">
          <span class="label">Total Tokens Earned</span>
          <span class="value">{totalTokens} <span class="coin">🪙</span></span>
        </div>

        <div class="stats-card prizes-card">
          <span class="label">Prizes Unlocked</span>
          {#if prizesList.length === 0}
            <p class="empty-msg">No prizes unlocked yet since last reset.</p>
          {:else}
            <ul class="prize-list">
              {#each prizesList as prize}
                <li>🎁 {prize}</li>
              {/each}
            </ul>
          {/if}
        </div>

        <div class="date-info">
          {#if lastResetDate}
             <p>Counting rewards since: {lastResetDate.toLocaleString()}</p>
          {:else}
             <p>Counting all-time records.</p>
          {/if}
        </div>

        <div class="actions">
          <button class="reset-btn" on:click={handleReset} disabled={isResetting}>
            {isResetting ? 'Resetting...' : 'Reset Count'}
          </button>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  .panel {
    background: #fff;
    width: 90%;
    max-width: 480px;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    overflow: hidden;
  }
  header {
    background: #f8f9fa;
    padding: 1.25rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #e1e8ed;
  }
  header h2 {
    margin: 0;
    color: #2c3e50;
    font-size: 1.3rem;
  }
  .close-btn {
    background: none;
    border: none;
    font-size: 1.8rem;
    color: #7f8c8d;
    cursor: pointer;
    line-height: 1;
    padding: 0;
  }
  .close-btn:hover {
    color: #e74c3c;
  }
  .content {
    padding: 1.5rem;
  }
  .loading {
    text-align: center;
    color: #7f8c8d;
    padding: 2rem 0;
  }
  .stats-card {
    background: #f8f9fa;
    border: 1px solid #e1e8ed;
    border-radius: 8px;
    padding: 1.25rem;
    margin-bottom: 1.25rem;
  }
  .label {
    display: block;
    font-size: 0.95rem;
    color: #7f8c8d;
    margin-bottom: 0.5rem;
    font-weight: 600;
    text-transform: uppercase;
  }
  .tokens-card .value {
    font-size: 2.2rem;
    font-weight: bold;
    color: #f39c12;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .prize-list {
    margin: 0;
    padding: 0;
    list-style: none;
    max-height: 150px;
    overflow-y: auto;
  }
  .prize-list li {
    padding: 0.5rem 0;
    border-bottom: 1px solid #eee;
    color: #2c3e50;
  }
  .prize-list li:last-child {
    border-bottom: none;
  }
  .empty-msg {
    color: #95a5a6;
    font-style: italic;
    margin: 0;
  }
  .date-info {
    text-align: center;
    font-size: 0.85rem;
    color: #95a5a6;
    margin-bottom: 1.5rem;
  }
  .actions {
    text-align: center;
  }
  .reset-btn {
    background: #e74c3c;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    font-weight: bold;
    cursor: pointer;
    transition: background 0.2s;
  }
  .reset-btn:hover {
    background: #c0392b;
  }
  .reset-btn:disabled {
    background: #95a5a6;
    cursor: not-allowed;
  }
</style>