// license-popup.js
// Expose API functions to the license popup window

function acceptLicense() {
  if (window.electronAPI && window.electronAPI.acceptLicense) {
    window.electronAPI.acceptLicense()
  }
}

function viewMore() {
  if (window.electronAPI && window.electronAPI.viewFullLicense) {
    window.electronAPI.viewFullLicense()
  }
}

function openFullLicense() {
  if (window.electronAPI && window.electronAPI.viewFullLicense) {
    window.electronAPI.viewFullLicense()
  }
}

// Wait for DOM to be ready before attaching event listeners
document.addEventListener('DOMContentLoaded', function() {
  const acceptBtn = document.querySelector('.btn-primary')
  const viewMoreBtn = document.querySelector('.btn-secondary')

  if (acceptBtn) {
    acceptBtn.addEventListener('click', acceptLicense)
  }
  if (viewMoreBtn) {
    viewMoreBtn.addEventListener('click', viewMore)
  }
})
