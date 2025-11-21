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
  // client-side validation for account number and IFSC
  const accountNumber = form.querySelector('input[name="account_number"]')?.value?.trim();
  const ifscCode = form.querySelector('input[name="ifsc_code"]')?.value?.trim();
  const phoneNumber = form.querySelector('input[name="phone_number"]')?.value?.trim();
  const accValid = /^[0-9]{9,18}$/.test(accountNumber);
  const ifscValid = /^[A-Za-z]{4}0[A-Za-z0-9]{6}$/.test(ifscCode);
  const phoneValid = /^[0-9]{7,15}$/.test(phoneNumber);
  if (!accValid || !ifscValid) {
    showBanner(
      `Validation error: ${!accValid ? 'Account number must be 9-18 digits.' : ''} ${!ifscValid ? 'IFSC must be 11 chars (4 letters, 0, 6 alnum).' : ''} ${!phoneValid ? 'Phone must be 7-15 digits.' : ''}`,
      'danger',
    );
    return;
  }

  const formData = new FormData(form);
  // If user selected 'Other' for purpose, replace the purpose value with the custom text
  const purposeSelect = form.querySelector('select[name="purpose"]');
  const purposeOther = form.querySelector('input[name="purpose_other"]');
  if (purposeSelect && purposeSelect.value === 'Other') {
    const otherVal = purposeOther?.value?.trim();
    if (!otherVal) {
      showBanner('Please specify the other purpose', 'danger');
      return;
    }
    formData.set('purpose', otherVal);
  }
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
    const purposeSelect = document.querySelector('select[name="purpose"]');
    const purposeOtherInput = document.querySelector('#purposeOther');
    if (purposeSelect && purposeOtherInput) {
      purposeSelect.addEventListener('change', (e) => {
        if (e.target.value === 'Other') {
          purposeOtherInput.style.display = 'block';
          purposeOtherInput.required = true;
        } else {
          purposeOtherInput.style.display = 'none';
          purposeOtherInput.required = false;
        }
      });
    }
  if (claimForm) {
    // Prevent non-students from submitting the claim form
    try {
      const user = getCurrentUser();
      if (!user || user.role !== 'STUDENT') {
        const banner = document.querySelector('.notification-banner');
        if (banner) {
          banner.textContent = 'Only students can submit claims. Please login with a student account.';
          banner.dataset.variant = 'warning';
          banner.classList.add('show');
        }
        claimForm.querySelectorAll('input, textarea, select, button').forEach((el) => (el.disabled = true));
      } else {
          claimForm.addEventListener('submit', submitClaimForm);
      }
    } catch (e) {
      claimForm.addEventListener('submit', submitClaimForm);
    }
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

  // adjust FormData for 'Other' purpose before creating the FormData in submit handler
  // (we use FormData.set in submitClaimForm so nothing else needed here)

