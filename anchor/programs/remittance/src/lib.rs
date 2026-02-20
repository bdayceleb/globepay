use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("Remittance111111111111111111111111111111111");

#[program]
pub mod remittance {
    use super::*;

    /// Basic token transfer function that wraps the SPL Token program transfer.
    /// This allows us to track or add custom logic to remittances in the future.
    pub fn transfer_usdc(ctx: Context<TransferUsdc>, amount: u64) -> Result<()> {
        let cpi_accounts = Transfer {
            from: ctx.accounts.sender_token_account.to_account_info(),
            to: ctx.accounts.recipient_token_account.to_account_info(),
            authority: ctx.accounts.sender.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        
        token::transfer(cpi_ctx, amount)?;

        msg!("Transferred {} USDC successfully!", amount);

        Ok(())
    }
}

#[derive(Accounts)]
pub struct TransferUsdc<'info> {
    #[account(mut)]
    pub sender: Signer<'info>,

    #[account(
        mut,
        constraint = sender_token_account.owner == sender.key(),
        constraint = sender_token_account.mint == usdc_mint.key()
    )]
    pub sender_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = recipient_token_account.mint == usdc_mint.key()
    )]
    pub recipient_token_account: Account<'info, TokenAccount>,

    pub usdc_mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,
}
