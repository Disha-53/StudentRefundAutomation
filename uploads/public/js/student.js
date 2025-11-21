function renderClaimCard(claim) {
  const actions = [];
  if (['SUBMITTED', 'UNDER_REVIEW'].includes(claim.status)) {
    actions.push(
      `<button class="btn-secondary" data-action="withdraw" data-id="${claim.id}">Withdraw</button>`,
    );
  }

  if (['MORE_INFO', 'ACTION_NEEDED'].includes(claim.status)) {
    actions.push(
      `<label class="btn-secondary upload-label">
        Upload additional docs
        <input type="file" name="moreDocs" data-id="${claim.id}" multiple hidden />
      </label>`,
    );
  }

  const statusLabel = claim.status.toLowerCase();
  const statusText = claim.status.replace('_', ' ').toLowerCase();

  return `
    <article class="status-card" data-id="${claim.id}">
      <header>
        <div class="status-badge" data-status="${statusLabel}">${statusText}</div>
        <strong>₹${Number(claim.amount).toFixed(2)}</strong>
      </header>
      <p>${claim.description}</p>
      <small>Last updated ${new Date(claim.updated_at).toLocaleString()}</small>
      <div class="actions">
        ${actions.join('')}
      </div>
    </article>
  `;
}

async function loadClaims() {
  const container = document.querySelector('#claimsContainer');
  if (!container) return;
  container.innerHTML = '<p>Loading your claims...</p>';
  try {
    const claims = await apiRequest('/claims');
    if (!claims.length) {
      container.innerHTML = '<p>No claims submitted yet.</p>';
      return;
    }
    container.innerHTML = claims.map(renderClaimCard).join('');
  } catch (error) {
    container.innerHTML = `<p>${error.message}</p>`;
  }
}

async function submitClaimForm(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const files = document.querySelector('#documents');
  if (files?.files) {
    [...files.files].forEach((file) => formData.append('documents', file));
  }

  try {
    await apiRequest('/claims', {
      method: 'POST',
      body: formData,
      isForm: true,
    });
    showBanner('Claim submitted!');
    form.reset();
    loadClaims();
  } catch (error) {
    showBanner(error.message, 'danger');
  }
}

async function withdrawClaim(claimId) {
  try {
    await apiRequest(`/claims/${claimId}/withdraw`, { method: 'POST' });
    showBanner('Claim withdrawn', 'warning');
    loadClaims();
  } catch (error) {
    showBanner(error.message, 'danger');
  }
}

async function uploadAdditionalDocs(claimId, files) {
  const formData = new FormData();
  [...files].forEach((file) => formData.append('documents', file));
  try {
    await apiRequest(`/claims/${claimId}/additional-docs`, {
      method: 'POST',
      body: formData,
      isForm: true,
    });
    showBanner('Documents uploaded');
    loadClaims();
  } catch (error) {
    showBanner(error.message, 'danger');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const claimForm = document.querySelector('#claimForm');
  if (claimForm) {
    claimForm.addEventListener('submit', submitClaimForm);
  }

  loadClaims();

  document.body.addEventListener('click', (event) => {
    if (event.target.matches('[data-action="withdraw"]')) {
      withdrawClaim(event.target.dataset.id);
    }
  });

  document.body.addEventListener('change', (event) => {
    if (event.target.matches('input[name="moreDocs"]')) {
      uploadAdditionalDocs(event.target.dataset.id, event.target.files);
    }
  });
});

