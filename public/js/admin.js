const ACTION_LABELS = {
  APPROVE: 'Approve',
  REQUEST_INFO: 'Request More Info',
  REJECT: 'Reject',
  COMPLETE: 'Mark Complete',
};

async function loadAdminClaims() {
  const container = document.querySelector('#adminClaims');
  if (!container) return;
  container.innerHTML = '<p>Loading claims...</p>';
  try {
    const claims = await apiRequest('/claims/admin/pending?status=SUBMITTED,UNDER_REVIEW,MORE_INFO');
    if (!claims.length) {
      container.innerHTML = '<p>No claims awaiting action.</p>';
      return;
    }
    container.innerHTML = claims
      .map(
        (claim) => `
      <div class="status-card">
        <header>
          <strong>${claim.student_name}</strong>
          <div class="status-badge" data-status="${claim.status.toLowerCase()}">${claim.status
            .replace('_', ' ')
            .toLowerCase()}</div>
        </header>
        <p>${claim.description}</p>
        <p><small>Amount: ₹${Number(claim.amount).toFixed(2)}</small></p>
        <textarea placeholder="Add comment" data-comment="${claim.id}"></textarea>
        <div class="actions">
          ${Object.entries(ACTION_LABELS)
            .map(
              ([action, label]) =>
                `<button data-action="${action}" data-id="${claim.id}">${label}</button>`,
            )
            .join('')}
        </div>
      </div>
    `,
      )
      .join('');
  } catch (error) {
    container.innerHTML = `<p>${error.message}</p>`;
  }
}

async function updateClaimStatus(claimId, action, comment) {
  try {
    await apiRequest(`/claims/${claimId}/status`, {
      method: 'PATCH',
      body: { action, comment },
    });
    showBanner(`Claim ${action.toLowerCase()}d`);
    loadAdminClaims();
  } catch (error) {
    showBanner(error.message, 'danger');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadAdminClaims();

  document.body.addEventListener('click', (event) => {
    if (event.target.matches('[data-action]') && event.target.closest('#adminClaims')) {
      const { action, id } = event.target.dataset;
      const commentField = document.querySelector(`textarea[data-comment="${id}"]`);
      updateClaimStatus(id, action, commentField?.value || '');
    }
  });
});

