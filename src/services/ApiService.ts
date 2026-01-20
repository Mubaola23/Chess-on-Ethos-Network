const BASE_URL = 'http://localhost:3001/api';

export const ApiService = {
  async sendInvitation(data: any) {
    const res = await fetch(`${BASE_URL}/invitations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getInvitations(address: string) {
    const res = await fetch(`${BASE_URL}/invitations/${address}`);
    return res.json();
  },

  async respondToInvitation(id: string, status: string) {
    const res = await fetch(`${BASE_URL}/invitations/${id}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  async getGame(id: string) {
    const res = await fetch(`${BASE_URL}/games/${id}`);
    return res.json();
  },

  async getActiveGames(address: string) {
    const res = await fetch(`${BASE_URL}/users/${address}/games`);
    return res.json();
  },

  async makeMove(id: string, move: any, playerAddress: string) {
    const res = await fetch(`${BASE_URL}/games/${id}/move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ move, playerAddress }),
    });
    return res.json();
  },

  async resignGame(id: string, playerAddress: string) {
    const res = await fetch(`${BASE_URL}/games/${id}/resign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerAddress }),
    });
    return res.json();
  }
};
