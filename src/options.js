/* global browser */

(function main() {
  // todo: get this from the background script
  const model = {
    permissions: [
      {
        id: 'Hacker News',
        displayName: 'Hacker News',
        origin: '*://*.news.ycombinator.com/*',
      },
      {
        id: 'Twitter',
        displayName: 'Twitter',
        origin: '*://*.twitter.com/*',
      },
      {
        id: 'YouTube',
        displayName: 'YouTube',
        origin: '*://*.youtube.com/*',
      },
      {
        id: 'YouTube Gaming',
        displayName: 'YouTube Gaming',
        origin: '*://*.gaming.youtube.com/*',
      },
      {
        id: 'YouTube Music',
        displayName: 'YouTube Music',
        origin: '*://*.music.youtube.com/*',
      },
      {
        id: 'Reddit',
        displayName: 'Reddit',
        origin: '*://*.reddit.com/r/*',
      },
    ],
  };

  const toAdd = [];
  const toRemove = [];

  const $permissions = document.getElementById('permissions');

  let i = 1;
  model.permissions.forEach((perm) => {
    const id = `permission_${i}`;

    const $li = document.createElement('li');
    $permissions.appendChild($li);
    
    const $checkbox = document.createElement('input');
    $checkbox.id = id;
    $checkbox.type = 'checkbox';
    $li.appendChild($checkbox);

    const $label = document.createElement('label');
    $label.setAttribute('for', id);
    $label.textContent = `${perm.displayName} (${perm.origin})`;
    $li.appendChild($label);

    $checkbox.dataset.perm = perm.id;
    $checkbox.addEventListener('change', onChange);

    i += 1;
  });

  const $save = document.getElementById('save');
  $save.addEventListener('click', onSave);

  function onSave() {
    if (toAdd.length) {
      browser.permissions.request({
        origins: toAdd,
      });
      toAdd.length = 0;
    }
    
    if (toRemove.length) {
      browser.permissions.remove({
        origins: toRemove,
      });
      toRemove.length = 0;
    }
  }

  function onChange(event) {
    const $checkbox = event.currentTarget;
    const perm = model.permissions.find(perm => perm.id === $checkbox.dataset.perm);

    const insertArr = $checkbox.checked ? toAdd : toRemove;
    const unsavedArr = $checkbox.checked ? toRemove : toAdd;

    const unsavedIdx = unsavedArr.indexOf(perm.origin);
    if (unsavedIdx >= 0) {
      unsavedArr.splice(unsavedIdx, 1);
    } else {
      insertArr.push(perm.origin);
    }
  }
}());
