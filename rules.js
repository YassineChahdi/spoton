// Pure rules engine for Spot On (Liar's Dice variant).
// Face order: 1 (lowest, wild) < 2 < 3 < 4 < 5 < 6.

function rollDice(n) {
  const out = [];
  for (let i = 0; i < n; i++) out.push(Math.floor(Math.random() * 6) + 1);
  return out;
}

function countMatching(allDice, bidFace) {
  return allDice.filter(d => d === bidFace || (bidFace !== 1 && d === 1)).length;
}

function isValidRaise(newBid, prevBid, lockedToOnes) {
  if (!newBid) return false;
  if (!Number.isInteger(newBid.quantity) || newBid.quantity < 1) return false;
  if (!Number.isInteger(newBid.face) || newBid.face < 1 || newBid.face > 6) return false;
  if (!prevBid) return true;
  if (lockedToOnes) {
    return newBid.face === 1 && newBid.quantity > prevBid.quantity;
  }
  if (newBid.face === 1) return false;
  if (newBid.face < prevBid.face) return false;
  if (newBid.quantity < prevBid.quantity) return false;
  if (newBid.face === prevBid.face && newBid.quantity === prevBid.quantity) return false;
  return true;
}

function resolveLiar(bid, allDice) {
  const actualCount = countMatching(allDice, bid.face);
  const bidHolds = actualCount >= bid.quantity;
  return { actualCount, bidHolds, loser: bidHolds ? 'caller' : 'bidder' };
}

function resolveSpotOn(bid, allDice) {
  const actualCount = countMatching(allDice, bid.face);
  const exact = actualCount === bid.quantity;
  return { actualCount, exact, diceChange: exact ? +1 : -1 };
}

function nextAlivePlayer(players, fromIdx) {
  const n = players.length;
  for (let step = 1; step <= n; step++) {
    const i = (fromIdx + step) % n;
    if (players[i].alive) return i;
  }
  return fromIdx;
}

function nextStarter(players, diceChangePlayerIdx) {
  if (players[diceChangePlayerIdx].alive) return diceChangePlayerIdx;
  return nextAlivePlayer(players, diceChangePlayerIdx);
}

function applyDiceChange(currentCount, delta) {
  const raw = currentCount + delta;
  return { newCount: Math.max(0, raw), eliminated: raw <= 0 };
}

function gameWinner(players) {
  const alive = players.filter(p => p.alive);
  if (alive.length === 1) return alive[0];
  if (alive.length === 0) return null;
  return false;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    rollDice, countMatching, isValidRaise,
    resolveLiar, resolveSpotOn,
    nextAlivePlayer, nextStarter,
    applyDiceChange, gameWinner,
  };
}
