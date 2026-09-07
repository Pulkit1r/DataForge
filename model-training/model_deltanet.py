"""
Model B — Linear-attention / DeltaNet-style model with FIXED-SIZE recurrent state.

'Memory' = a fixed d_state × d_state matrix updated via additive outer-product
writes at every step.  State size is CONSTANT regardless of sequence length.

Update rule (per layer, per step):
    k_t = φ(W_k x_t)              # key projection + feature map
    v_t = W_v x_t                  # value projection
    q_t = φ(W_q x_t)              # query projection + feature map
    S_t = S_{t-1} + v_t ⊗ k_t     # additive outer-product write (fixed-size!)
    o_t = S_t  q_t                 # readout

where φ = elu(·) + 1  (ensures non-negative attention weights).
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import List, Optional, Tuple, Union


def elu_feature_map(x: torch.Tensor) -> torch.Tensor:
    """ELU + 1 feature map  →  always positive."""
    return F.elu(x) + 1.0


class LinearAttention(nn.Module):
    """Fixed-size-state linear attention.

    During training we use the *parallel* form (equivalent, but GPU-friendly).
    When ``return_states=True`` we additionally compute the cumulative state
    matrices (for the StateMicroscope visualisation).
    """

    def __init__(self, d_model: int, d_state: int):
        super().__init__()
        self.d_state = d_state
        self.W_q = nn.Linear(d_model, d_state)
        self.W_k = nn.Linear(d_model, d_state)
        self.W_v = nn.Linear(d_model, d_state)
        self.W_o = nn.Linear(d_state, d_model)

    def forward(
        self,
        x: torch.Tensor,
        return_states: bool = False,
    ) -> Tuple[torch.Tensor, Optional[torch.Tensor]]:
        """
        Args:
            x: (B, T, d_model)
            return_states: if True, also return cumulative state matrices

        Returns:
            output: (B, T, d_model)
            states: (B, T, d_state, d_state) or None
        """
        B, T, _ = x.shape

        Q = elu_feature_map(self.W_q(x))        # (B, T, d_state)
        K = elu_feature_map(self.W_k(x))        # (B, T, d_state)
        V = self.W_v(x)                          # (B, T, d_state)

        # ── Parallel form of causal linear attention ──
        # attn[b, t, s] = Q[b,t] · K[b,s]  for s ≤ t
        attn = torch.bmm(Q, K.transpose(1, 2))                 # (B, T, T)
        causal = torch.tril(torch.ones(T, T, device=x.device))  # lower-tri mask
        attn = attn * causal

        O = torch.bmm(attn, V)                                  # (B, T, d_state)
        output = self.W_o(O)

        # ── Optional: compute cumulative state matrices for visualisation ──
        states = None
        if return_states:
            # v_t ⊗ k_t  →  (B, T, d_state, 1) * (B, T, 1, d_state)
            outer = V.unsqueeze(-1) * K.unsqueeze(-2)  # (B, T, d_v, d_k)
            states = torch.cumsum(outer, dim=1)         # (B, T, d_v, d_k)

        return output, states


class LinearAttentionBlock(nn.Module):
    """Pre-norm block: LN → LinearAttn → residual → LN → FFN → residual."""

    def __init__(self, d_model: int, d_state: int, d_ff: int):
        super().__init__()
        self.ln1  = nn.LayerNorm(d_model)
        self.attn = LinearAttention(d_model, d_state)
        self.ln2  = nn.LayerNorm(d_model)
        self.ffn  = nn.Sequential(
            nn.Linear(d_model, d_ff),
            nn.GELU(),
            nn.Linear(d_ff, d_model),
        )

    def forward(
        self,
        x: torch.Tensor,
        return_states: bool = False,
    ) -> Tuple[torch.Tensor, Optional[torch.Tensor]]:
        attn_out, states = self.attn(self.ln1(x), return_states)
        x = x + attn_out
        x = x + self.ffn(self.ln2(x))
        return x, states


class DeltaNetModel(nn.Module):
    """Small linear-attention model with fixed-size recurrent state.

    Architecture mirrors TransformerModel but replaces softmax attention
    with additive linear attention (outer-product state update).

    Parameters
    ----------
    vocab_size   : total vocabulary including special tokens (default 130)
    d_model      : hidden / embedding dimension
    d_state      : state-matrix dimension  →  state is d_state × d_state
    d_ff         : feed-forward inner dimension
    n_layers     : number of LinearAttentionBlocks
    max_seq_len  : maximum sequence length for positional embeddings
    """

    def __init__(
        self,
        vocab_size:  int = 130,
        d_model:     int = 64,
        d_state:     int = 32,
        d_ff:        int = 128,
        n_layers:    int = 2,
        max_seq_len: int = 260,
    ):
        super().__init__()
        self.d_model  = d_model
        self.d_state  = d_state
        self.n_layers = n_layers

        self.tok_emb = nn.Embedding(vocab_size, d_model)
        self.pos_emb = nn.Embedding(max_seq_len, d_model)
        self.blocks  = nn.ModuleList(
            [LinearAttentionBlock(d_model, d_state, d_ff) for _ in range(n_layers)]
        )
        self.ln_f = nn.LayerNorm(d_model)
        self.head = nn.Linear(d_model, vocab_size, bias=False)

        self.apply(self._init_weights)

    # ------------------------------------------------------------------
    @staticmethod
    def _init_weights(module):
        if isinstance(module, nn.Linear):
            nn.init.xavier_uniform_(module.weight)
            if module.bias is not None:
                nn.init.zeros_(module.bias)
        elif isinstance(module, nn.Embedding):
            nn.init.normal_(module.weight, std=0.02)

    # ------------------------------------------------------------------
    def forward(
        self,
        x: torch.Tensor,
        return_states: bool = False,
    ) -> Union[torch.Tensor, Tuple[torch.Tensor, List[torch.Tensor]]]:
        """
        Args:
            x: (batch, seq_len) token IDs
            return_states: if True, returns (logits, list-of-layer-states)

        Returns:
            logits only (default), or (logits, all_layer_states)
        """
        B, T = x.shape
        pos = torch.arange(T, device=x.device).unsqueeze(0)
        h = self.tok_emb(x) + self.pos_emb(pos)

        all_states: List[torch.Tensor] = []
        for block in self.blocks:
            h, states = block(h, return_states)
            if states is not None:
                all_states.append(states)

        h = self.ln_f(h)
        logits = self.head(h)

        if return_states:
            return logits, all_states
        return logits

    # ------------------------------------------------------------------
    def get_state_size(self) -> int:
        """Total state size in float32 values — CONSTANT regardless of N."""
        return self.n_layers * self.d_state * self.d_state
